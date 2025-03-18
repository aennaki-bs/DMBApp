using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Net.Mail;
using DocManagementBackend.Data;
using DocManagementBackend.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;

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
            _context = context; _config = config;
        }

        [HttpPost("valide-email")]
        public async Task<IActionResult> ValideEmail([FromBody] ValideUsernameRequest request)
        {
            if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                return Ok("False");
            return Ok("True");
        }

        [HttpPost("valide-username")]
        public async Task<IActionResult> ValideUsername([FromBody] ValideUsernameRequest request)
        {
            if (await _context.Users.AnyAsync(u => u.Username == request.Username))
                return Ok("False");
            return Ok("True");
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] User user)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            var existingUser = await _context.Users.AnyAsync(u => u.Email == user.Email);
            if (existingUser)
                return BadRequest("Email is already in use.");
            var existingUsername = await _context.Users.AnyAsync(u => u.Username == user.Username);
            if (existingUsername)
                return BadRequest("Username is already in use.");
            if (!IsValidPassword(user.PasswordHash))
                return BadRequest("Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a digit, and a special character.");
            var adminSecretHeader = Request.Headers["AdminSecret"].FirstOrDefault();
            if (!string.IsNullOrEmpty(adminSecretHeader))
            {
                var expectedAdminSecret = Environment.GetEnvironmentVariable("ADMIN_SECRET");
                if (adminSecretHeader == expectedAdminSecret)
                {
                    var adminRole = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == "Admin");
                    if (adminRole != null)
                    {
                        user.RoleId = adminRole.Id; user.Role = adminRole;
                    }
                }
                else
                    return Unauthorized("Invalid admin secret.");
            }
            else
            {
                var simpleUserRole = await _context.Roles.FirstOrDefaultAsync(r => r.RoleName == "SimpleUser");
                if (simpleUserRole != null)
                {
                    user.RoleId = simpleUserRole.Id; user.Role = simpleUserRole;
                }
                else
                    return BadRequest("Default role not found.");
            }
            user.EmailVerificationCode = new Random().Next(100000, 999999).ToString();
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(user.PasswordHash);
            user.IsActive = false;
            user.IsEmailConfirmed = false;
            string? frontDomain = Environment.GetEnvironmentVariable("FRONTEND_DOMAIN");
            var verificationLink = $"{frontDomain}/verify/{user.Email}";
            string emailBody = createEmailBody(verificationLink, user.EmailVerificationCode);
            try
            {
                _context.Users.Add(user);
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                SendEmail(user.Email, "Email Verification", emailBody);
                return Ok("Registration successful! Please check your email for the verification code.");
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"An error occurred. Please try again. {ex.Message}");
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
            user.IsEmailConfirmed = true;
            user.IsActive = true;
            user.IsOnline = false;
            user.EmailVerificationCode = null;
            await _context.SaveChangesAsync();

            return Ok("Email verified successfully!");
        }

        [HttpPost("clear-users")]
        public async Task<IActionResult> ClearUsers()
        {
            var users = _context.Users.Where(u => u.Email != null).ToList();
            _context.Users.RemoveRange(users);
            await _context.SaveChangesAsync();
            return Ok("All users with emails have been deleted.");
        }

        [HttpPost("clear-users/{id}")]
        public async Task<IActionResult> ClearUser(int id)
        {
            var user = _context.Users.Where(u => u.Id == id).ToList();
            _context.Users.RemoveRange(user);
            await _context.SaveChangesAsync();
            return Ok("the user have been deleted.");
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest model)
        {
            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Email == model.EmailOrUsername || u.Username == model.EmailOrUsername);
            if (user == null) {return Unauthorized("Invalid email or username.");}
            if (!BCrypt.Net.BCrypt.Verify(model.Password, user.PasswordHash))
                return Unauthorized("Invalid password.");
            if (!user.IsEmailConfirmed)
                return Unauthorized("Please verify your email before logging in.");
            if (!user.IsActive)
                return Unauthorized("User Account Is Desactivated!");
            var accessToken = GenerateAccessToken(user);
            var refreshToken = GenerateRefreshToken();
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
            user.IsOnline = true;
            var login = new LogHistory { UserId = user.Id, User = user, ActionType = 1, Timestamp = DateTime.UtcNow };
            _context.LogHistories.Add(login);
            await _context.SaveChangesAsync();
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = false,
                SameSite = SameSiteMode.None,
                Expires = DateTime.UtcNow.AddHours(3)
            };
            Response.Cookies.Append("accessToken", accessToken, cookieOptions);
            Response.Cookies.Append("refreshToken", refreshToken, cookieOptions);

            return Ok(new { accessToken, refreshToken });
        }

        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken()
        {
            var refreshToken = Request.Cookies["refresh_token"];
            if (string.IsNullOrEmpty(refreshToken))
                return Unauthorized("No refresh token provided.");
            var user = await _context.Users.FirstOrDefaultAsync(u => u.RefreshToken == refreshToken);
            if (user == null || user.RefreshTokenExpiry < DateTime.UtcNow)
                return Unauthorized("Invalid or expired refresh token.");
            var newAccessToken = GenerateAccessToken(user);
            var newRefreshToken = GenerateRefreshToken();
            user.RefreshToken = newRefreshToken;
            user.RefreshTokenExpiry = DateTime.UtcNow.AddHours(3);
            await _context.SaveChangesAsync();
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = false,
                SameSite = SameSiteMode.None,
                Expires = DateTime.UtcNow.AddDays(7)
            };
            // Response.Cookies.Append("accessToken", accessToken, cookieOptions);
            Response.Cookies.Append("refreshToken", refreshToken, cookieOptions);

            return Ok(new { accessToken = newAccessToken });
        }

        [Authorize]
        [HttpPost("logout")]
        public async Task<IActionResult> Logout([FromBody] LogoutRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == request.UserId);
            if (user == null)
                return Unauthorized("User Not Found!");
            var logEntry = new LogHistory { UserId = user.Id, User = user, Timestamp = DateTime.UtcNow, ActionType = 0 };
            _context.LogHistories.Add(logEntry);
            user.RefreshToken = null;
            user.RefreshTokenExpiry = null;
            user.IsOnline = false;
            await _context.SaveChangesAsync();
            Response.Cookies.Delete("refresh_token");

            return Ok("Logged out successfully.");
        }
        private bool IsValidPassword(string password)
        {
            return password.Length >= 8 && password.Any(char.IsLower) &&
                   password.Any(char.IsUpper) && password.Any(char.IsDigit) &&
                   password.Any(ch => !char.IsLetterOrDigit(ch));
        }
        private void SendEmail(string to, string subject, string body)
        {
            try
            {
                string? emailAddress = Environment.GetEnvironmentVariable("EMAIL_ADDRESS");
                string? emailPassword = Environment.GetEnvironmentVariable("EMAIL_PASSWORD");
                if (string.IsNullOrEmpty(emailAddress) || string.IsNullOrEmpty(emailPassword))
                    throw new InvalidOperationException("Email address or password is not set in environment variables.");
                using (var smtp = new SmtpClient("smtp.gmail.com", 587))
                {
                    smtp.Credentials = new System.Net.NetworkCredential(emailAddress, emailPassword);
                    smtp.EnableSsl = true;
                    var message = new MailMessage();
                    message.To.Add(to); message.Subject = subject;
                    message.Body = body; message.IsBodyHtml = true;
                    message.From = new MailAddress(emailAddress);
                    smtp.Send(message);
                }
            }
            catch (Exception ex) { Console.WriteLine($"Email send failed: {ex.Message}"); }
        }

        private string GenerateAccessToken(User user)
        {
            var jwtSettings = _config.GetSection("JwtSettings");
            var secretKey = jwtSettings["SecretKey"];
            if (string.IsNullOrEmpty(secretKey))
                throw new InvalidOperationException("JWT configuration is missing.");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var claims = new[] {new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim("Username", user.Username),
                new Claim("IsActive", user.IsActive.ToString()),
                new Claim(ClaimTypes.Role, user.Role?.RoleName ?? "SimpleUser")};
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expMinutes = jwtSettings["ExpiryMinutes"];
            if (string.IsNullOrEmpty(expMinutes))
                throw new InvalidOperationException("ExpiryMinutes is missing.");
            var token = new JwtSecurityToken(issuer: jwtSettings["Issuer"],
                audience: jwtSettings["Audience"], claims: claims,
                expires: DateTime.UtcNow.AddMinutes(int.Parse(expMinutes)),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
        private string GenerateRefreshToken()
        {
            return Convert.ToBase64String(Guid.NewGuid().ToByteArray());
        }
        private string createEmailBody(string verificationLink, string verificationCode)
        {
            return $@"
                <html><head><style>
                        body {{font-family: Arial, sans-serif; line-height: 1.6; color: #fff; width: 100vw; height: 80vh; align-items: center;
                            background-color: #333333; margin: 0; padding: 0; display: flex; justify-content: center; color:white;}}
                        h2 {{font-size: 24px; color: #c3c3c7;}}
                        p {{color: #c3c3c7; margin: 0 0 20px;}}
                        .button {{display: inline-block; padding: 10px 20px; margin: 20px 0; font-size: 16px;
                            color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px;}}
                        .button:hover {{background-color: rgb(6, 75, 214);}}
                        .footer {{margin-top: 20px; font-size: 12px; color: #f8f6f6;}}
                        span {{display: inline-block; font-size: 1rem; font-weight: bold; color: #2d89ff;
                            background: #f0f6ff; padding: 10px 10px; border-radius: 8px; letter-spacing: 3px;
                            font-family: monospace; border: 2px solid #ffffff; margin: 5px;}}
                        .card {{padding: 20px; background-color: #555555; margin: auto; border-radius: 12px;
                            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); color: #c3c3c7;}}
                    </style></head>
                <body><div class='card'>
                        <h2>Email Verification</h2>
                        <p>Thank you for registering with us! To complete your registration, please
                            verify your email address, your verification code is
                            <br /><span>{verificationCode}</span> <br />
                            by clicking the button below you will be redirected to the verification
                            page:</p>
                        <a href='{verificationLink}' class='button'>Verify Email</a>
                        <p>If the button doesn't work, you can also copy and paste the following
                            link into your browser:</p>
                        <p><a href='{verificationLink}'>{verificationLink}</a></p>
                        <div class='footer'><p>If you did not request this verification, please ignore this email.</p>
                        </div></div></body></html>";
        }
    }
}
