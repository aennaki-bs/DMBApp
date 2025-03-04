using System;
using System.Linq.Expressions;
using DocManagementBackend.Models;


namespace DocManagementBackend.Mappings
{
    public static class LigneMappings
    {
        public static Expression<Func<Ligne, LigneDto>> ToLigneDto = l => new LigneDto
        {
            Id = l.Id,
            DocumentId = l.DocumentId,
            Title = l.Title,
            Article = l.Article,
            Prix = l.Prix,
            CreatedAt = l.CreatedAt,
            UpdatedAt = l.UpdatedAt,
            Document = new DocumentDto
            {
                Id = l.Document!.Id,
                Title = l.Document.Title,
                Content = l.Document.Content,
                TypeId = l.Document.TypeId,
                DocumentType = l.Document.DocumentType == null
                    ? null
                    : new DocumentTypeDto
                    {
                        TypeName = l.Document.DocumentType.TypeName,
                        TypeAttr = l.Document.DocumentType.TypeAttr
                    },
                CreatedAt = l.Document.CreatedAt,
                UpdatedAt = l.Document.UpdatedAt,
                Status = l.Document.Status,
                CreatedByUserId = l.Document.CreatedByUserId,
                CreatedBy = l.Document.CreatedBy == null
                    ? null
                    : new DocumentUserDto
                    {
                        Email = l.Document.CreatedBy.Email,
                        Username = l.Document.CreatedBy.Username,
                        FirstName = l.Document.CreatedBy.FirstName,
                        LastName = l.Document.CreatedBy.LastName,
                        Role = l.Document.CreatedBy.Role != null
                            ? l.Document.CreatedBy.Role.RoleName
                            : "SimpleUser"
                    }
            }
        };
    }

    public static class DocumentMappings
    {
        public static Expression<Func<Document, DocumentDto>> ToDocumentDto = d => new DocumentDto
        {
            Id = d.Id,
            Title = d.Title,
            Content = d.Content,
            CreatedAt = d.CreatedAt,
            UpdatedAt = d.UpdatedAt,
            Status = d.Status,
            CreatedByUserId = d.CreatedByUserId,
            CreatedBy = new DocumentUserDto
            {
                Email = d.CreatedBy.Email,
                Username = d.CreatedBy.Username,
                FirstName = d.CreatedBy.FirstName,
                LastName = d.CreatedBy.LastName,
                Role = d.CreatedBy.Role != null ? d.CreatedBy.Role.RoleName : string.Empty
            }
        };
    }
}