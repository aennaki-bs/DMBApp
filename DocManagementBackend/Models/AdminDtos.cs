namespace DocManagementBackend.Models
{
    public class AdminUpdateUserRequest
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public bool? IsEmailConfirmed { get; set; }
        // Allow updating the role (if needed)
        public int? RoleId { get; set; }
        // Optionally, update other fields as needed (e.g., isActive)
        public bool? IsActive { get; set; }
    }

    public class AdminUpdateDocumentRequest
    {
        public string? Title { get; set; }
        public string? Content { get; set; }
        // For example, 0 for Open and 1 for Posted:
        public int? Status { get; set; }
    }
}
