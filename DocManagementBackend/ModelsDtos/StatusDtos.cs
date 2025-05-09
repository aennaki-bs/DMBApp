namespace DocManagementBackend.Models
{
    public class CreateStatusDto
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsRequired { get; set; } = true;
        public bool IsInitial { get; set; } = false;
        public bool IsFinal { get; set; } = false;
        public bool IsFlexible { get; set; } = false;
    }

    public class UpdateStatusDto
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public bool? IsRequired { get; set; }
        public bool? IsInitial { get; set; }
        public bool? IsFinal { get; set; }
        public bool? IsFlexible { get; set; }
    }

    public class StatusDto
    {
        public int StatusId { get; set; }
        public string StatusKey { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsRequired { get; set; }
        public bool IsInitial { get; set; }
        public bool IsFinal { get; set; }
        public bool IsFlexible { get; set; }
        public int CircuitId { get; set; }
        public string TransitionInfo { get; set; } = string.Empty;
    }

    public class DocumentStatusDto
    {
        public int StatusId { get; set; }
        public string StatusKey { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsRequired { get; set; }
        public bool IsComplete { get; set; }
        public string? CompletedBy { get; set; }
        public DateTime? CompletedAt { get; set; }
        public bool IsInitial { get; set; }
        public bool IsFinal { get; set; }
        public bool IsFlexible { get; set; }
        public int? CircuitId { get; set; }
        public string TransitionInfo { get; set; } = string.Empty;
    }

    public class DocumentCurrentStatusDto
    {
        public int DocumentId { get; set; }
        public string DocumentKey { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public int Status { get; set; }
        public string StatusText { get; set; } = string.Empty;
        public int? CircuitId { get; set; }
        public string? CircuitTitle { get; set; }
        public int? CurrentStatusId { get; set; }
        public string? CurrentStatusTitle { get; set; }
        public int? CurrentStepId { get; set; }
        public string? CurrentStepTitle { get; set; }
        public bool IsCircuitCompleted { get; set; }
        public DateTime LastUpdated { get; set; }
    }

    public class CompleteStatusDto
    {
        public int DocumentId { get; set; }
        public int StatusId { get; set; }
        public bool IsComplete { get; set; } = true;
        public string Comments { get; set; } = string.Empty;
    }
}