using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace DocManagementBackend.Models
{
    public class Circuit
    {
        [Key]
        public int Id { get; set; }
        public string CircuitKey { get; set; } = string.Empty;
        [Required]
        public string Title { get; set; } = string.Empty;
        public string Descriptif { get; set; } = string.Empty;
        public bool IsActive { get; set; } = false;
        public int CrdCounter { get; set; } = 0;
        public bool HasOrderedFlow { get; set; } = false;
        public bool AllowBacktrack { get; set; } = false;

        // DocumentType relationship - each circuit belongs to a specific document type
        public int? DocumentTypeId { get; set; }
        [ForeignKey("DocumentTypeId")]
        public DocumentType? DocumentType { get; set; }

        [JsonIgnore]
        public ICollection<Status> Statuses { get; set; } = new List<Status>();

        [JsonIgnore]
        public ICollection<Step> Steps { get; set; } = new List<Step>();
    }

    public class Step
    {
        [Key]
        public int Id { get; set; }
        public string StepKey { get; set; } = string.Empty;

        [Required]
        public int CircuitId { get; set; }
        [ForeignKey("CircuitId")]
        [JsonIgnore]
        public Circuit? Circuit { get; set; }

        [Required]
        public string Title { get; set; } = string.Empty;
        public string Descriptif { get; set; } = string.Empty;

        [Required]
        public int CurrentStatusId { get; set; }
        [ForeignKey("CurrentStatusId")]
        [JsonIgnore]
        public Status? CurrentStatus { get; set; }

        [Required]
        public int NextStatusId { get; set; }
        [ForeignKey("NextStatusId")]
        [JsonIgnore]
        public Status? NextStatus { get; set; }
        public bool RequiresApproval { get; set; } = false;

        // Direct relationship to approver or group (only one should be set)
        public int? ApprovatorId { get; set; }
        [ForeignKey("ApprovatorId")]
        [JsonIgnore]
        public Approvator? Approvator { get; set; }
        
        public int? ApprovatorsGroupId { get; set; }
        [ForeignKey("ApprovatorsGroupId")]
        [JsonIgnore]
        public ApprovatorsGroup? ApprovatorsGroup { get; set; }

        // StepActions removed - Actions functionality has been removed from the system
    }
}