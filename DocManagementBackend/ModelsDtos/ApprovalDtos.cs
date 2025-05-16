namespace DocManagementBackend.Models
{
    // DTOs for Approval Controller
    public class ApprovalResponseDto
    {
        public bool IsApproved { get; set; }
        public string Comments { get; set; } = string.Empty;
    }

    public class PendingApprovalDto
    {
        public int ApprovalId { get; set; }
        public int DocumentId { get; set; }
        public string DocumentKey { get; set; } = string.Empty;
        public string DocumentTitle { get; set; } = string.Empty;
        public string StepTitle { get; set; } = string.Empty;
        public string RequestedBy { get; set; } = string.Empty;
        public DateTime RequestDate { get; set; }
        public string Comments { get; set; } = string.Empty;
        public string ApprovalType { get; set; } = string.Empty;
    }

    public class ApprovalHistoryDto
    {
        public int ApprovalId { get; set; }
        public string StepTitle { get; set; } = string.Empty;
        public string RequestedBy { get; set; } = string.Empty;
        public DateTime RequestDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Comments { get; set; } = string.Empty;
        public List<ApprovalResponseHistoryDto> Responses { get; set; } = new List<ApprovalResponseHistoryDto>();
    }

    public class ApprovalResponseHistoryDto
    {
        public string ResponderName { get; set; } = string.Empty;
        public DateTime ResponseDate { get; set; }
        public bool IsApproved { get; set; }
        public string Comments { get; set; } = string.Empty;
    }

    public class StepWithApprovalDto
    {
        public int StepId { get; set; }
        public string StepKey { get; set; } = string.Empty;
        public int CircuitId { get; set; }
        public string CircuitTitle { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Descriptif { get; set; } = string.Empty;
        public int CurrentStatusId { get; set; }
        public string CurrentStatusTitle { get; set; } = string.Empty;
        public int NextStatusId { get; set; }
        public string NextStatusTitle { get; set; } = string.Empty;
        public bool RequiresApproval { get; set; }
    }

    public class StepApprovalConfigDto
    {
        public bool RequiresApproval { get; set; }
        public string ApprovalType { get; set; } = "None"; // "None", "Single", "Group"
        public int? SingleApproverId { get; set; }
        public List<int>? GroupApproverIds { get; set; }
        public string? GroupName { get; set; }
        public string? RuleType { get; set; } = "All"; // "Any", "All", "Sequential"
        public string? Comment { get; set; }
    }

    public class StepApprovalConfigDetailDto
    {
        public int StepId { get; set; }
        public string StepKey { get; set; } = string.Empty;
        public int CircuitId { get; set; }
        public string CircuitTitle { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Descriptif { get; set; } = string.Empty;
        public int CurrentStatusId { get; set; }
        public string CurrentStatusTitle { get; set; } = string.Empty;
        public int NextStatusId { get; set; }
        public string NextStatusTitle { get; set; } = string.Empty;
        public bool RequiresApproval { get; set; }
        public string ApprovalType { get; set; } = "None"; // "None", "Single", "Group"
        public int? SingleApproverId { get; set; }
        public string? SingleApproverName { get; set; }
        public List<ApproverInfoDto>? GroupApprovers { get; set; }
        public string? GroupName { get; set; }
        public string? RuleType { get; set; } = "All"; // "Any", "All", "Sequential"
        public string Comment { get; set; } = string.Empty;
    }

    public class ApproverInfoDto
    {
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string? Role { get; set; }
        public int? OrderIndex { get; set; }
    }

    public class CreateApprovatorsGroupDto
    {
        public int? StepId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Comment { get; set; }
        public List<int> UserIds { get; set; } = new List<int>();
        public string RuleType { get; set; } = "All"; // "Any", "All", "Sequential"
    }

    public class ApprovatorsGroupDetailDto
    {
        public int Id { get; set; }
        public int? StepId { get; set; }
        public string StepTitle { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Comment { get; set; } = string.Empty;
        public string RuleType { get; set; } = "All";
        public List<ApproverInfoDto> Approvers { get; set; } = new List<ApproverInfoDto>();
    }

    public class CreateApprovatorDto
    {
        public int? StepId { get; set; }
        public int UserId { get; set; }
        public string Comment { get; set; } = string.Empty;
    }

    public class ApprovatorDetailDto
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Comment { get; set; } = string.Empty;
    }

    public class StepApprovalAssignmentDto
    {
        public int Id { get; set; }
        public int StepId { get; set; }
        public string StepTitle { get; set; } = string.Empty;
        public ApprovalAssignmentType AssignmentType { get; set; }
        public int? ApprovatorId { get; set; }
        public string? ApprovatorUsername { get; set; }
        public int? ApprovatorsGroupId { get; set; }
        public string? ApprovatorsGroupName { get; set; }
    }

    public enum ApprovalAssignmentType
    {
        None = 0,
        SingleApprovator = 1,
        ApprovatorsGroup = 2
    }

    public class AssignApprovalToStepDto
    {
        public int StepId { get; set; }
        public ApprovalAssignmentType AssignmentType { get; set; }
        public int? ApprovatorId { get; set; }
        public int? ApprovatorsGroupId { get; set; }
    }

    public class AddUserToGroupDto
    {
        public int UserId { get; set; }
        public int? OrderIndex { get; set; }
    }
}