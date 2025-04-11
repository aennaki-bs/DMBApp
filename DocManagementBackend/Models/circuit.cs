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
        public bool IsActive { get; set; } = true;
        public int CrdCounter { get; set; } = 0;
        public bool HasOrderedFlow { get; set; } = true;
        public bool AllowBacktrack { get; set; } = false;
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
        public int OrderIndex { get; set; } = 0;
        public int? ResponsibleRoleId { get; set; }
        [ForeignKey("ResponsibleRoleId")]
        [JsonIgnore]
        public Role? ResponsibleRole { get; set; }
        public int? NextStepId { get; set; }
        [ForeignKey("NextStepId")]
        [JsonIgnore]
        public Step? NextStep { get; set; }
        public int? PrevStepId { get; set; }
        [ForeignKey("PrevStepId")]
        [JsonIgnore]
        public Step? PrevStep { get; set; }
        public bool IsFinalStep { get; set; } = false;
        [JsonIgnore]
        public ICollection<Status> Statuses { get; set; } = new List<Status>();
        [JsonIgnore]
        public ICollection<StepAction> StepActions { get; set; } = new List<StepAction>();
    }
}