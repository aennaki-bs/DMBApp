using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace DocManagementBackend.Models
{
    public class ErpArchivalError
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public int DocumentId { get; set; }
        [ForeignKey("DocumentId")]
        [JsonIgnore]
        public Document? Document { get; set; }
        
        public int? LigneId { get; set; } // Null for document-level errors
        [ForeignKey("LigneId")]
        [JsonIgnore]
        public Ligne? Ligne { get; set; }
        
        [Required]
        public ErpErrorType ErrorType { get; set; }
        
        [Required]
        [MaxLength(500)]
        public string ErrorMessage { get; set; } = string.Empty;
        
        [MaxLength(2000)]
        public string? ErrorDetails { get; set; }
        
        [MaxLength(100)]
        public string? LigneCode { get; set; } // Store ligne code for easier identification
        
        [Required]
        public DateTime OccurredAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? ResolvedAt { get; set; }
        
        public bool IsResolved { get; set; } = false;
        
        [MaxLength(1000)]
        public string? ResolutionNotes { get; set; }
        
        public int? ResolvedByUserId { get; set; }
        [ForeignKey("ResolvedByUserId")]
        [JsonIgnore]
        public User? ResolvedBy { get; set; }
    }
    
    public enum ErpErrorType
    {
        DocumentArchival = 0,
        LineArchival = 1,
        ValidationError = 2,
        NetworkError = 3,
        AuthenticationError = 4,
        BusinessRuleError = 5
    }
} 