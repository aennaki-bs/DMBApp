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
        public DocumentsController(ApplicationDbContext context) { _context = context; }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<DocumentDto>>> GetDocuments()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized("User ID claim is missing.");
            int userId = int.Parse(userIdClaim);
            var ThisUser = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId);
            if (ThisUser == null)
                return BadRequest("User not found.");
            if (!ThisUser.IsActive)
                return Unauthorized("User account is deactivated.");
            var documents = await _context.Documents.Include(d => d.CreatedBy).ThenInclude(u => u.Role)
                .Include(d => d.Lignes).Select(DocumentMappings.ToDocumentDto).ToListAsync();

            return Ok(documents);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<DocumentDto>> GetDocument(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized("User ID claim is missing.");
            int userId = int.Parse(userIdClaim);
            var ThisUser = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId);
            if (ThisUser == null)
                return BadRequest("User not found.");
            if (!ThisUser.IsActive)
                return Unauthorized("User account is deactivated.");
            var documentDto = await _context.Documents
                .Include(d => d.CreatedBy).ThenInclude(u => u.Role)
                .Where(d => d.Id == id).Include(d => d.Lignes)
                .Select(DocumentMappings.ToDocumentDto).FirstOrDefaultAsync();
            if (documentDto == null) { return NotFound("Document not found!"); }

            return Ok(documentDto);
        }

        [HttpPost]
        public async Task<ActionResult<DocumentDto>> CreateDocument([FromBody] CreateDocumentRequest request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized("User ID claim is missing.");
            int userId = int.Parse(userIdClaim);
            var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
                return BadRequest("User not found.");
            if (!user.IsActive)
                return Unauthorized("User account is deactivated.");
            if (user.Role!.RoleName != "Admin" && user.Role!.RoleName != "FullUser")
                return Unauthorized("User Not Allowed To do this action...!");
            var docType = await _context.DocumentTypes.FirstOrDefaultAsync(t => t.Id == request.TypeId);
            if (docType == null)
                return BadRequest("Invalid Document type!");
            var docDate = request.DocDate ?? DateTime.UtcNow;
            var docAlias = "D";
            if (!string.IsNullOrEmpty(request.DocumentAlias))
                docAlias = request.DocumentAlias.ToUpper();
            docType.DocumentCounter++;
            int counterValue = docType.DocumentCounter;
            string paddedCounter = counterValue.ToString("D4");
            var documentKey = $"{docType.TypeKey}{docAlias}-{paddedCounter}";
            // if (request.CircuitId.HasValue) {
                // var circuit = await _context.Circuits.FirstOrDefaultAsync(c => c.Id == request.CircuitId);
                // if (circuit == null)
                //     return BadRequest("Invalid Circuit!");
            // }
            var document = new Document
            {
                Title = request.Title,
                DocumentAlias = docAlias,
                Content = request.Content,
                CreatedByUserId = userId,
                CreatedBy = user,
                DocDate = docDate,
                TypeId = request.TypeId,
                DocumentType = docType,
                CircuitId = request.CircuitId,
                // Circuit = circuit,
                Status = 0,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                DocumentKey = documentKey
            };
            _context.Documents.Add(document);
            await _context.SaveChangesAsync();
            var documentDto = new DocumentDto
            {
                Id = document.Id,
                Title = document.Title,
                DocumentKey = document.DocumentKey,
                Content = document.Content,
                Status = document.Status,
                DocumentAlias = document.DocumentAlias,
                CreatedAt = document.CreatedAt,
                UpdatedAt = document.UpdatedAt,
                TypeId = document.TypeId,
                DocDate = document.DocDate,
                DocumentType = new DocumentTypeDto { TypeName = docType.TypeName },
                CircuitId = document.CircuitId,
                // Circuit = new CircuitDto {Title = document.Circuit!.Title},
                CreatedByUserId = document.CreatedByUserId,
                CreatedBy = new DocumentUserDto
                {
                    Username = user.Username,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Role = user.Role != null ? user.Role.RoleName : string.Empty
                }
            };
            return CreatedAtAction(nameof(GetDocument), new { id = document.Id }, documentDto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDocument(int id, [FromBody] UpdateDocumentRequest request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized("User ID claim is missing.");
            int userId = int.Parse(userIdClaim);
            var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
                return BadRequest("User not found.");
            if (!user.IsActive)
                return Unauthorized("User account is deactivated.");
            if (user.Role!.RoleName != "Admin" && user.Role!.RoleName != "FullUser")
                return Unauthorized("User Not Allowed To do this action...!");
            var document = await _context.Documents.FindAsync(id);
            if (document == null)
                return NotFound("Document not found.");
            document.Content = request.Content ?? document.Content;
            document.Title = request.Title ?? document.Title;
            document.DocDate = request.DocDate ?? DateTime.UtcNow;
            // document.TypeId = request.TypeId ?? document.TypeId;
            if (request.TypeId.HasValue)
            {
                var docType = await _context.DocumentTypes.FirstOrDefaultAsync(t => t.Id == request.TypeId);
                if (docType == null)
                    return BadRequest("Invalide type!");
                document.TypeId = request.TypeId ?? document.TypeId;
                document.DocumentType = docType;
                docType.DocumentCounter++;
                int counterValue = docType.DocumentCounter;
                string paddedCounter = counterValue.ToString("D4");
                document.DocumentKey = $"{docType.TypeKey}{document.DocumentAlias.ToUpper()}-{paddedCounter}";
            }
            if (!string.IsNullOrEmpty(request.DocumentAlias))
            {
                document.DocumentAlias = request.DocumentAlias.ToUpper();
                document.DocumentKey = $"{document.DocumentType!.TypeKey}{request.DocumentAlias.ToUpper()}-{document.DocumentType!.DocumentCounter}";
            }
            if (request.CircuitId.HasValue) {
                var circuit = await _context.Circuits.FirstOrDefaultAsync(c => c.Id == request.CircuitId);
                if (circuit == null)
                    return BadRequest("Invalid Circuit!");
                document.CircuitId = request.CircuitId;
                document.Circuit = circuit;
            }
            document.UpdatedAt = DateTime.UtcNow;
            _context.Entry(document).State = EntityState.Modified;

            try { await _context.SaveChangesAsync(); }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Documents.Any(d => d.Id == id)) { return NotFound(); }
                else { throw; }
            }
            return Ok("Document updated!");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDocument(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized("User ID claim is missing.");
            int userId = int.Parse(userIdClaim);
            var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
                return BadRequest("User not found.");
            if (!user.IsActive)
                return Unauthorized("User account is deactivated.");
            if (user.Role!.RoleName != "Admin" && user.Role!.RoleName != "FullUser")
                return Unauthorized("User Not Allowed To do this action...!");
            var document = await _context.Documents.FindAsync(id);
            if (document == null)
                return NotFound("Document not found!");

            _context.Documents.Remove(document);
            document.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok("Document deleted!");
        }

        [HttpGet("Types")]
        public async Task<ActionResult> GetTypes()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized("User ID or Role claim is missing.");
            int userId = int.Parse(userIdClaim);
            var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
                return BadRequest("User not found.");
            if (!user.IsActive)
                return Unauthorized("User account is deactivated.");
            if (user.Role!.RoleName != "Admin" && user.Role!.RoleName != "FullUser")
                return Unauthorized("User Not Allowed To do this action...!");
            var types = await _context.DocumentTypes.ToListAsync();
            return Ok(types);
        }

        [HttpPost("Types")]
        public async Task<ActionResult> CreateTypes([FromBody] DocumentTypeDto request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized("User ID claim is missing.");
            int userId = int.Parse(userIdClaim);
            var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
                return BadRequest("User not found.");
            if (!user.IsActive)
                return Unauthorized("User account is deactivated.");
            if (user.Role!.RoleName != "Admin" && user.Role!.RoleName != "FullUser")
                return Unauthorized("User not allowed to do this action.");
            if (string.IsNullOrEmpty(request.TypeName))
                return BadRequest("Type Name is required!");
            var typeNameExists = await _context.DocumentTypes.AnyAsync(t => t.TypeName == request.TypeName);
            if (typeNameExists)
                return BadRequest("Type Name already exists!");
            var typeCounter = await _context.TypeCounter.FirstOrDefaultAsync();
            if (typeCounter == null)
            {
                typeCounter = new TypeCounter { Counter = 1 };
                _context.TypeCounter.Add(typeCounter);
            }
            string baseKey = (request.TypeName.Length >= 2) ? request.TypeName.Substring(0, 2).ToUpper() : request.TypeName.ToUpper();
            bool exists = await _context.DocumentTypes.AnyAsync(t => t.TypeKey == baseKey);
            string finalTypeKey = exists ? $"{baseKey}{typeCounter.Counter++}" : baseKey;
            var type = new DocumentType
            {
                TypeKey = finalTypeKey,
                TypeName = request.TypeName,
                TypeAttr = request.TypeAttr,
                DocumentCounter = 0
            };
            _context.DocumentTypes.Add(type);
            await _context.SaveChangesAsync();
            return Ok("Type successfully added!");
        }


        [HttpPost("valide-type")]
        public async Task<IActionResult> ValideType([FromBody] DocumentTypeDto request)
        {
            var typeName = request.TypeName.ToLower();
            var type = await _context.DocumentTypes.AnyAsync(t => t.TypeName.ToLower() == typeName);
            if (type)
                return Ok("True");
            return Ok("False");
        }

        [HttpDelete("Types/{id}")]
        public async Task<IActionResult> DeleteType(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized("User ID claim is missing.");
            int userId = int.Parse(userIdClaim);
            var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
                return BadRequest("User not found.");
            if (!user.IsActive)
                return Unauthorized("User account is deactivated.");
            if (user.Role!.RoleName != "Admin" && user.Role!.RoleName != "FullUser")
                return Unauthorized("User Not Allowed To do this action...!");
            var type = await _context.DocumentTypes.FindAsync(id);
            if (type == null)
                return NotFound("No type with this id!");
            _context.DocumentTypes.Remove(type);
            await _context.SaveChangesAsync();

            return Ok("Type deleted!");
        }
    }
}
