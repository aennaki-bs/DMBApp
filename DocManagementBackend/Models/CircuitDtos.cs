namespace DocManagementBackend.Models
{
    public class CircuitDto
    {
        public int Id { get; set; }
        public string CircuitKey { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Descriptif { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public int CrdCounter { get; set; }
        public bool HasOrderedFlow { get; set; }
        public List<CircuitDetailDto> CircuitDetails { get; set; } = new();
    }

    public class CircuitDetailDto
    {
        public int Id { get; set; }
        public string CircuitDetailKey { get; set; } = string.Empty;
        public int CircuitId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Descriptif { get; set; } = string.Empty;
        public int OrderIndex { get; set; }
        // public int? ResponsibleRoleId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        // Only include basic circuit information
        public CircuitSummaryDto? Circuit { get; set; }
    }

    public class CircuitSummaryDto
    {
        public int Id { get; set; }
        public string CircuitKey { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }

    public class CreateCircuitDetailDto
    {
        public int CircuitId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Descriptif { get; set; } = string.Empty;
        public int OrderIndex { get; set; }
        // public int? ResponsibleRoleId { get; set; }
    }
    public class AssignCircuitRequest
    {
        public int DocumentId { get; set; }
        public int CircuitId { get; set; }
    }

    public class ProcessCircuitRequest
    {
        public int DocumentId { get; set; }
        public bool IsApproved { get; set; }
        public string Comments { get; set; } = string.Empty;
    }

    public class DocumentCircuitHistoryDto
    {
        public int Id { get; set; }
        public string CircuitDetailTitle { get; set; } = string.Empty;
        public string ProcessedBy { get; set; } = string.Empty;
        public DateTime ProcessedAt { get; set; }
        public string Comments { get; set; } = string.Empty;
        public bool IsApproved { get; set; }
    }
}