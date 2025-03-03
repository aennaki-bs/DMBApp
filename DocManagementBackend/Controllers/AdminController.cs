using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DocManagementBackend.Data;
using DocManagementBackend.Models;
using System.Security.Claims;

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

        [HttpPost("users")]
        public async Task<IActionResult> CreateUser([FromBody] AdminCreateUserRequest request)
        {
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                return BadRequest("Email is already in use.");
            if (await _context.Users.AnyAsync(u => u.Username == request.Username))
                return BadRequest("Username is already in use.");

            int roleId = 0;
            if (request.RoleName == "Admin")
                roleId = 1;
            if (request.RoleName == "SimpleUser")
                roleId = 2;
            if (request.RoleName == "FullUser")
                roleId = 3;

            var role = await _context.Roles.FindAsync(roleId);
            if (role == null)
                return BadRequest("Invalid RoleName.");

            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.PasswordHash);

            var newUser = new User {
                Email = request.Email,
                Username = request.Username,
                PasswordHash = hashedPassword,
                FirstName = request.FirstName,
                LastName = request.LastName,
                IsEmailConfirmed = true,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                RoleId = roleId
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUser), new { id = newUser.Id }, new {
                newUser.Id,
                newUser.Username,
                newUser.Email,
                newUser.FirstName,
                newUser.LastName,
                Role = role.RoleName,
                newUser.IsActive,
                newUser.CreatedAt
            });
        }

        [HttpPut("users/{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] AdminUpdateUserRequest request) {
            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine($"=== request Users === {request.RoleName}");
            Console.ResetColor();
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound("User not found.");

            if (!string.IsNullOrEmpty(request.Username) && await _context.Users.AnyAsync(u => u.Email == request.Email) && user.Username != request.Username)
                return BadRequest("Email is already in use.");
            if (!string.IsNullOrEmpty(request.Email) && await _context.Users.AnyAsync(u => u.Email == request.Email) && user.Email != request.Email)
                return BadRequest("Username is already in use.");

            if (!string.IsNullOrEmpty(request.Email))
                user.Email = request.Email;
            if (!string.IsNullOrEmpty(request.Username))
                user.Username = request.Username;
            if (!string.IsNullOrEmpty(request.PasswordHash)) {
                if (!IsValidPassword(request.PasswordHash))
                    return BadRequest("Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a digit, and a special character.");
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.PasswordHash);
            }
            if (!string.IsNullOrEmpty(request.FirstName))
                user.FirstName = request.FirstName;
            if (!string.IsNullOrEmpty(request.LastName))
                user.LastName = request.LastName;
            if (request.IsEmailConfirmed.HasValue)
                user.IsEmailConfirmed = request.IsEmailConfirmed.Value;
            if (request.IsActive.HasValue)
                user.IsActive = request.IsActive.Value;
            if (!string.IsNullOrEmpty(request.RoleName)) {
                int roleId = 0;
                if (request.RoleName == "Admin")
                    roleId = 1;
                if (request.RoleName == "SimpleUser")
                    roleId = 2;
                if (request.RoleName == "FullUser")
                    roleId = 3;
                var role = await _context.Roles.FindAsync(roleId);
                if (role == null)
                    return BadRequest("Invalid RoleId.");
                user.RoleId = role.Id;
                user.Role = role;
            }

            await _context.SaveChangesAsync();
            return Ok("User updated successfully.");
        }

        private bool IsValidPassword(string password)
        {
            return password.Length >= 8 &&
                   password.Any(char.IsLower) &&
                   password.Any(char.IsUpper) &&
                   password.Any(char.IsDigit) &&
                   password.Any(ch => !char.IsLetterOrDigit(ch));
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
            var documents = await _context.Documents.Where(d => !d.IsDeleted).Include(d => d.CreatedBy).ToListAsync();
            return Ok(documents);
        }

        [HttpGet("documents/deleted")]
        public async Task<IActionResult> GetDeletedDocuments() {
            var documents = await _context.Documents.Where(d => d.IsDeleted).Include(d => d.CreatedBy).ToListAsync();
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

            // var type_id = request.TypeId;
            // if (request.TypeId.HasValue)
            //     type_id = request.TypeId?? 0;

            var docType = await _context.DocumentTypes.FirstOrDefaultAsync(t => t.Id == request.TypeId);
            if (docType == null)
                return BadRequest("check the type!!");

            var document = new Document {
                Title = request.Title,
                Content = request.Content,
                CreatedByUserId = userId,
                CreatedBy = user,
                TypeId = request.TypeId,
                DocumentType = docType,
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
                TypeId = document.TypeId,
                DocumentType = new DocumentTypeDto {TypeName = docType.TypeName},
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

        [HttpPut("documents/{id}")]
        public async Task<IActionResult> UpdateDocument(int id, [FromBody] AdminUpdateDocumentRequest request) {
            var document = await _context.Documents.FindAsync(id);
            if (document == null)
                return NotFound("Document not found.");
            if (document.IsDeleted)
                return BadRequest("Document Is Deleted!");

            if (!string.IsNullOrEmpty(request.Title))
                document.Title = request.Title;
            if (!string.IsNullOrEmpty(request.Content))
                document.Content = request.Content;
            if (request.Status.HasValue)
                document.Status = request.Status.Value;

            document.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok("Document updated successfully.");
        }

        [HttpPut("documents/recover/{id}")]
        public async Task<IActionResult> RecoverDocument(int id)
        {
            var document = await _context.Documents.FirstOrDefaultAsync(d => d.Id == id && d.IsDeleted == true);
            if (document == null)
                return NotFound("Deleted document not found.");

            document.IsDeleted = false;
            document.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        
            return Ok("Document recovered successfully.");
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
