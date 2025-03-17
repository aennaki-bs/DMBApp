using System.ComponentModel;

namespace DocManagementBackend.Models
{
    public class CreateDocumentRequest
    {
        public string Title { get; set; } = string.Empty;
        public string? Content { get; set; }
        public string? DocumentAlias { get; set; }
        public DateTime DocDate { get; set; }
        public int CreatedByUserId { get; set; }
        public int TypeId { get; set; }
        public int Status { get; set; }
    }

    public class UpdateDocumentRequest
    {
        public string? Title { get; set; }
        public string? Content { get; set; }
        public string? DocumentAlias { get; set; }
        public DateTime? DocDate { get; set; }
        public int? TypeId { get; set; }
        public int? Status { get; set; }
    }
    public class DocumentDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Content { get; set; }
        public string? DocumentKey { get; set; }
        public string? DocumentAlias { get; set; }
        public int TypeId { get; set; }
        public DateTime DocDate { get; set; }
        public DocumentTypeDto? DocumentType { get; set; } = new DocumentTypeDto();
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int Status { get; set; }
        public int LignesCount { get; set; }
        public int SousLignesCount { get; set; }
        public int CreatedByUserId { get; set; }
        public DocumentUserDto? CreatedBy { get; set; } = new DocumentUserDto();
    }

    public class DocumentTypeDto {
        public string TypeKey { get; set; } = string.Empty;
        public string TypeName { get; set; } = string.Empty;
        public string TypeAttr { get; set; } = string.Empty;
    }

    public class DocumentUserDto
    {
        public string Email { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? Role { get; set; } = string.Empty;
    }
}
