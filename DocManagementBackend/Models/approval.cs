using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using System.Text.Json;

namespace DocManagementBackend.Models
{
    public class Approvator
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public int UserId { get; set; }
        [ForeignKey("UserId")]
        [JsonIgnore]
        public User? User { get; set; }
        
        public string Comment { get; set; } = string.Empty;

        // Restore Step relationship
        public int? StepId { get; set; }
        [ForeignKey("StepId")]
        [JsonIgnore]
        public Step? Step { get; set; }
    }

    public class ApprovatorsGroup
    {
        [Key]
        public int Id { get; set; }
        
        public string Name { get; set; } = string.Empty;
        public string Comment { get; set; } = string.Empty;
        
        [JsonIgnore]
        public ICollection<ApprovatorsGroupUser> ApprovatorsGroupUsers { get; set; } = new List<ApprovatorsGroupUser>();

        // Restore Step relationship
        public int? StepId { get; set; }
        [ForeignKey("StepId")]
        [JsonIgnore]
        public Step? Step { get; set; }
    }

    // New entity to manage the assignment of approvers to steps
    public class StepApprovalAssignment
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public int StepId { get; set; }
        [ForeignKey("StepId")]
        [JsonIgnore]
        public Step? Step { get; set; }
        
        // Only one of these should be set (enforced by application logic)
        public int? ApprovatorId { get; set; }
        [ForeignKey("ApprovatorId")]
        [JsonIgnore]
        public Approvator? Approvator { get; set; }
        
        public int? ApprovatorsGroupId { get; set; }
        [ForeignKey("ApprovatorsGroupId")]
        [JsonIgnore]
        public ApprovatorsGroup? ApprovatorsGroup { get; set; }
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
        
        // For MinimumWithRequired rule type
        public int? MinimumApprovals { get; set; }
        
        // JSON field to store required member IDs for MinimumWithRequired rule type
        public string? RequiredMemberIdsJson { get; set; }
        
        // Helper property to work with RequiredMemberIds as a List<int>
        [NotMapped]
        public List<int> RequiredMemberIds
        {
            get
            {
                if (string.IsNullOrEmpty(RequiredMemberIdsJson))
                    return new List<int>();
                
                try
                {
                    return JsonSerializer.Deserialize<List<int>>(RequiredMemberIdsJson) ?? new List<int>();
                }
                catch
                {
                    return new List<int>();
                }
            }
            set
            {
                RequiredMemberIdsJson = value.Any() ? JsonSerializer.Serialize(value) : null;
            }
        }
    }

    public enum RuleType
    {
        Any = 0,                    // Any user in the group can approve
        All = 1,                    // All users must approve
        Sequential = 2,             // Users must approve in specified order
        MinimumWithRequired = 3     // Minimum number of approvals + required members must approve
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
        [ForeignKey("ApprovatorId")]
        [JsonIgnore]
        public Approvator? Approvator { get; set; }
        
        public int? ApprovatorsGroupId { get; set; }
        [ForeignKey("ApprovatorsGroupId")]
        [JsonIgnore]
        public ApprovatorsGroup? ApprovatorsGroup { get; set; }
        
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

    // Summary class for MinimumWithRequired approval rule status
    public class ApprovalStatusSummary
    {
        public int MinimumRequired { get; set; }
        public int CurrentApprovals { get; set; }
        public int RequiredMembersTotal { get; set; }
        public int RequiredMembersApproved { get; set; }
        public List<int> RequiredMembersPending { get; set; } = new List<int>();
        public bool IsMinimumMet { get; set; }
        public bool AreAllRequiredApproved { get; set; }
        public bool IsComplete { get; set; }
    }
}