using DocManagementBackend.Models;

namespace DocManagementBackend.ModelsDtos
{
    public class ErpArchivalErrorDto
    {
        public int Id { get; set; }
        public int DocumentId { get; set; }
        public int? LigneId { get; set; }
        public string ErrorType { get; set; } = string.Empty;
        public string ErrorMessage { get; set; } = string.Empty;
        public string? ErrorDetails { get; set; }
        public string? LigneCode { get; set; }
        public DateTime OccurredAt { get; set; }
        public DateTime? ResolvedAt { get; set; }
        public bool IsResolved { get; set; }
        public string? ResolutionNotes { get; set; }
        public string? ResolvedByUsername { get; set; }
    }

    public class DocumentErpStatusDto
    {
        public int DocumentId { get; set; }
        public string DocumentKey { get; set; } = string.Empty;
        public bool IsArchived { get; set; }
        public string? ErpDocumentCode { get; set; }
        public bool HasErrors { get; set; }
        public bool HasUnresolvedErrors { get; set; }
        public List<ErpArchivalErrorDto> Errors { get; set; } = new();
        public List<LigneErpStatusDto> LigneStatuses { get; set; } = new();
        public DateTime? LastArchivalAttempt { get; set; }
        public string ArchivalStatusSummary { get; set; } = string.Empty;
    }

    public class LigneErpStatusDto
    {
        public int LigneId { get; set; }
        public string? LigneCode { get; set; }
        public string Title { get; set; } = string.Empty;
        public bool IsArchived { get; set; }
        public string? ErpLineCode { get; set; }
        public bool HasErrors { get; set; }
        public List<ErpArchivalErrorDto> Errors { get; set; } = new();
    }

    public class ResolveErpErrorRequest
    {
        public int ErrorId { get; set; }
        public string ResolutionNotes { get; set; } = string.Empty;
    }

    public class RetryErpArchivalRequest
    {
        public int DocumentId { get; set; }
        public List<int>? LigneIds { get; set; } // If null, retry entire document
        public string? Reason { get; set; }
    }

    public class ErpArchivalSummaryDto
    {
        public int TotalDocuments { get; set; }
        public int ArchivedDocuments { get; set; }
        public int PendingDocuments { get; set; }
        public int DocumentsWithErrors { get; set; }
        public int TotalLines { get; set; }
        public int ArchivedLines { get; set; }
        public int LinesWithErrors { get; set; }
        public List<ErpArchivalErrorDto> RecentErrors { get; set; } = new();
    }
} 