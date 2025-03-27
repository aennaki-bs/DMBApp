using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace DocManagementBackend.Models {
    public class Document
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public int CreatedByUserId { get; set; }
        [ForeignKey("CreatedByUserId")]
        public required User CreatedBy { get; set; }
        public int TypeId { get; set; }
        [ForeignKey("TypeId")]
        public DocumentType? DocumentType { get; set; }
        public int? CircuitId { get; set; }
        [ForeignKey("CircuitId")]
        public Circuit? Circuit { get; set; }
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
        public int LigneCouter { get; set; } = 0;
        public bool IsDeleted { get; set; } = false;
        [JsonIgnore]
        public ICollection<Ligne> Lignes { get; set; } = new List<Ligne>();
    }

    public class DocumentType
    {
        [Key]
        public int Id { get; set; }
        public string TypeKey { get; set; } = string.Empty;
        public string TypeName { get; set; } = string.Empty;
        public string TypeAttr { get; set; } = string.Empty;
        public int DocumentCounter { get; set; } = 0;
        [JsonIgnore]
        public ICollection<Document> Documents { get; set; } = new List<Document>();
    }

    public class TypeCounter
    {
        public int Id { get; set; }
        public int Counter { get; set; }
        public int circuitCounter { get; set; }
    }
}