using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace DocManagementBackend.Models
{
    public class Approvator
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public int StepId { get; set; }
        [ForeignKey("StepId")]
        [JsonIgnore]
        public Step? Step { get; set; }
        
        [Required]
        public int UserId { get; set; }
        [ForeignKey("UserId")]
        [JsonIgnore]
        public User? User { get; set; }
        
        public string Comment { get; set; } = string.Empty;
    }

    public class ApprovatorsGroup
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public int StepId { get; set; }
        [ForeignKey("StepId")]
        [JsonIgnore]
        public Step? Step { get; set; }
        
        public string Name { get; set; } = string.Empty;
        public string Comment { get; set; } = string.Empty;
        
        [JsonIgnore]
        public ICollection<ApprovatorsGroupUser> ApprovatorsGroupUsers { get; set; } = new List<ApprovatorsGroupUser>();
    }

    public class ApprovatorsGroupUser
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public int GroupId { get; set; }
        [ForeignKey("GroupId")]
        [JsonIgnore]
        public ApprovatorsGroup? Group { get; set; }
        
        [Required]
        public int UserId { get; set; }
        [ForeignKey("UserId")]
        [JsonIgnore]
        public User? User { get; set; }
        
        // For sequential approval order
        public int? OrderIndex { get; set; }
    }

    public class ApprovatorsGroupRule
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public int GroupId { get; set; }
        [ForeignKey("GroupId")]
        [JsonIgnore]
        public ApprovatorsGroup? Group { get; set; }
        
        [Required]
        public RuleType RuleType { get; set; } = RuleType.All;
    }

    public enum RuleType
    {
        Any = 0,     // Any user in the group can approve
        All = 1,     // All users must approve
        Sequential = 2  // Users must approve in specified order
    }

    public class ApprovalWriting
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public int DocumentId { get; set; }
        [ForeignKey("DocumentId")]
        [JsonIgnore]
        public Document? Document { get; set; }
        
        [Required]
        public int StepId { get; set; }
        [ForeignKey("StepId")]
        [JsonIgnore]
        public Step? Step { get; set; }
        
        [Required]
        public int ProcessedByUserId { get; set; }
        [ForeignKey("ProcessedByUserId")]
        [JsonIgnore]
        public User? ProcessedBy { get; set; }
        
        // Can be either an individual or a group
        public int? ApprovatorId { get; set; }
        public int? ApprovatorsGroupId { get; set; }
        
        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [Required]
        public ApprovalStatus Status { get; set; } = ApprovalStatus.Open;
        
        public string Comments { get; set; } = string.Empty;
    }

    public enum ApprovalStatus
    {
        Open = 0,
        InProgress = 1,
        Accepted = 2,
        Rejected = 3
    }

    public class ApprovalResponse
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public int ApprovalWritingId { get; set; }
        [ForeignKey("ApprovalWritingId")]
        [JsonIgnore]
        public ApprovalWriting? ApprovalWriting { get; set; }
        
        [Required]
        public int UserId { get; set; }
        [ForeignKey("UserId")]
        [JsonIgnore]
        public User? User { get; set; }
        
        [Required]
        public bool IsApproved { get; set; }
        
        [Required]
        public DateTime ResponseDate { get; set; } = DateTime.UtcNow;
        
        public string Comments { get; set; } = string.Empty;
    }
}