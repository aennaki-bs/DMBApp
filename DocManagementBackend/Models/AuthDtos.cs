namespace DocManagementBackend.Models {
    public class LoginRequest
    {
        public string EmailOrUsername { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
    public class LogoutRequest { public int UserId { get; set; } }

    public class VerifyEmailRequest
    {
        public string? Email { get; set; }
        public string? VerificationCode { get; set; }
    }
}