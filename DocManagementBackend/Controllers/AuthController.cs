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

        public AuthController(ApplicationDbContext context, IConfiguration config) {
            _context = context;
            _config = config;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] User user) {
            if (await _context.Users.AnyAsync(u => u.Email == user.Email))
                return BadRequest("Email is already in use.");
            if (await _context.Users.AnyAsync(u => u.Username == user.Username))
                return BadRequest("Username is already in use.");
            if (!IsValidPassword(user.PasswordHash))
                return BadRequest("Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a digit, and a special character.");

            var adminSecretHeader = Request.Headers["AdminSecret"].FirstOrDefault();
            if (!string.IsNullOrEmpty(adminSecretHeader)) {
                var expectedAdminSecret = Environment.GetEnvironmentVariable("ADMIN_SECRET");
                if (adminSecretHeader == expectedAdminSecret) {
                    var adminRole = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == "Admin");
                    if (adminRole != null) {
                        user.RoleId = adminRole.Id;
                        user.Role = adminRole;
                    }
                }
                else
                    return Unauthorized("Invalid admin secret.");
            }
            else {
                var simpleUserRole = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == "SimpleUser");
                if (simpleUserRole != null) {
                    user.RoleId = simpleUserRole.Id;
                    user.Role = simpleUserRole;
                }
                else
                    return BadRequest("Default role not found.");
            }

            user.EmailVerificationCode = new Random().Next(100000, 999999).ToString();
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(user.PasswordHash);
            user.IsActive = false;
            user.IsEmailConfirmed = false;
        
            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            SendEmail(user.Email, "Email Verification", $"Your verification code is: {user.EmailVerificationCode}");
        
            return Ok("Registration successful! Please check your email for the verification code.");
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

            using (var smtp = new SmtpClient("smtp.gmail.com", 587)) {
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
        public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailRequest request) {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null)
                return NotFound("User not found.");
            if (user.EmailVerificationCode != request.VerificationCode)
                return BadRequest("Invalid verification code.");

            user.IsEmailConfirmed = true;
            user.IsActive = true;
            user.EmailVerificationCode = null;

            await _context.SaveChangesAsync();

            return Ok("Email verified successfully!");
        }

        public class VerifyEmailRequest {
            public string? Email { get; set; }
            public string? VerificationCode { get; set; }
        }

        [HttpPost("clear-users")]
        public async Task<IActionResult> ClearUsers() {
            var users = _context.Users.Where(u => u.Email != null).ToList();
            _context.Users.RemoveRange(users);
            await _context.SaveChangesAsync();
            return Ok("All users with emails have been deleted.");
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest model) {
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Email == model.EmailOrUsername || u.Username == model.EmailOrUsername);

            if (user == null || !BCrypt.Net.BCrypt.Verify(model.Password, user.PasswordHash))
                return Unauthorized("Invalid email or password.");
            if (!user.IsEmailConfirmed)
                return Unauthorized("Please verify your email before logging in.");       
            if (!user.IsActive)
                return Unauthorized("User Account Is Desactivated!");

            var accessToken = GenerateAccessToken(user);
            var refreshToken = GenerateRefreshToken();

            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
            await _context.SaveChangesAsync();

            Response.Cookies.Append("refresh_token", refreshToken, new CookieOptions {
                HttpOnly = true,
                Secure = false,
                SameSite = SameSiteMode.Lax,
                Expires = DateTime.UtcNow.AddDays(7)
            });

            return Ok(new { accessToken });
        }
        
        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken() {
            var refreshToken = Request.Cookies["refresh_token"];
            if (string.IsNullOrEmpty(refreshToken))
                return Unauthorized("No refresh token provided.");

            var user = await _context.Users.FirstOrDefaultAsync(u => u.RefreshToken == refreshToken);
            if (user == null || user.RefreshTokenExpiry < DateTime.UtcNow)
                return Unauthorized("Invalid or expired refresh token.");

            var newAccessToken = GenerateAccessToken(user);
            var newRefreshToken = GenerateRefreshToken();

            user.RefreshToken = newRefreshToken;
            user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
            await _context.SaveChangesAsync();

            Response.Cookies.Append("refresh_token", newRefreshToken, new CookieOptions {
                HttpOnly = true,
                Secure = false,
                SameSite = SameSiteMode.Lax,
                Expires = DateTime.UtcNow.AddDays(7)
            });

            return Ok(new { accessToken = newAccessToken });
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout() {
            var refreshToken = Request.Cookies["refresh_token"];
            if (string.IsNullOrEmpty(refreshToken))
                return Unauthorized("No refresh token found.");

            var user = await _context.Users.FirstOrDefaultAsync(u => u.RefreshToken == refreshToken);
            if (user == null)
                return Unauthorized("Invalid refresh token.");

            var logEntry = new LogHistory {
                UserId = user.Id,
                User = user,
                Timestamp = DateTime.UtcNow,
                ActionType = 0 // 0 = Logout
            };
            _context.LogHistories.Add(logEntry);

            user.RefreshToken = null;
            user.RefreshTokenExpiry = null;
            
            await _context.SaveChangesAsync();

            Response.Cookies.Delete("refresh_token");
        
            return Ok("Logged out successfully.");
        }

        private string GenerateAccessToken(User user) {
            var jwtSettings = _config.GetSection("JwtSettings");
            var secretKey = jwtSettings["SecretKey"];
            if (string.IsNullOrEmpty(secretKey)) 
                throw new InvalidOperationException("JWT configuration is missing.");

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));

            var claims = new[] {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim("Username", user.Username),
                new Claim("IsActive", user.IsActive.ToString()),
                new Claim(ClaimTypes.Role, user.Role?.RoleName ?? "SimpleUser")
            };

            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var expMinutes = jwtSettings["ExpiryMinutes"];
            if (string.IsNullOrEmpty(expMinutes))
                throw new InvalidOperationException("ExpiryMinutes is missing.");

            var token = new JwtSecurityToken(
                issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(int.Parse(expMinutes)),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private string GenerateRefreshToken() {
            return Convert.ToBase64String(Guid.NewGuid().ToByteArray());
        }
    }
}

public class LoginRequest {
    public string EmailOrUsername { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class LogoutRequest {
    public int UserId { get; set; }
}
