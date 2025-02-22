using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace DocManagementBackend.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string Username { get; set; } = string.Empty;

        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        public string FirstName { get; set; } = string.Empty;

        public string LastName { get; set; } = string.Empty;

        public bool IsEmailConfirmed { get; set; } = false;

        public string? EmailVerificationCode { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public bool IsActive { get; set; } = false;

        public DateTime? LastLogin { get; set; }

        public string? ProfilePicture { get; set; }

        public string? BackgroundPicture { get; set; }

        public int RoleId { get; set; }

        [ForeignKey("RoleId")]
        public required Role Role { get; set; }

        [JsonIgnore]
        public ICollection<LogHistory> LogHistories { get; set; } = new List<LogHistory>();

        [JsonIgnore]
        public ICollection<Document> Documents { get; set; } = new List<Document>();
    }

    public class Role
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string RoleName { get; set; } = string.Empty;

        public bool IsAdmin { get; set; } = false;
        public bool IsSimpleUser { get; set; } = false;
        public bool IsFullUser { get; set; } = false;

        [JsonIgnore]
        public ICollection<User> Users { get; set; } = new List<User>();
    }

    public class LogHistory
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [ForeignKey("UserId")]
        public required User User { get; set; }

        [Required]
        public DateTime Timestamp { get; set; }

        [Required]
        public int ActionType { get; set; } // 1 for Login, 0 for Logout
    }

    public class Document
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string Title { get; set; } = string.Empty;

        public string? Content { get; set; }

        [Required]
        public int CreatedByUserId { get; set; }

        [ForeignKey("CreatedByUserId")]
        public required User CreatedBy { get; set; }

        [Required]
        public int Status { get; set; } // 0 for Open, 1 for Posted

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }


}
