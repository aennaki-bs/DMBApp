using Microsoft.AspNetCore.Mvc;
using DocManagementBackend.Models;
using DocManagementBackend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

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
                .Select(d => new DocumentDto
                {
                    Id = d.Id,
                    Title = d.Title,
                    Content = d.Content,
                    CreatedAt = d.CreatedAt,
                    UpdatedAt = d.UpdatedAt,
                    Status = d.Status,
                    CreatedByUserId = d.CreatedByUserId,
                    CreatedBy = new DocumentUserDto
                    {
                        Email = d.CreatedBy.Email,
                        Username = d.CreatedBy.Username,
                        FirstName = d.CreatedBy.FirstName,
                        LastName = d.CreatedBy.LastName,
                        Role = d.CreatedBy.Role != null ? d.CreatedBy.Role.RoleName : string.Empty
                    }
                })
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
                .Select(d => new DocumentDto
                {
                    Id = d.Id,
                    Title = d.Title,
                    Content = d.Content,
                    CreatedAt = d.CreatedAt,
                    UpdatedAt = d.UpdatedAt,
                    Status = d.Status,
                    CreatedByUserId = d.CreatedByUserId,
                    CreatedBy = new DocumentUserDto
                    {
                        Email = d.CreatedBy.Email,
                        Username = d.CreatedBy.Username,
                        FirstName = d.CreatedBy.FirstName,
                        LastName = d.CreatedBy.LastName,
                        Role = d.CreatedBy.Role != null ? d.CreatedBy.Role.RoleName : string.Empty
                    }
                })
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

            var document = new Document {
                Title = request.Title,
                Content = request.Content,
                CreatedByUserId = userId,
                CreatedBy = user,
                Status = request.Status,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Documents.Add(document);
            await _context.SaveChangesAsync();

            var documentDto = new DocumentDto {
                Id = document.Id,
                Title = document.Title,
                Content = document.Content,
                CreatedAt = document.CreatedAt,
                UpdatedAt = document.UpdatedAt,
                Status = document.Status,
                CreatedByUserId = document.CreatedByUserId,
                CreatedBy = new DocumentUserDto {
                    Username = user.Username,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Role = user.Role != null ? user.Role.RoleName : string.Empty
                }
            };

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

            if (!string.IsNullOrEmpty(request.Title))
                existingDocument.Title = request.Title;
        
            if (!string.IsNullOrEmpty(request.Content))
                existingDocument.Content = request.Content;

            if (request.Status.HasValue)
                existingDocument.Status = request.Status.Value;

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

            document.IsDeleted = true;
            document.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
