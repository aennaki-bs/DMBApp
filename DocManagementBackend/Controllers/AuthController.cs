using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Net.Mail;
using DocManagementBackend.Data;
using DocManagementBackend.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
// using BCrypt.Net;

namespace DocManagementBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _config;

        public AuthController(ApplicationDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] User user)
        {
            if (await _context.Users.AnyAsync(u => u.Email == user.Email))
                return BadRequest("Email is already in use.");

            if (await _context.Users.AnyAsync(u => u.Username == user.Username))
                return BadRequest("Username is already in use.");

            if (!IsValidPassword(user.PasswordHash))
                return BadRequest("Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a digit, and a special character.");

            // Generate a 6-digit email verification code
            user.EmailVerificationCode = new Random().Next(100000, 999999).ToString();
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(user.PasswordHash); // Hash password
            user.IsActive = false;
            user.IsEmailConfirmed = false;

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Send email with verification code
            SendEmail(user.Email, "Email Verification", $"Your verification code is: {user.EmailVerificationCode}");

            return Ok("Registration successful! Please check your email for the verification code.");
        }

        private bool IsValidPassword(string password)
        {
            return password.Length >= 8 &&
                   password.Any(char.IsLower) &&
                   password.Any(char.IsUpper) &&
                   password.Any(char.IsDigit) &&
                   password.Any(ch => !char.IsLetterOrDigit(ch));
        }


        private void SendEmail(string to, string subject, string body)
        {
            string? emailAddress = Environment.GetEnvironmentVariable("EMAIL_ADDRESS");
            string? emailPassword = Environment.GetEnvironmentVariable("EMAIL_PASSWORD");

            if (string.IsNullOrEmpty(emailAddress) || string.IsNullOrEmpty(emailPassword)){
                throw new InvalidOperationException("Email address or password is not set in environment variables.");
            }

            using (var smtp = new SmtpClient("smtp.gmail.com", 587))
            {
                smtp.Credentials = new System.Net.NetworkCredential(emailAddress, emailPassword);
                smtp.EnableSsl = true;

                var message = new MailMessage();
                message.To.Add(to);
                message.Subject = subject;
                message.Body = body;
                message.IsBodyHtml = true;
                message.From = new MailAddress(emailAddress);

                smtp.Send(message);
            }
        }
        [HttpPost("verify-email")]
        public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null)
                return NotFound("User not found.");

            if (user.EmailVerificationCode != request.VerificationCode)
                return BadRequest("Invalid verification code.");

            // Mark email as confirmed
            user.IsEmailConfirmed = true;
            user.IsActive = true; // Activate account after verification
            user.EmailVerificationCode = null; // Clear token after use

            await _context.SaveChangesAsync();

            return Ok("Email verified successfully!");
        }

        public class VerifyEmailRequest
        {
            public string? Email { get; set; }
            public string? VerificationCode { get; set; }
        }

        [HttpPost("clear-users")]
        public async Task<IActionResult> ClearUsers()
        {
            var users = _context.Users.Where(u => u.Email != null).ToList();
            _context.Users.RemoveRange(users);
            await _context.SaveChangesAsync();
            return Ok("All users with emails have been deleted.");
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest model)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == model.EmailOrUsername || u.Username == model.EmailOrUsername);

            if (user == null || !BCrypt.Net.BCrypt.Verify(model.Password, user.PasswordHash))
                return Unauthorized("Invalid credentials");

            if (!user.IsEmailConfirmed)
                return Unauthorized("Please verify your email before logging in.");

            // Log user login
            var logEntry = new LogHistory
            {
                UserId = user.Id,
                User = user,
                Timestamp = DateTime.UtcNow,
                ActionType = 1 // Login action
            };
            _context.LogHistories.Add(logEntry);
            user.LastLogin = DateTime.UtcNow;
            _context.SaveChanges();

            var token = GenerateJwtToken(user);
            return Ok(new { Token = token });
        }

        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _config.GetSection("JwtSettings");
            var secretKey = jwtSettings["SecretKey"];
            if (string.IsNullOrEmpty(secretKey)) {
                throw new InvalidOperationException("JWT configuration is missing.");
            }
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim("Username", user.Username)
            };

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expMinutes = jwtSettings["ExpiryMinutes"];
            if (string.IsNullOrEmpty(expMinutes)) {
                throw new InvalidOperationException("ExpiryMinutes is missing.");
            }

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(int.Parse(expMinutes)),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout([FromBody] LogoutRequest model)
        {
            try
            {
                // Find the user by ID
                var user = await _context.Users.FindAsync(model.UserId);
                if (user == null)
                {
                    return NotFound(new { message = "User not found." });
                }

                // Log the logout event
                var logHistory = new LogHistory
                {
                    UserId = model.UserId,
                    User = user,
                    Timestamp = DateTime.UtcNow,
                    ActionType = 0 // 0 = Logout
                };

                _context.LogHistories.Add(logHistory);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Logout recorded successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred.", error = ex.Message });
            }
        }


    }
}

public class LoginRequest
{
    public string EmailOrUsername { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class LogoutRequest
{
    public int UserId { get; set; }
}
