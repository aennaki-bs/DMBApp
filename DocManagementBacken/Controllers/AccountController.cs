using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DocManagementBackend.Data;
using DocManagementBackend.Models;
using System.Security.Claims;
using DocManagementBackend.utils;

namespace DocManagementBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase {
        private readonly ApplicationDbContext _context;
        public AccountController(ApplicationDbContext context) {
            _context = context;
        }

        [Authorize]
        [HttpGet("user-info")]
        public async Task<IActionResult> GetUserInfo()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized("User ID claim is missing.");
            if (!int.TryParse(userIdClaim, out var userId))
                return BadRequest("Invalid user ID.");

            var user = await _context.Users
                .Include(u => u.Role) // Include the Role navigation property
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return NotFound("User not found.");

            // Return the required user data
            var userInfo = new {
                userid = user.Id,
                username = user.Username,
                email = user.Email,
                role = user.Role?.RoleName ?? "SimpleUser",
                firstName = user.FirstName,
                lastName = user.LastName,
                isActive = user.IsActive,
            };

            return Ok(userInfo);
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null)
                return NotFound("No user found with that email address.");
            if (!user.IsEmailConfirmed)
                return Unauthorized("Email Not Verified!");
            if (!user.IsActive)
                return Unauthorized("User Account Desactivated!");

            var Password = PasswordGenerator.GenerateRandomPassword();
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(Password);

            SendEmail(user.Email, "Password Reset", $"{Password} Is your password. YOU NEED TO CHANGE IT LATER!");
            await _context.SaveChangesAsync();
            return Ok("A New Password Is Sent To Your Email.");
        }

        [Authorize]
        [HttpPut("update-profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request) {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized("User ID claim is missing.");

            int userId = int.Parse(userIdClaim);
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound("User not found.");

            user.FirstName = request.FirstName ?? user.FirstName;
            user.LastName = request.LastName ?? user.LastName;
            user.ProfilePicture = request.ProfilePicture ?? user.ProfilePicture;
            user.BackgroundPicture = request.BackgroundPicture ?? user.BackgroundPicture;

            if (!string.IsNullOrEmpty(request.NewPassword)) {
                if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
                    return BadRequest("Current password is incorrect.");

                if (!IsValidPassword(request.NewPassword))
                    return BadRequest("New password does not meet complexity requirements.");
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            }

            await _context.SaveChangesAsync();
            return Ok("Profile updated successfully.");
        }

        private bool IsValidPassword(string password) {
            return password.Length >= 8 &&
                   password.Any(char.IsLower) &&
                   password.Any(char.IsUpper) &&
                   password.Any(char.IsDigit) &&
                   password.Any(ch => !char.IsLetterOrDigit(ch));
        }
        
        private void SendEmail(string to, string subject, string body) {
            string? emailAddress = Environment.GetEnvironmentVariable("EMAIL_ADDRESS");
            string? emailPassword = Environment.GetEnvironmentVariable("EMAIL_PASSWORD");

            if (string.IsNullOrEmpty(emailAddress) || string.IsNullOrEmpty(emailPassword))
                throw new InvalidOperationException("Email address or password is not set in environment variables.");

            using (var smtp = new System.Net.Mail.SmtpClient("smtp.gmail.com", 587)) {
                smtp.Credentials = new System.Net.NetworkCredential(emailAddress, emailPassword);
                smtp.EnableSsl = true;

                var message = new System.Net.Mail.MailMessage();
                message.To.Add(to);
                message.Subject = subject;
                message.Body = body;
                message.IsBodyHtml = true;
                message.From = new System.Net.Mail.MailAddress(emailAddress);

                smtp.Send(message);
            }
        }
    }
}