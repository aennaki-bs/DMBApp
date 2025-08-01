namespace DocManagementBackend.Models
{
    public class AdminCreateUserRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string RoleName { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        public string? Address { get; set; } = string.Empty;
        public string? Identity { get; set; } = string.Empty;
        public string? PhoneNumber { get; set; } = string.Empty;
        public int? ResponsibilityCenterId { get; set; }
        public string UserType { get; set; } = string.Empty;
        public string? WebSite { get; set; } = string.Empty;
    }
    public class AdminUpdateUserRequest
    {
        public string? Email { get; set; } = string.Empty;

        public string? Username { get; set; } = string.Empty;

        public string? PasswordHash { get; set; } = string.Empty;

        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public bool? IsEmailConfirmed { get; set; }
        public string? RoleName { get; set; }
        public bool? IsActive { get; set; }
        public int? ResponsibilityCenterId { get; set; }
        public string? City { get; set; }
        public string? Country { get; set; }
        public string? Address { get; set; }
        public string? Identity { get; set; }
        public string? PhoneNumber { get; set; }
    }

}
