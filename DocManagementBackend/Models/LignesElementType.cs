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
        public string Code { get; set; } = string.Empty; // Unique identifier for each line element instance
        
        [Required]
        [MaxLength(50)]
        public string TypeElement { get; set; } = string.Empty; // 'Item' | 'General Accounts'
        
        [Required]
        [MaxLength(200)]
        public string Description { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(100)]
        public string TableName { get; set; } = string.Empty; // 'Item', 'GeneralAccounts'
        
        // Conditional foreign keys based on TypeElement
        [MaxLength(50)]
        public string? ItemCode { get; set; } // Foreign key to Item.Code when TypeElement = 'Item'
        
        [MaxLength(50)]
        public string? AccountCode { get; set; } // Foreign key to GeneralAccounts.Code when TypeElement = 'General Accounts'
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        [ForeignKey("ItemCode")]
        public Item? Item { get; set; }
        
        [ForeignKey("AccountCode")]
        public GeneralAccounts? GeneralAccount { get; set; }
        
        [JsonIgnore]
        public ICollection<Ligne> Lignes { get; set; } = new List<Ligne>();
        
        // Validation method
        public bool IsValid()
        {
            // Ensure only one of the foreign keys is populated based on TypeElement
            switch (TypeElement)
            {
                case "Item":
                    return !string.IsNullOrEmpty(ItemCode) && string.IsNullOrEmpty(AccountCode);
                case "General Accounts":
                    return !string.IsNullOrEmpty(AccountCode) && string.IsNullOrEmpty(ItemCode);
                default:
                    return false;
            }
        }
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
        
        // Stored count of lines using this general account
        public int LinesCount { get; set; } = 0;
        
        // Navigation properties
        [JsonIgnore]
        public ICollection<LignesElementType> LignesElementTypes { get; set; } = new List<LignesElementType>();
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
        public ICollection<LignesElementType> LignesElementTypes { get; set; } = new List<LignesElementType>();
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
        
        // Stored count of items using this unit
        public int ItemsCount { get; set; } = 0;
        
        // Navigation properties
        [JsonIgnore]
        public ICollection<Item> Items { get; set; } = new List<Item>();
    }
} 