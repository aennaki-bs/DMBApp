namespace DocManagementBackend.Models
{
    public class CircuitDto
    {
        public string CircuitId { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Descriptif { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
    }

    public class CircuitDetailDto
    {
        public string CircuitDetailId { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Descriptif { get; set; } = string.Empty;
        // public bool IsActive { get; set; } = true;
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