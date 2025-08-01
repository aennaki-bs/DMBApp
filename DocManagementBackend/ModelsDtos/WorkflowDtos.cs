namespace DocManagementBackend.Models
{
    public class AssignCircuitDto
    {
        public int DocumentId { get; set; }
        public int CircuitId { get; set; }
    }

    // PerformActionDto removed - Actions functionality has been removed from the system

    public class ReturnToPreviousDto
    {
        public int DocumentId { get; set; }
        public string Comments { get; set; } = string.Empty;
    }

    public class DocumentHistoryDto
    {
        public int Id { get; set; }
        public string EventType { get; set; } = string.Empty; // "Creation", "Update", "Workflow"
        public string StepTitle { get; set; } = string.Empty;
        // ActionTitle removed - Actions functionality has been removed from the system
        public string StatusTitle { get; set; } = string.Empty;
        public string ProcessedBy { get; set; } = string.Empty;
        public DateTime ProcessedAt { get; set; }
        public string Comments { get; set; } = string.Empty;
        public bool IsApproved { get; set; }
        public string? UpdateDetails { get; set; } // Additional details for update events
    }

    public class DocumentWorkflowStatusDto
    {
        public int DocumentId { get; set; }
        public string DocumentKey { get; set; } = string.Empty;
        public string DocumentTitle { get; set; } = string.Empty;
        public int? CircuitId { get; set; }
        public string CircuitTitle { get; set; } = string.Empty;
        public int? CurrentStatusId { get; set; }
        public string CurrentStatusTitle { get; set; } = string.Empty;
        public int? CurrentStepId { get; set; }
        public string CurrentStepTitle { get; set; } = string.Empty;
        public int Status { get; set; }
        public string StatusText { get; set; } = string.Empty;
        public bool IsCircuitCompleted { get; set; }
        public int ProgressPercentage { get; set; }
        public List<DocumentStatusItemDto> Statuses { get; set; } = new();
        public List<DocumentStepHistoryItemDto> StepHistory { get; set; } = new();
        public List<StatusDto> AvailableStatusTransitions { get; set; } = new();
        // AvailableActions removed - Actions functionality has been removed from the system
        public bool CanAdvanceToNextStep { get; set; }
        public bool CanReturnToPreviousStep { get; set; }
    }

    public class PendingDocumentDto
    {
        public int DocumentId { get; set; }
        public string DocumentKey { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string CreatedBy { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public int CircuitId { get; set; }
        public string CircuitTitle { get; set; } = string.Empty;
        public int CurrentStatusId { get; set; }
        public string CurrentStatusTitle { get; set; } = string.Empty;
        public int DaysInCurrentStatus { get; set; }
    }
    public class MoveNextDto
    {
        public int DocumentId { get; set; }
        public int CurrentStepId { get; set; }
        public int NextStepId { get; set; }
        public string Comments { get; set; } = string.Empty;
    }
    public class MoveToDocumentDto
    {
        public int DocumentId { get; set; }
        public string Comments { get; set; } = string.Empty;
    }

    public class ReinitializeWorkflowDto
    {
        public int DocumentId { get; set; }
        public string Comments { get; set; } = string.Empty;
    }

    public class ConfigureStepApprovalDto
    {
        public string StepKey { get; set; } = string.Empty;
        public bool RequiresApproval { get; set; }
        public int? ApprovatorId { get; set; }
        public int? ApproversGroupId { get; set; }
    }
}