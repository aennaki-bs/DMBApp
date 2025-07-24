# Data Transfer Objects (DTOs) Documentation

## Overview
The ModelsDtos folder contains all Data Transfer Objects (DTOs) used for API communication, data transformation, and request/response handling in the Document Management System. DTOs provide a clean separation between internal domain models and external API contracts, ensuring data security and API stability.

## Table of Contents
1. [DTO Architecture](#dto-architecture)
2. [Core Document DTOs](#core-document-dtos)
3. [Workflow Management DTOs](#workflow-management-dtos)
4. [Approval System DTOs](#approval-system-dtos)
5. [Administrative DTOs](#administrative-dtos)
6. [Reference Data DTOs](#reference-data-dtos)
7. [ERP Integration DTOs](#erp-integration-dtos)
8. [Authentication & Authorization DTOs](#authentication--authorization-dtos)
9. [DTO Design Patterns](#dto-design-patterns)
10. [Validation & Security](#validation--security)

---

## DTO Architecture

### Design Principles
- **Separation of Concerns**: DTOs separate internal models from API contracts
- **Data Security**: Only expose necessary fields to external consumers  
- **API Stability**: Changes to internal models don't break external APIs
- **Validation**: DTOs include validation attributes for input validation
- **Performance**: Lightweight objects optimized for serialization

### File Organization

| File | Purpose | Domain |
|------|---------|---------|
| `DocumentsDtos.cs` | Document CRUD operations | Core Document Management |
| `WorkflowDtos.cs` | Workflow and status transitions | Workflow System |
| `ApprovalDtos.cs` | Approval requests and responses | Approval System |
| `AdminDtos.cs` | Administrative operations | User Management |
| `AuthDtos.cs` | Authentication requests | Security |
| `LignesDtos.cs` | Document lines and ERP operations | Line Management |
| `ErpArchivalDtos.cs` | ERP integration status and errors | ERP Integration |
| `CircuitDtos.cs` | Circuit management | Workflow Configuration |
| `StatusDtos.cs` | Status definitions | Workflow Configuration |
| `UserDtos.cs` | User information | User Management |
| `ResponsibilityCentreDtos.cs` | Organizational units | Reference Data |
| `LineElementDtos.cs` | Line element types | Reference Data |
| `SubTypeDtos.cs` | Document sub-types | Reference Data |
| `AccountDtos.cs` | User accounts | User Management |
| `LogHistoryDtos.cs` | Audit logging | System Monitoring |
| `OAuthDtos.cs` | OAuth authentication | Security |

---

## Core Document DTOs

### File: `DocumentsDtos.cs`

#### Document Creation DTO
```csharp
public class CreateDocumentRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Content { get; set; }
    public int TypeId { get; set; }
    public int? SubTypeId { get; set; }
    public string? DocumentAlias { get; set; }
    public string? DocumentExterne { get; set; }
    public DateTime? DocDate { get; set; }
    public DateTime? ComptableDate { get; set; }
    public int? CircuitId { get; set; }
    public int? ResponsibilityCentreId { get; set; }
    
    // Customer/Vendor snapshot
    public string? CustomerVendorCode { get; set; }
    public string? CustomerVendorName { get; set; }
    public string? CustomerVendorAddress { get; set; }
    public string? CustomerVendorCity { get; set; }
    public string? CustomerVendorCountry { get; set; }
}
```

**Purpose**: Captures all required and optional fields for document creation
**Usage**: POST `/api/Documents`
**Validation**: Business rules applied in controller

#### Document Update DTO
```csharp
public class UpdateDocumentRequest
{
    public string? Title { get; set; }
    public string? Content { get; set; }
    public int? TypeId { get; set; }
    // ... other nullable fields for partial updates
}
```

**Purpose**: Supports partial document updates
**Usage**: PUT `/api/Documents/{id}`
**Pattern**: All fields nullable to support partial updates

#### Document Response DTO
```csharp
public class DocumentDto
{
    public int Id { get; set; }
    public string DocumentKey { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    // ... comprehensive document information
    public DocumentTypeDto? DocumentType { get; set; }
    public CircuitDto? Circuit { get; set; }
    public DocumentUserDto? CreatedBy { get; set; }
    
    // ERP Integration
    public string? ERPDocumentCode { get; set; }
}
```

**Purpose**: Complete document information for API responses
**Usage**: All document GET operations
**Features**: Includes nested DTOs for related entities

#### Document Type DTO
```csharp
public class DocumentTypeDto
{
    public int? TypeNumber { get; set; }
    public string TypeKey { get; set; } = string.Empty;
    public string TypeName { get; set; } = string.Empty;
    public TierType TierType { get; set; } = TierType.None;
}
```

**Purpose**: Document type information
**Usage**: Document creation/editing forms

---

## Workflow Management DTOs

### File: `WorkflowDtos.cs`

#### Circuit Assignment DTO
```csharp
public class AssignCircuitDto
{
    public int DocumentId { get; set; }
    public int CircuitId { get; set; }
}
```

**Purpose**: Assign document to workflow circuit
**Usage**: POST `/api/Workflow/assign-circuit`

#### Status Transition DTO
```csharp
public class MoveToStatusDto
{
    public int DocumentId { get; set; }
    public int TargetStatusId { get; set; }
    public string Comments { get; set; } = string.Empty;
}
```

**Purpose**: Move document to specific status
**Usage**: POST `/api/Workflow/move-to-status`
**Note**: Replaced action-based workflow after Action system removal

#### Document Workflow Status DTO
```csharp
public class DocumentWorkflowStatusDto
{
    public int DocumentId { get; set; }
    public string DocumentTitle { get; set; } = string.Empty;
    public int? CircuitId { get; set; }
    public string CircuitTitle { get; set; } = string.Empty;
    public int? CurrentStatusId { get; set; }
    public string CurrentStatusTitle { get; set; } = string.Empty;
    public bool IsCircuitCompleted { get; set; }
    public int ProgressPercentage { get; set; }
    public List<DocumentStatusItemDto> Statuses { get; set; } = new();
    public List<StatusDto> AvailableStatusTransitions { get; set; } = new();
    public bool CanAdvanceToNextStep { get; set; }
    public bool CanReturnToPreviousStep { get; set; }
}
```

**Purpose**: Complete workflow status information
**Usage**: GET `/api/Workflow/document/{id}/workflow-status`
**Features**: Progress tracking, available transitions

#### Document History DTO
```csharp
public class DocumentHistoryDto
{
    public int Id { get; set; }
    public string EventType { get; set; } = string.Empty; // "Creation", "Update", "Workflow"
    public string StepTitle { get; set; } = string.Empty;
    public string StatusTitle { get; set; } = string.Empty;
    public string ProcessedBy { get; set; } = string.Empty;
    public DateTime ProcessedAt { get; set; }
    public string Comments { get; set; } = string.Empty;
    public bool IsApproved { get; set; }
}
```

**Purpose**: Document workflow history tracking
**Usage**: GET `/api/Workflow/document/{id}/history`
**Note**: ActionTitle removed after Action system removal

---

## Approval System DTOs

### File: `ApprovalDtos.cs`

#### Approval Response DTO
```csharp
public class ApprovalResponseDto
{
    public bool IsApproved { get; set; }
    public string Comments { get; set; } = string.Empty;
}
```

**Purpose**: User response to approval request
**Usage**: POST `/api/Approval/{id}/respond`

#### Pending Approval DTO
```csharp
public class PendingApprovalDto
{
    public int ApprovalId { get; set; }
    public int DocumentId { get; set; }
    public string DocumentKey { get; set; } = string.Empty;
    public string DocumentTitle { get; set; } = string.Empty;
    public string StepTitle { get; set; } = string.Empty;
    public string RequestedBy { get; set; } = string.Empty;
    public DateTime RequestDate { get; set; }
    public string ApprovalType { get; set; } = string.Empty; // "Single", "Group", "Sequential"
    public string CurrentStatusTitle { get; set; } = string.Empty;
    public string NextStatusTitle { get; set; } = string.Empty;
}
```

**Purpose**: Display pending approvals to users
**Usage**: GET `/api/Approval/pending`
**Features**: Approval type indication, status flow information

#### Approval History DTO
```csharp
public class ApprovalHistoryDto
{
    public int ApprovalId { get; set; }
    public string StepTitle { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public List<ApprovalResponseHistoryDto> Responses { get; set; } = new();
}
```

**Purpose**: Historical approval information
**Usage**: GET `/api/Approval/history/{documentId}`

#### Step Approval Configuration DTO
```csharp
public class StepApprovalConfigDto
{
    public int? SingleApproverId { get; set; }
    public int? ApprovatorsGroupId { get; set; }
}
```

**Purpose**: Configure approval settings for workflow steps
**Usage**: POST `/api/Approval/configure/step/{stepId}`

#### Approver Management DTOs
```csharp
public class CreateApprovatorDto
{
    public int UserId { get; set; }
    public string Comment { get; set; } = string.Empty;
}

public class CreateApprovatorsGroupDto
{
    public string Name { get; set; } = string.Empty;
    public string Comment { get; set; } = string.Empty;
    public List<int> UserIds { get; set; } = new();
    public string RuleType { get; set; } = "Any"; // "Any", "All", "Sequential", "MinimumWithRequired"
    public int? MinimumRequired { get; set; }
    public List<int>? RequiredUserIds { get; set; }
}
```

**Purpose**: Manage individual approvers and approval groups
**Usage**: Approval configuration endpoints

---

## Administrative DTOs

### File: `AdminDtos.cs`

#### User Creation DTO
```csharp
public class AdminCreateUserRequest
{
    public string Email { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string RoleName { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public int? ResponsibilityCenterId { get; set; }
    public string UserType { get; set; } = string.Empty;
}
```

**Purpose**: Admin user creation with complete profile
**Usage**: POST `/api/Admin/users`
**Security**: Admin role required

#### User Update DTO
```csharp
public class AdminUpdateUserRequest
{
    public string? Email { get; set; }
    public string? Username { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public bool? IsEmailConfirmed { get; set; }
    public string? RoleName { get; set; }
    public bool? IsActive { get; set; }
    public int? ResponsibilityCenterId { get; set; }
}
```

**Purpose**: Admin user updates with optional fields
**Usage**: PUT `/api/Admin/users/{id}`
**Pattern**: Nullable fields for partial updates

---

## Reference Data DTOs

### Line Element DTOs (`LineElementDtos.cs`)

#### Line Element Type DTO
```csharp
public class LignesElementTypeDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public ElementType TypeElement { get; set; }
    public string Description { get; set; } = string.Empty;
    public string TableName { get; set; } = string.Empty;
}
```

**Purpose**: Line element type information
**Usage**: Line creation forms, element type management

#### Item Management DTOs
```csharp
public class ItemDto
{
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Unite { get; set; } = string.Empty;
    public int LignesCount { get; set; }
}

public class ItemCreateDto
{
    public string Code { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Unite { get; set; } = string.Empty;
}
```

**Purpose**: Item management operations
**Usage**: Item CRUD operations

### Document Lines DTOs (`LignesDtos.cs`)

#### Line Creation DTO
```csharp
public class LigneCreateDto
{
    public int DocumentId { get; set; }
    public string Title { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal PriceHT { get; set; }
    public int? Type { get; set; }
    public string? ElementId { get; set; }
    public string? LocationCode { get; set; }
    public string? UnitCode { get; set; }
    public decimal DiscountAmount { get; set; }
}
```

**Purpose**: Create document lines
**Usage**: POST `/api/Lignes`

#### ERP Line Operation DTOs
```csharp
public class ErpLineCreateRequest
{
    public int TierTYpe { get; set; }          // 0 = None, 1 = Customer, 2 = Vendor
    public int DocType { get; set; }          // Document type number
    public string DocNo { get; set; } = string.Empty;        // ERP document number
    public int Type { get; set; }             // 1 = General Account, 2 = Item
    public string CodeLine { get; set; } = string.Empty;     // Element code
    public string DescriptionLine { get; set; } = string.Empty; // Line description
    public decimal Qty { get; set; }         // Quantity
    public decimal UnitpriceCOst { get; set; }  // Unit price
    public decimal DiscountAmt { get; set; }    // Discount amount
}

public class ErpOperationResult
{
    public bool IsSuccess { get; set; }
    public string? Value { get; set; }  // ERP code on success
    public string? ErrorMessage { get; set; }
    public string? ErrorDetails { get; set; }
    public int? StatusCode { get; set; }
    public string? ErrorType { get; set; }
}
```

**Purpose**: ERP integration for document lines
**Usage**: Line ERP operations
**Features**: Enhanced error reporting

---

## ERP Integration DTOs

### File: `ErpArchivalDtos.cs`

#### ERP Error Tracking DTO
```csharp
public class ErpArchivalErrorDto
{
    public int Id { get; set; }
    public int DocumentId { get; set; }
    public int? LigneId { get; set; }
    public string ErrorType { get; set; } = string.Empty;
    public string ErrorMessage { get; set; } = string.Empty;
    public string? ErrorDetails { get; set; }
    public DateTime OccurredAt { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public bool IsResolved { get; set; }
    public string? ResolutionNotes { get; set; }
}
```

**Purpose**: Track ERP integration errors
**Usage**: ERP error management endpoints

#### Document ERP Status DTO
```csharp
public class DocumentErpStatusDto
{
    public int DocumentId { get; set; }
    public bool IsArchived { get; set; }
    public string? ErpDocumentCode { get; set; }
    public bool HasErrors { get; set; }
    public bool HasUnresolvedErrors { get; set; }
    public List<ErpArchivalErrorDto> Errors { get; set; } = new();
    public List<LigneErpStatusDto> LigneStatuses { get; set; } = new();
    public string ArchivalStatusSummary { get; set; } = string.Empty;
}
```

**Purpose**: Complete ERP archival status
**Usage**: GET `/api/Documents/{id}/erp-status`
**Features**: Error tracking, line-level status

#### ERP Operation Request DTOs
```csharp
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
```

**Purpose**: ERP error resolution and retry operations
**Usage**: ERP error management

---

## Authentication & Authorization DTOs

### File: `AuthDtos.cs`

#### Authentication Request DTOs
```csharp
public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class RegisterRequest
{
    public string Email { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string CompanyName { get; set; } = string.Empty;
}
```

**Purpose**: User authentication operations
**Usage**: Login/register endpoints

#### Authentication Response DTOs
```csharp
public class AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public DateTime Expires { get; set; }
    public string RefreshToken { get; set; } = string.Empty;
    public UserInfoDto User { get; set; } = new();
}
```

**Purpose**: Authentication success response
**Usage**: Login/refresh token operations

### File: `AccountDtos.cs`

#### Account Management DTOs
```csharp
public class UpdateProfileRequest
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? City { get; set; }
    public string? Country { get; set; }
}

public class ChangePasswordRequest
{
    public string CurrentPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}
```

**Purpose**: User account self-management
**Usage**: Account update endpoints

---

## DTO Design Patterns

### Request/Response Pattern
```csharp
// Request DTO - Input validation, required fields
public class CreateEntityRequest
{
    [Required]
    public string Name { get; set; } = string.Empty;
    
    [MaxLength(500)]
    public string? Description { get; set; }
}

// Response DTO - Complete information, includes related data
public class EntityDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
    public UserDto CreatedBy { get; set; } = new();
}
```

### Update Pattern
```csharp
// All fields nullable for partial updates
public class UpdateEntityRequest
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    // Only include fields that can be updated
}
```

### Nested DTO Pattern
```csharp
public class DocumentDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    
    // Nested DTOs for related entities
    public DocumentTypeDto? DocumentType { get; set; }
    public CircuitDto? Circuit { get; set; }
    public DocumentUserDto? CreatedBy { get; set; }
}

// Simplified DTO for nested use
public class DocumentUserDto
{
    public string Username { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Role { get; set; }
}
```

### Collection DTOs
```csharp
public class PagedResultDto<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public bool HasNextPage => PageNumber * PageSize < TotalCount;
    public bool HasPreviousPage => PageNumber > 1;
}

// Usage
public class DocumentsPagedResult : PagedResultDto<DocumentDto> { }
```

### Error Response DTOs
```csharp
public class ErrorResponseDto
{
    public string Message { get; set; } = string.Empty;
    public string? ErrorCode { get; set; }
    public List<ValidationErrorDto> ValidationErrors { get; set; } = new();
}

public class ValidationErrorDto
{
    public string Field { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}
```

---

## Validation & Security

### Validation Attributes
```csharp
public class CreateDocumentRequest
{
    [Required(ErrorMessage = "Document title is required")]
    [MaxLength(200, ErrorMessage = "Title cannot exceed 200 characters")]
    public string Title { get; set; } = string.Empty;
    
    [Range(1, int.MaxValue, ErrorMessage = "Valid document type is required")]
    public int TypeId { get; set; }
    
    [EmailAddress(ErrorMessage = "Invalid email format")]
    public string? NotificationEmail { get; set; }
}
```

### Custom Validation
```csharp
public class ValidDateRange : ValidationAttribute
{
    public override bool IsValid(object? value)
    {
        if (value is DateTime date)
        {
            return date >= DateTime.Today && date <= DateTime.Today.AddYears(1);
        }
        return true; // Allow null values
    }
    
    public override string FormatErrorMessage(string name)
    {
        return $"{name} must be between today and one year from now.";
    }
}

// Usage
[ValidDateRange]
public DateTime? DocDate { get; set; }
```

### Data Sanitization
```csharp
public class CreateDocumentRequest
{
    private string _title = string.Empty;
    public string Title 
    { 
        get => _title;
        set => _title = value?.Trim() ?? string.Empty;
    }
    
    // Prevent HTML injection
    private string? _content;
    public string? Content
    {
        get => _content;
        set => _content = System.Net.WebUtility.HtmlEncode(value);
    }
}
```

### Security Considerations

#### Sensitive Data Exclusion
```csharp
// Never include sensitive data in response DTOs
public class UserDto
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    // PasswordHash is NEVER included in DTOs
    // RefreshToken is NEVER included in DTOs
}
```

#### Role-Based Data Filtering
```csharp
public class DocumentDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    
    // Conditionally included based on user role
    public decimal? TotalAmount { get; set; } // Only for FullUser/Admin
    public string? InternalNotes { get; set; } // Only for Admin
}
```

---

## Mapping Strategies

### Manual Mapping
```csharp
public static class DocumentMappings
{
    public static Expression<Func<Document, DocumentDto>> ToDocumentDto =>
        d => new DocumentDto
        {
            Id = d.Id,
            Title = d.Title,
            DocumentKey = d.DocumentKey,
            CreatedAt = d.CreatedAt,
            DocumentType = d.DocumentType != null ? new DocumentTypeDto
            {
                TypeKey = d.DocumentType.TypeKey,
                TypeName = d.DocumentType.TypeName,
                TierType = d.DocumentType.TierType
            } : null,
            CreatedBy = d.CreatedBy != null ? new DocumentUserDto
            {
                Username = d.CreatedBy.Username,
                FirstName = d.CreatedBy.FirstName,
                LastName = d.CreatedBy.LastName,
                Role = d.CreatedBy.Role != null ? d.CreatedBy.Role.RoleName : null
            } : null
        };
}

// Usage in controller
var documents = await _context.Documents
    .Include(d => d.DocumentType)
    .Include(d => d.CreatedBy).ThenInclude(u => u.Role)
    .Select(DocumentMappings.ToDocumentDto)
    .ToListAsync();
```

### AutoMapper Configuration
```csharp
public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Document, DocumentDto>()
            .ForMember(dest => dest.LignesCount, opt => opt.MapFrom(src => src.Lignes.Count))
            .ForMember(dest => dest.CreatedBy, opt => opt.MapFrom(src => src.CreatedBy));
            
        CreateMap<CreateDocumentRequest, Document>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow));
    }
}
```

---

## Performance Considerations

### DTO Size Optimization
```csharp
// Full DTO for detailed views
public class DocumentDetailDto : DocumentDto
{
    public List<LigneDto> Lignes { get; set; } = new();
    public List<DocumentHistoryDto> History { get; set; } = new();
}

// Lightweight DTO for list views
public class DocumentSummaryDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string DocumentKey { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string CreatedByUsername { get; set; } = string.Empty;
}
```

### Projection Optimization
```csharp
// Direct database projection to DTO
var documentSummaries = await _context.Documents
    .Where(d => d.Status == 1)
    .Select(d => new DocumentSummaryDto
    {
        Id = d.Id,
        Title = d.Title,
        DocumentKey = d.DocumentKey,
        CreatedAt = d.CreatedAt,
        CreatedByUsername = d.CreatedBy.Username
    })
    .ToListAsync();
```

### Lazy Loading DTOs
```csharp
public class DocumentDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    
    // Load details on demand
    public List<LigneDto>? Lignes { get; set; } // Null unless explicitly requested
    public List<DocumentHistoryDto>? History { get; set; } // Null unless explicitly requested
}
```

---

## Best Practices

### DTO Design Guidelines
1. **Single Responsibility**: Each DTO serves a specific purpose
2. **Immutable When Possible**: Use readonly properties for response DTOs
3. **Validation Attributes**: Include appropriate validation on request DTOs
4. **Null Safety**: Use nullable reference types appropriately
5. **Documentation**: Include XML comments for complex DTOs

### Naming Conventions
1. **Request DTOs**: `CreateEntityRequest`, `UpdateEntityRequest`
2. **Response DTOs**: `EntityDto`, `EntityDetailDto`, `EntitySummaryDto`
3. **Nested DTOs**: `EntityParentDto` (simplified version for nesting)
4. **Collection DTOs**: `EntityListDto`, `PagedEntityResult`

### Security Best Practices
1. **Never expose passwords** or sensitive authentication data
2. **Filter data by user role** when necessary
3. **Validate all input** with appropriate attributes
4. **Sanitize user input** to prevent injection attacks
5. **Use HTTPS** for all API communications

### Performance Best Practices
1. **Use projection** to avoid loading unnecessary data
2. **Create lightweight DTOs** for list operations
3. **Implement caching** for frequently accessed reference DTOs
4. **Avoid deep nesting** in response DTOs
5. **Use pagination** for large result sets

This comprehensive DTO documentation ensures consistent, secure, and performant data transfer throughout the Document Management System. 