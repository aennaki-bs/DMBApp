using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace DocManagementBackend.Models
{
    public class LignesElementType
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        [MaxLength(50)]
        public string TypeElement { get; set; } = string.Empty; // 'Item' | 'General Accounts'
        
        [Required]
        [MaxLength(200)]
        public string Description { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(100)]
        public string TableName { get; set; } = string.Empty; // 'Item', 'GeneralAccounts'
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation property
        [JsonIgnore]
        public ICollection<Ligne> Lignes { get; set; } = new List<Ligne>();
    }

    public class GeneralAccounts
    {
        [Key]
        [MaxLength(50)]
        public string Code { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        [JsonIgnore]
        public ICollection<Ligne> Lignes { get; set; } = new List<Ligne>();
    }

    public class Item
    {
        [Key]
        [MaxLength(50)]
        public string Code { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;
        
        // Foreign key to UniteCode
        [MaxLength(50)]
        public string? Unite { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        [ForeignKey("Unite")]
        public UniteCode? UniteCodeNavigation { get; set; }
        
        [JsonIgnore]
        public ICollection<Ligne> Lignes { get; set; } = new List<Ligne>();
    }

    public class UniteCode
    {
        [Key]
        [MaxLength(50)]
        public string Code { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        [JsonIgnore]
        public ICollection<Item> Items { get; set; } = new List<Item>();
    }
} 