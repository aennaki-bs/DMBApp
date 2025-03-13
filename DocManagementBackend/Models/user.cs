using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace DocManagementBackend.Models {
    public class User {
        [Key]
        public int Id { get; set; }
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        [Required]
        public string Username { get; set; } = string.Empty;
        [Required]
        public string PasswordHash { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        public bool IsEmailConfirmed { get; set; } = false;
        public string? EmailVerificationCode { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = false;
        public bool IsOnline { get; set; } = false;
        public DateTime? LastLogin { get; set; }
        public string? ProfilePicture { get; set; }
        public string? BackgroundPicture { get; set; }
        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiry { get; set; }
        public int RoleId { get; set; }
        [ForeignKey("RoleId")]
        [JsonIgnore]
        public Role? Role { get; set; }
        [JsonIgnore]
        public ICollection<LogHistory> LogHistories { get; set; } = new List<LogHistory>();
        [JsonIgnore]
        public ICollection<Document> Documents { get; set; } = new List<Document>();
    }

    public class Role {
        [Key]
        public int Id { get; set; }
        [Required]
        public string? RoleName { get; set; } = string.Empty;
        public bool IsAdmin { get; set; } = false;
        public bool IsSimpleUser { get; set; } = false;
        public bool IsFullUser { get; set; } = false;
        // [JsonIgnore]
        // public ICollection<User> Users { get; set; } = new List<User>();
    }

    public class LogHistory {
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

    public class Document {
        [Key]
        public int Id { get; set; }
        [Required]
        public int CreatedByUserId { get; set; }
        [ForeignKey("CreatedByUserId")]
        public required User CreatedBy { get; set; }
        public int TypeId { get; set; }
        [ForeignKey("TypeId")]
        public DocumentType? DocumentType { get; set; }
        [Required]
        public string DocumentKey { get; set; } = string.Empty;
        public string DocumentAlias { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string? Content { get; set; }
        [Required]
        public int Status { get; set; } // 0 = Open, 1 = Validated
        public DateTime DocDate { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public bool IsDeleted { get; set; } = false;
        [JsonIgnore]
        public ICollection<Ligne> Lignes { get; set; } = new List<Ligne>();
    }

    public class DocumentType {
        [Key]
        public int Id { get; set; }
        public string TypeKey { get; set; } = string.Empty;
        public string TypeName { get; set; } = string.Empty;
        public string TypeAttr { get; set; } = string.Empty;
        public int DocumentCounter { get; set; } = 0;
        [JsonIgnore]
        public ICollection<Document> Documents { get; set; } = new List<Document>();
    }

    public class Ligne {
        [Key]
        public int Id { get; set; }
        [Required]
        public int DocumentId { get; set; }
        [ForeignKey("DocumentId")]
        [JsonIgnore]
        public Document? Document { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Article { get; set; } = string.Empty;
        public float Prix { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        [JsonIgnore]
        public ICollection<SousLigne> SousLignes { get; set; } = new List<SousLigne>();
    }

    public class SousLigne {
        [Key]
        public int Id { get; set; }
        [Required]
        public int LigneId { get; set; }
        [ForeignKey("LigneId")]
        [JsonIgnore]
        public Ligne? Ligne { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Attribute { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    public class TypeCounter {
        public int Id { get; set; }
        public int Counter { get; set; }
    }
}
