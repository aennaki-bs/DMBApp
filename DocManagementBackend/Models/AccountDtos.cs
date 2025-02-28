namespace DocManagementBackend.Models
{
    public class ForgotPasswordRequest
    {
        public string Email { get; set; } = string.Empty;
        // public string NewPassword { get; set; } = string.Empty;
    }
    public class ValideUsernameRequest
    {
        public string Username { get; set; } = string.Empty;
        // public string NewPassword { get; set; } = string.Empty;
    }

    public class ResetPasswordRequest
    {
        public string Email { get; set; } = string.Empty;
        public string VerificationCode { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }

    public class UpdateProfileRequest
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? ProfilePicture { get; set; }
        public string? BackgroundPicture { get; set; }
        // Optional: for password update
        public string? CurrentPassword { get; set; }
        public string? NewPassword { get; set; }
    }
}
