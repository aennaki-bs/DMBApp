using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DocManagementBackend.Data;
using DocManagementBackend.Models;
using System.Security.Claims;

namespace DocManagementBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public AccountController(ApplicationDbContext context) { _context = context; }

        [Authorize]
        [HttpGet("user-info")]
        public async Task<IActionResult> GetUserInfo()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized("User ID claim is missing.");
            if (!int.TryParse(userIdClaim, out var userId))
                return BadRequest("Invalid user ID.");

            var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
                return NotFound("User not found.");
            if (!user.IsActive)
                return Unauthorized("This account is desactivated!");
            var picture = string.Empty;
            if (!string.IsNullOrEmpty(user.ProfilePicture))
                {picture = $"{Request.Scheme}://{Request.Host}{user.ProfilePicture}";}
            var userInfo = new {userid = user.Id,
                username = user.Username, email = user.Email,
                role = user.Role?.RoleName ?? "SimpleUser",
                firstName = user.FirstName, lastName = user.LastName,
                profilePicture = picture, isActive = user.IsActive,
                address = user.Address, city = user.City, country = user.Country,
                phoneNumber = user.PhoneNumber, isOnline = user.IsOnline, //isBlocked = user.IsBlocked,
            };

            return Ok(userInfo);
        }

        [Authorize]
        [HttpGet("user-role")]
        public async Task<IActionResult> GetUserRole()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized("User ID claim is missing.");
            if (!int.TryParse(userIdClaim, out var userId))
                return BadRequest("Invalid user ID.");
            var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
                return NotFound("User not found.");
            if (!user.IsActive)
                return Unauthorized("This account is desactivated!");
            var userRole = new { role = user.Role?.RoleName ?? "SimpleUser" };

            return Ok(userRole);
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            string? frontDomain = Environment.GetEnvironmentVariable("FRONTEND_DOMAIN");
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null)
                return NotFound("No user found with that email address.");
            if (!user.IsEmailConfirmed)
                return Unauthorized("Email Not Verified!");
            if (!user.IsActive)
                return Unauthorized("User Account Desactivated!");
            var verificationLink = $"{frontDomain}/update-password/{user.Email}";
            var emailBody = createPassEmailBody(verificationLink);
            SendEmail(user.Email, "Password Reset", emailBody);
            return Ok("A Link Is Sent To Your Email.");
        }

        [HttpPut("update-password")]
        public async Task<IActionResult> UpdatePassword([FromBody] ForgotPasswordRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null)
                return NotFound("No user found with that email address.");
            if (!user.IsEmailConfirmed)
                return Unauthorized("Email Not Verified!");
            if (!user.IsActive)
                return Unauthorized("User Account Desactivated!");
            if (!IsValidPassword(request.NewPassword))
                return BadRequest("Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a digit, and a special character.");
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            await _context.SaveChangesAsync();
            return Ok("Your password is updated successfully!");
        }

        [HttpPost("resend-code")]
        public async Task<IActionResult> ResendCode([FromBody] ForgotPasswordRequest request) {
            string? frontDomain = Environment.GetEnvironmentVariable("FRONTEND_DOMAIN");
            if (string.IsNullOrEmpty(request.Email))
                return BadRequest("Email is required!");
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null)
                return NotFound("No user found with that email address.");
            var verifCode = new Random().Next(100000, 999999).ToString();
            if (string.IsNullOrEmpty(user.EmailVerificationCode))
                user.EmailVerificationCode = verifCode;
            var verificationLink = $"{frontDomain}/verify/{user.Email}";
            string emailBody = CreateEmailBody(verificationLink, user.EmailVerificationCode);
            SendEmail(user.Email, "Email Verification", emailBody);
            await _context.SaveChangesAsync();
            return Ok("A Verification Code Is reSent To Your Email.");
        }

        [Authorize]
        [HttpPut("update-profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized("User ID claim is missing.");
            int userId = int.Parse(userIdClaim);
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound("User not found.");
            if (!string.IsNullOrEmpty(request.Username) && user.Username != request.Username)
            {
                var userName = await _context.Users.AnyAsync(u => u.Username == request.Username);
                if (userName)
                    return BadRequest("Username is already in use.");
            }
            user.Username = request.Username ?? user.Username;
            user.FirstName = request.FirstName ?? user.FirstName;
            user.Address = request.Address ?? user.Address;
            user.City = request.City ?? user.City;
            user.Country = request.Country ?? user.Country;
            user.PhoneNumber = request.PhoneNumber ?? user.PhoneNumber;
            user.LastName = request.LastName ?? user.LastName;

            if (!string.IsNullOrEmpty(request.NewPassword))
            {
                if (!string.IsNullOrEmpty(request.CurrentPassword))
                {
                    if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
                        return BadRequest("Current password is incorrect.");
                }
                else { return BadRequest("Current password is required."); }

                if (!IsValidPassword(request.NewPassword))
                    return BadRequest("New password does not meet complexity requirements.");
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
            }
            await _context.SaveChangesAsync();
            return Ok("Profile updated successfully.");
        }

        [HttpPost("upload-image")]
        public async Task<IActionResult> UploadProfileImage(IFormFile file)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                    return Unauthorized("User ID claim is missing.");
                if (!int.TryParse(userIdClaim, out int userId))
                    return BadRequest("Invalid user ID format.");
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                    return NotFound("User not found.");

                if (file == null || file.Length == 0)
                    return BadRequest("No file uploaded.");
                var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/images/profile");
                if (!Directory.Exists(uploadPath))
                    Directory.CreateDirectory(uploadPath);

                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
                var fileExtension = Path.GetExtension(file.FileName).ToLower();
                if (!allowedExtensions.Contains(fileExtension))
                    return BadRequest("Invalid file type. Allowed: JPG, JPEG, PNG, GIF");
                if (file.Length > 5 * 1024 * 1024)
                    return BadRequest("File size exceeds 5MB limit");

                var oldPath = Path.Combine(Directory.GetCurrentDirectory(), "http:",
                    user.ProfilePicture!.TrimStart('/'));
                Console.WriteLine($"oldPath========>    {oldPath}");
                if (System.IO.File.Exists(oldPath))
                    System.IO.File.Delete(oldPath);

                var str = new Random().Next(10, 999).ToString();
                var fileName = $"{user.Username}{str}{fileExtension}";
                var filePath = Path.Combine(uploadPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create)) { await file.CopyToAsync(stream); }

                user.ProfilePicture = $"/images/profile/{fileName}";
                await _context.SaveChangesAsync();

                var baseUrl = $"{Request.Scheme}://{Request.Host}";
                return Ok(new { filePath = $"{baseUrl}{user.ProfilePicture}", message = "Image uploaded successfully" });
            }
            catch (Exception ex) { return StatusCode(500, $"Internal server error: {ex.Message}"); }
        }

        [HttpGet("profile-image/{userId}")]
        public async Task<IActionResult> GetProfileImage(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null || string.IsNullOrEmpty(user.ProfilePicture))
                return NotFound("Profile image not found.");
            return Ok(new { ProfilePicture = user.ProfilePicture });
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

                using (var smtp = new System.Net.Mail.SmtpClient("smtp.gmail.com", 587))
                {
                    smtp.Credentials = new System.Net.NetworkCredential(emailAddress, emailPassword);
                    smtp.EnableSsl = true;
                    var message = new System.Net.Mail.MailMessage();
                    message.To.Add(to); message.Subject = subject;
                    message.Body = body; message.IsBodyHtml = true;
                    message.From = new System.Net.Mail.MailAddress(emailAddress);
                    smtp.Send(message);
                }
            }
            catch (Exception ex)
            {
                // Log the error
                Console.WriteLine($"Email send failed: {ex.Message}");
            }
        }
        private string CreateEmailBody(string verificationLink, string verificationCode)
        {
            return $@"
                <html><head><style>
                        body {{font-family: Arial, sans-serif; line-height: 1.6;
                            color: #fff; width: 100vw; height: 80vh; background-color: #333333;
                            margin: 0; padding: 0; display: flex; justify-content: center; align-items: center;}}
                        h2 {{font-size: 24px; color: #c3c3c7;}}
                        p {{margin: 0 0 20px;}}
                        .button {{display: inline-block; padding: 10px 20px; margin: 20px 0; font-size: 16px; color: #fff;
                            background-color: #007bff; text-decoration: none; border-radius: 5px;}}
                        .button:hover {{background-color: rgb(6, 75, 214);}}
                        .footer {{margin-top: 20px; font-size: 12px; color: #f8f6f6;}}
                        span {{display: inline-block; font-size: 1.5rem; font-weight: bold; color: #2d89ff;
                            background: #f0f6ff; padding: 10px 15px; border-radius: 8px; letter-spacing: 3px;
                            font-family: monospace; border: 2px solid #ffffff; margin: 5px;}}
                        .card {{padding: 20px; width: 50%; background-color: #555555;
                            margin: auto; border-radius: 12px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);}}
                    </style></head>
                <body><div class='card'><h2>Email Verification</h2>
                        <p>Thank you for registering with us! To complete your registration, please
                            verify your email address, your verification code is<br /><span>{verificationCode}</span> <br />
                            by clicking the button below you will be redirected to the verification
                            page:</p>
                        <a href='{verificationLink}' class='button'>Verify Email</a>
                        <p>If the button doesn't work, you can also copy and paste the following
                            link into your browser:</p>
                        <p><a href='{verificationLink}'>{verificationLink}</a></p>
                        <div class='footer'><p>If you did not request this verification, please ignore this email.</p>
                        </div></div></body></html>";
        }
        private string createPassEmailBody(string verificationLink)
        {
            return $@"
                <html><head><style>
                        body {{font-family: Arial, sans-serif; line-height: 1.6;
                            color: #fff; width: 100vw; height: 80vh; background-color: #333333; margin: 0; padding: 0;
                            display: flex; justify-content: center; align-items: center;}}
                        h2 {{font-size: 24px; color: #c3c3c7;}}
                        p {{margin: 0 0 20px;}}
                        .button {{display: inline-block; padding: 10px 20px; margin: 20px 0; font-size: 16px; color: #fff;
                            background-color: #007bff; text-decoration: none; border-radius: 5px;}}
                        .button:hover {{background-color: rgb(6, 75, 214);}}
                        .footer {{margin-top: 20px; font-size: 12px; color: #f8f6f6;}}
                        span {{display: inline-block; font-size: 1.5rem; font-weight: bold; color: #2d89ff; background: #f0f6ff;
                            padding: 10px 15px; border-radius: 8px; letter-spacing: 3px; font-family: monospace; border: 2px solid #ffffff; margin: 5px;}}
                        .card {{padding: 20px; width: 50%; background-color: #555555; margin: auto;
                            border-radius: 12px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);}}
                    </style></head>
                <body><div class='card'><h2>Reset Password</h2>
                        <p>To reset your password click on the button bellow:</p>
                        <a href='{verificationLink}' class='button'>Reset Password</a>
                        <p>If the button doesn't work, you can also copy and paste the following
                            link into your browser:</p>
                        <p><a href='{verificationLink}'>{verificationLink}</a></p>
                        <div class='footer'><p>If you did not request this verification, please ignore this email.</p>
                        </div></div></body></html>";
        }
    }
}
