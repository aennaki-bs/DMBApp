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
    }
    public class AdminUpdateUserRequest
    {
        public string? Email { get; set; } = string.Empty;

        public string? Username { get; set; } = string.Empty;

        public string? PasswordHash { get; set; } = string.Empty;

        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public bool? IsEmailConfirmed { get; set; }
        // Allow updating the role (if needed)
        public string? RoleName { get; set; }
        // Optionally, update other fields as needed (e.g., isActive)
        public bool? IsActive { get; set; }
    }

    public class AdminUpdateDocumentRequest
    {
        public string? Title { get; set; }
        public string? Content { get; set; }
        public int? TypeId { get; set; }
        // For example, 0 for Open and 1 for Posted:
        public int? Status { get; set; }
    }
}
