using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DocManagementBackend.Data;
using DocManagementBackend.Models;

namespace DocManagementBackend.Controllers
{
    [Authorize(Roles = "Admin")]
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public AdminController(ApplicationDbContext context) {
            _context = context;
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers() {
            var users = await _context.Users.Include(u => u.Role).ToListAsync();
            return Ok(users);
        }

        [HttpGet("users/{id}")]
        public async Task<IActionResult> GetUser(int id) {
            var user = await _context.Users.Include(u => u.Role)
                                           .FirstOrDefaultAsync(u => u.Id == id);
            if (user == null)
                return NotFound("User not found.");
            return Ok(user);
        }

        [HttpPut("users/{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] AdminUpdateUserRequest request) {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound("User not found.");

            if (request.FirstName != null)
                user.FirstName = request.FirstName;
            if (request.LastName != null)
                user.LastName = request.LastName;
            if (request.IsEmailConfirmed.HasValue)
                user.IsEmailConfirmed = request.IsEmailConfirmed.Value;
            if (request.IsActive.HasValue)
                user.IsActive = request.IsActive.Value;
            if (request.RoleId.HasValue) {
                var role = await _context.Roles.FindAsync(request.RoleId.Value);
                if (role == null)
                    return BadRequest("Invalid RoleId.");
                user.RoleId = role.Id;
                user.Role = role;
            }

            await _context.SaveChangesAsync();
            return Ok("User updated successfully.");
        }

        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(int id) {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound("User not found.");

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return Ok("User deleted successfully.");
        }

        [HttpGet("documents")]
        public async Task<IActionResult> GetAllDocuments() {
            var documents = await _context.Documents.Include(d => d.CreatedBy).ToListAsync();
            return Ok(documents);
        }

        [HttpGet("documents/{id}")]
        public async Task<IActionResult> GetDocument(int id) {
            var document = await _context.Documents.Include(d => d.CreatedBy)
                                                   .FirstOrDefaultAsync(d => d.Id == id);
            if (document == null)
                return NotFound("Document not found.");
            return Ok(document);
        }

        [HttpPost("documents")]
        public async Task<IActionResult> CreateDocument([FromBody] Document document) {
            document.CreatedAt = DateTime.UtcNow;
            _context.Documents.Add(document);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetDocument), new { id = document.Id }, document);
        }

        [HttpPut("documents/{id}")]
        public async Task<IActionResult> UpdateDocument(int id, [FromBody] AdminUpdateDocumentRequest request) {
            var document = await _context.Documents.FindAsync(id);
            if (document == null)
                return NotFound("Document not found.");

            if (!string.IsNullOrEmpty(request.Title))
                document.Title = request.Title;
            if (!string.IsNullOrEmpty(request.Content))
                document.Content = request.Content;
            if (request.Status.HasValue)
                document.Status = request.Status.Value;

            await _context.SaveChangesAsync();
            return Ok("Document updated successfully.");
        }

        [HttpDelete("documents/{id}")]
        public async Task<IActionResult> DeleteDocument(int id) {
            var document = await _context.Documents.FindAsync(id);
            if (document == null)
                return NotFound("Document not found.");

            _context.Documents.Remove(document);
            await _context.SaveChangesAsync();
            return Ok("Document deleted successfully.");
        }
    }
}
