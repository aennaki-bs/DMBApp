using Microsoft.AspNetCore.Mvc;
using DocManagementBackend.Models;
using DocManagementBackend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using DocManagementBackend.Mappings;

namespace DocManagementBackend.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class DocumentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DocumentsController(ApplicationDbContext context) {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<DocumentDto>>> GetDocuments()
        {
            var isActiveClaim = User.FindFirst("IsActive")?.Value;
            if (isActiveClaim == null || isActiveClaim.Equals("False", StringComparison.OrdinalIgnoreCase))
                return Unauthorized("User Account Desactivated!");

            var documents = await _context.Documents.Where(d => !d.IsDeleted)
                .Include(d => d.CreatedBy)
                    .ThenInclude(u => u.Role)
                .Select(DocumentMappings.ToDocumentDto)
                .ToListAsync();

            return Ok(documents);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<DocumentDto>> GetDocument(int id)
        {
            var isActiveClaim = User.FindFirst("IsActive")?.Value;
            if (isActiveClaim == null || isActiveClaim.Equals("False", StringComparison.OrdinalIgnoreCase))
                return Unauthorized("User Account Deactivated!");

            var documentDto = await _context.Documents.Where(d => !d.IsDeleted)
                .Include(d => d.CreatedBy)
                    .ThenInclude(u => u.Role)
                .Where(d => d.Id == id)
                .Select(DocumentMappings.ToDocumentDto)
                .FirstOrDefaultAsync();

            if (documentDto == null)
                return NotFound();

            return Ok(documentDto);
        }


        [HttpPost]
        public async Task<ActionResult<DocumentDto>> CreateDocument([FromBody] CreateDocumentRequest request) {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;

            if (userIdClaim == null || roleClaim == null)
                return Unauthorized("User ID or Role claim is missing.");

            int userId = int.Parse(userIdClaim);

            var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
                return BadRequest("User not found.");

            if (!user.IsActive)
                return Unauthorized("User account is deactivated.");

            if (roleClaim != "Admin" && roleClaim != "FullUser")
                return Unauthorized("User Not Allowed To Create Documents.");

            var docType = await _context.DocumentTypes.FirstOrDefaultAsync(t => t.Id == request.TypeId);
            if (docType == null)
                return BadRequest("check the type!!");

            var docDate = DateTime.UtcNow;
            if (request.DocDate != default(DateTime))
                docDate = request.DocDate;

            var document = new Document {Title = request.Title,
                Content = request.Content, CreatedByUserId = userId,
                CreatedBy = user, DocDate = docDate,
                TypeId = request.TypeId, DocumentType = docType,
                Status = 0, CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow};

            _context.Documents.Add(document);
            await _context.SaveChangesAsync();

            var documentDto = new DocumentDto {
                Id = document.Id, Title = document.Title,
                Content = document.Content, Status = document.Status,
                CreatedAt = document.CreatedAt, UpdatedAt = document.UpdatedAt,
                TypeId = document.TypeId, DocDate = document.DocDate,
                DocumentType = new DocumentTypeDto { TypeName = docType.TypeName },
                CreatedByUserId = document.CreatedByUserId,
                CreatedBy = new DocumentUserDto {
                    Username = user.Username, FirstName = user.FirstName, LastName = user.LastName,
                    Role = user.Role != null ? user.Role.RoleName : string.Empty
                }};
            return CreatedAtAction(nameof(GetDocument), new { id = document.Id }, documentDto);
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDocument(int id, [FromBody] UpdateDocumentRequest request) {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;
            if (userIdClaim == null || roleClaim == null)
                return Unauthorized("User ID or Role claim is missing.");

            if (roleClaim != "Admin" && roleClaim != "FullUser")
                return Unauthorized("User Not Allowed To EditDocuments.");
        
            var IsActiveClaim =  User.FindFirst("IsActive")?.Value;
            if (IsActiveClaim == null || IsActiveClaim == "False")
                return Unauthorized("User Account Desactivated!");
        
            var existingDocument = await _context.Documents.FindAsync(id);
            if (existingDocument == null)
                return NotFound("Document not found.");
            if (existingDocument.Status == 1)
                return BadRequest("This Document can't be changed!");

            if (!string.IsNullOrEmpty(request.Title))
                existingDocument.Title = request.Title;
            if (!string.IsNullOrEmpty(request.Content))
                existingDocument.Content = request.Content;
            if (!request.DocDate.HasValue)
                existingDocument.DocDate = request.DocDate?? DateTime.UtcNow;
            if (request.TypeId.HasValue)
                existingDocument.TypeId = request.TypeId.Value;

            var docType = await _context.DocumentTypes.FirstOrDefaultAsync(t => t.Id == request.TypeId);
            if (docType == null)
                return BadRequest("check the type!!");
            existingDocument.DocumentType = docType;
            existingDocument.UpdatedAt = DateTime.UtcNow; 
            _context.Entry(existingDocument).State = EntityState.Modified;
        
            try {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException) {
                if (!_context.Documents.Any(d => d.Id == id))
                    return NotFound();
                else
                    throw;
            }
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDocument(int id)
        {
            var IsActiveClaim =  User.FindFirst("IsActive")?.Value;
            if (IsActiveClaim == null || IsActiveClaim == "False")
                return Unauthorized("User Account Desactivated!");

            var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;
            if (roleClaim == null)
                return Unauthorized("Role claim is missing.");
            if (roleClaim != "Admin" && roleClaim != "FullUser")
                return Unauthorized("User Not Allowed To Delete Document.");

            var document = await _context.Documents.FindAsync(id);
            if (document == null)
                return NotFound();
            if (document.Status == 1 && roleClaim != "Admin")
                return Unauthorized("Ask an admin for deleting this document!");

            document.IsDeleted = true;
            document.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("Types")]
        public async Task<ActionResult> GetTypes() {
            var types = await _context.DocumentTypes.ToListAsync();
            return Ok(types);
        }
    }
}
