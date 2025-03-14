using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DocManagementBackend.Data;
using DocManagementBackend.Models;
using System.Security.Claims;

namespace DocManagementBackend.Controllers {
    [Authorize(Roles = "Admin")]
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase {
        private readonly ApplicationDbContext _context;
        public AdminController(ApplicationDbContext context) {_context = context;}

        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers() {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized("User is not authenticated.");
            int userId = int.Parse(userIdClaim);
            var users = await _context.Users
                .Include(u => u.Role).Where(u => u.Id != userId).ToListAsync();
            return Ok(users);
        }

        [HttpGet("users/{id}")]
        public async Task<IActionResult> GetUser(int id) {
            var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == id);
            if (user == null)
                return NotFound("User not found.");
            return Ok(user);
        }

        [HttpPost("users")]
        public async Task<IActionResult> CreateUser([FromBody] AdminCreateUserRequest request) {
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                return BadRequest("Email is already in use.");
            if (await _context.Users.AnyAsync(u => u.Username == request.Username))
                return BadRequest("Username is already in use.");

            int roleId = 0;
            if (request.RoleName == "Admin") {roleId = 1;}
            if (request.RoleName == "SimpleUser") {roleId = 2;}
            if (request.RoleName == "FullUser") {roleId = 3;}

            var role = await _context.Roles.FindAsync(roleId);
            if (role == null)
                return BadRequest("Invalid RoleName.");

            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.PasswordHash);

            var newUser = new User {Email = request.Email,
                Username = request.Username, PasswordHash = hashedPassword,
                FirstName = request.FirstName, LastName = request.LastName,
                IsEmailConfirmed = true, IsActive = true,
                CreatedAt = DateTime.UtcNow, RoleId = roleId};

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUser), new { id = newUser.Id }, new {
                newUser.Id, newUser.Username,
                newUser.Email, newUser.FirstName,
                newUser.LastName, Role = role.RoleName,
                newUser.IsActive, newUser.CreatedAt});
        }

        [HttpPut("users/{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] AdminUpdateUserRequest request) {
            // Console.ForegroundColor = ConsoleColor.Green;
            // Console.WriteLine($"=== request Users === {request.RoleName}");
            // Console.ResetColor();
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
                if (request.RoleName == "Admin") {roleId = 1;}
                if (request.RoleName == "SimpleUser") {roleId = 2;}
                if (request.RoleName == "FullUser") {roleId = 3;}
                var role = await _context.Roles.FindAsync(roleId);
                if (role == null)
                    return BadRequest("Invalid RoleName.");
                user.RoleId = role.Id; user.Role = role;
            }

            await _context.SaveChangesAsync();
            return Ok("User updated successfully.");
        }

        private bool IsValidPassword(string password) {
            return password.Length >= 8 && password.Any(char.IsLower) &&
                   password.Any(char.IsUpper) && password.Any(char.IsDigit) &&
                   password.Any(ch => !char.IsLetterOrDigit(ch));}

        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(int id) {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound("User not found.");
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return Ok("User deleted successfully.");
        }

        [HttpDelete("delete-users")]
        public async Task<IActionResult> DeleteUsers([FromBody] List<int> userIds)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized("User ID claim is missing.");
            if (userIds == null || !userIds.Any())
                return BadRequest("No user IDs provided.");
            var usersToDelete = await _context.Users.Where(u => userIds.Contains(u.Id)).ToListAsync();
            if (!usersToDelete.Any())
                return NotFound("No users found with the provided IDs.");
            int currentUserId = int.Parse(userIdClaim);
            usersToDelete.RemoveAll(u => u.Id == currentUserId);
            _context.Users.RemoveRange(usersToDelete);
            await _context.SaveChangesAsync();
            return Ok($"{usersToDelete.Count} Users Deleted Successfully.");
        }
    }
}
