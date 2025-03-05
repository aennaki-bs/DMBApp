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

    public static class SousLigneMappings
    {
        public static Expression<Func<SousLigne, SousLigneDto>> ToSousLigneDto = s => new SousLigneDto
        {
            Id = s.Id,
            LigneId = s.LigneId,
            Title = s.Title,
            Attribute = s.Attribute,
            Ligne = new LigneDto {
                Id = s.Id,
                DocumentId = s.Ligne!.DocumentId,
                Title = s.Ligne.Title,
                Article = s.Ligne.Article,
                Prix = s.Ligne.Prix,
                CreatedAt = s.Ligne.CreatedAt,
                UpdatedAt = s.Ligne.UpdatedAt,
                Document = new DocumentDto {
                    Id = s.Ligne.Document!.Id,
                    Title = s.Ligne.Document.Title,
                    Content = s.Ligne.Document.Content,
                    TypeId = s.Ligne.Document.TypeId,
                    DocumentType = s.Ligne.Document.DocumentType == null
                        ? null
                        : new DocumentTypeDto {
                            TypeName = s.Ligne.Document.DocumentType.TypeName,
                            TypeAttr = s.Ligne.Document.DocumentType.TypeAttr
                        },
                    CreatedAt = s.Ligne.Document.CreatedAt,
                    UpdatedAt = s.Ligne.Document.UpdatedAt,
                    Status = s.Ligne.Document.Status,
                    CreatedByUserId = s.Ligne.Document.CreatedByUserId,
                    CreatedBy = s.Ligne.Document.CreatedBy == null
                        ? null
                        : new DocumentUserDto {
                            Email = s.Ligne.Document.CreatedBy.Email,
                            Username = s.Ligne.Document.CreatedBy.Username,
                            FirstName = s.Ligne.Document.CreatedBy.FirstName,
                            LastName = s.Ligne.Document.CreatedBy.LastName,
                            Role = s.Ligne.Document.CreatedBy.Role != null
                                ? s.Ligne.Document.CreatedBy.Role.RoleName
                                : "SimpleUser"
                        }
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