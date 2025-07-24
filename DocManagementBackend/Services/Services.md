# Services Documentation

## Overview
The Services layer contains the business logic and domain services for the Document Management System. These services encapsulate complex business operations, external integrations, and provide a clean separation between controllers and data access layers.

## Table of Contents
1. [Service Architecture](#service-architecture)
2. [Workflow Management Services](#workflow-management-services)
3. [ERP Integration Services](#erp-integration-services)
4. [External API Services](#external-api-services)
5. [Authentication & Authorization Services](#authentication--authorization-services)
6. [Communication Services](#communication-services)
7. [Background Services](#background-services)
8. [Configuration & Setup](#configuration--setup)
9. [Error Handling](#error-handling)
10. [Best Practices](#best-practices)

---

## Service Architecture

### Design Principles
- **Single Responsibility**: Each service handles a specific business domain
- **Dependency Injection**: All services are registered in DI container
- **Interface Segregation**: Services expose clean interfaces
- **Separation of Concerns**: Business logic separated from controllers
- **Transactional Integrity**: Services manage database transactions

### Service Registration Pattern
```csharp
// In Program.cs
builder.Services.AddScoped<IDocumentErpArchivalService, DocumentErpArchivalService>();
builder.Services.AddScoped<DocumentWorkflowService>();
builder.Services.AddScoped<UserAuthorizationService>();
builder.Services.AddScoped<CircuitManagementService>();
builder.Services.AddScoped<IApiSyncService, ApiSyncService>();
builder.Services.AddScoped<IBcApiClient, BcApiClient>();
builder.Services.AddScoped<IEmailVerificationService, EmailVerificationService>();
builder.Services.AddScoped<LineElementService>();
builder.Services.AddSingleton<SmsVerificationService>();
builder.Services.AddHostedService<ApiSyncBackgroundService>();
```

### Service Dependencies
```
Controllers
    ↓
Services (Business Logic)
    ↓
Data Access Layer (ApplicationDbContext)
    ↓
External APIs/Systems
```

---

## Workflow Management Services

### DocumentWorkflowService
**File**: `DocumentWorkflowService.cs` (1,694 lines)
**Purpose**: Manages document workflow, circuit processing, and status transitions.

#### Core Responsibilities
- Document-to-circuit assignment
- Workflow status transitions  
- Approval process management
- Document history tracking
- ERP archival triggers

#### Key Methods

##### Circuit Assignment
```csharp
public async Task<bool> AssignDocumentToCircuitAsync(int documentId, int circuitId, int userId)
```
**Purpose**: Assigns document to workflow circuit and initializes status
**Process**:
1. Validates document and circuit existence
2. Sets initial status from circuit configuration
3. Creates DocumentStatus records for all circuit statuses
4. Records circuit history entry
5. Triggers ERP archival for final statuses

##### Status Transitions
```csharp
public async Task<bool> MoveToStatusAsync(int documentId, int targetStatusId, int userId, string? comments = null)
```
**Purpose**: Moves document to specific status with validation
**Features**:
- Validates status transition rules
- Checks circuit flow constraints
- Handles approval requirements
- Updates document history
- Triggers ERP archival on completion

##### Approval Processing
```csharp
public async Task<bool> ProcessApprovalResponseAsync(int approvalId, int userId, bool isApproved, string? comments = null)
```
**Purpose**: Processes individual and group approval responses
**Logic**:
- Validates user authorization to approve
- Records approval response
- Evaluates group approval rules (Any, All, Sequential, MinimumWithRequired)
- Advances workflow on approval completion
- Handles rejection scenarios

#### Workflow Status Management
```csharp
public async Task<DocumentWorkflowStatusDto> GetDocumentWorkflowStatusAsync(int documentId)
```
**Returns**: Complete workflow status including:
- Current status and step information
- Progress percentage calculation
- Available status transitions
- Step history and approval status
- Circuit completion indicators

#### ERP Integration Points
- **Automatic Archival**: Triggers ERP archival when documents reach final status
- **Status Validation**: Checks ERP archival status before certain transitions
- **Error Handling**: Manages ERP errors during workflow processing

### CircuitManagementService
**File**: `CircuitManagementService.cs` (499 lines)
**Purpose**: Manages workflow circuits, steps, and configuration.

#### Core Responsibilities
- Circuit CRUD operations
- Step management and configuration
- Status flow validation
- Circuit activation/deactivation

#### Key Methods
```csharp
public async Task<bool> CreateCircuitAsync(CreateCircuitDto circuitDto, int userId)
public async Task<bool> UpdateCircuitAsync(int circuitId, UpdateCircuitDto circuitDto, int userId)
public async Task<List<CircuitDto>> GetActiveCircuitsForDocumentTypeAsync(int documentTypeId)
public async Task<bool> ValidateCircuitFlowAsync(int circuitId)
```

#### Circuit Validation Features
- **Flow Integrity**: Ensures all statuses have valid transitions
- **Initial/Final Status**: Validates proper workflow entry/exit points
- **Step Configuration**: Verifies approval assignments and requirements
- **Dependency Checking**: Prevents deletion of circuits with active documents

---

## ERP Integration Services

### DocumentErpArchivalService
**File**: `DocumentErpArchivalService.cs` (1,121 lines)
**Purpose**: Handles ERP integration for document archival and line creation.

#### Interface Definition
```csharp
public interface IDocumentErpArchivalService
{
    Task<bool> ArchiveDocumentToErpAsync(int documentId, bool isRetry = false);
    Task<bool> IsDocumentArchived(int documentId);
    Task<bool> CreateDocumentLinesInErpAsync(int documentId);
    Task<DocumentErpStatusDto> GetDocumentErpStatusAsync(int documentId);
    Task<List<ErpArchivalErrorDto>> GetDocumentErpErrorsAsync(int documentId);
    Task<bool> ResolveErpErrorAsync(int errorId, int userId, string resolutionNotes);
    Task<bool> RetryDocumentArchivalAsync(int documentId, int userId, string? reason = null);
    Task<bool> RetryLineArchivalAsync(int documentId, List<int> ligneIds, int userId, string? reason = null);
}
```

#### Document Archival Process
```csharp
public async Task<bool> ArchiveDocumentToErpAsync(int documentId, bool isRetry = false)
```

**Process Flow**:
1. **Validation**: Check document completeness and circuit completion
2. **Document Creation**: Create document header in Business Central
3. **Line Processing**: Create individual lines for each document ligne
4. **Status Update**: Update document with ERP codes
5. **Error Handling**: Capture and categorize any failures

#### ERP Payload Construction
```csharp
private object BuildErpPayload(Document document, DocumentType documentType)
{
    return new
    {
        tierTYpe = GetTierType(documentType.TierType),
        type = documentType.TypeNumber,
        custVendoNo = document.CustomerVendorCode ?? "",
        documentDate = document.DocDate.ToString("yyyy-MM-dd"),
        postingDate = document.ComptableDate.ToString("yyyy-MM-dd"),
        responsabilityCentre = document.ResponsibilityCentre?.Code ?? "",
        externalDocNo = document.DocumentExterne ?? ""
    };
}
```

#### Enhanced Error Handling
```csharp
public class ErpOperationResult
{
    public bool IsSuccess { get; set; }
    public string? Value { get; set; }
    public string? ErrorMessage { get; set; }
    public string? ErrorDetails { get; set; }
    public int? StatusCode { get; set; }
    public string? ErrorType { get; set; }
}
```

**Error Categories**:
- **NetworkError**: Connection and timeout issues
- **ValidationError**: Data validation failures
- **AuthenticationError**: Credential problems
- **BusinessRuleError**: ERP business logic violations
- **ServiceUnavailableError**: System availability issues

#### Line Creation Process
```csharp
public async Task<bool> CreateDocumentLinesInErpAsync(int documentId)
```

**Features**:
- Individual line validation and processing
- Unit conversion handling
- Location and unit of measure validation
- Detailed error tracking per line
- Retry mechanisms for transient failures

---

## External API Services

### ApiSyncService
**File**: `ApiSyncService.cs` (808 lines)  
**Purpose**: Synchronizes reference data with Business Central ERP system.

#### Interface Definition
```csharp
public interface IApiSyncService
{
    Task<SyncResult> SyncItemsAsync();
    Task<SyncResult> SyncGeneralAccountsAsync();
    Task<SyncResult> SyncCustomersAsync();
    Task<SyncResult> SyncVendorsAsync();
    Task<SyncResult> SyncLocationsAsync();
    Task<SyncResult> SyncResponsibilityCentresAsync();
    Task<SyncResult> SyncUnitOfMeasuresAsync();
    Task<SyncResult> SyncItemUnitOfMeasuresAsync();
    Task<List<SyncResult>> SyncAllAsync();
    Task<SyncResult> SyncEndpointAsync(ApiEndpointType endpointType);
}
```

#### Synchronization Strategy
**Order of Operations**: Services must sync in specific order due to dependencies:
1. **UnitOfMeasures** (foundational data)
2. **Items** (depends on UnitOfMeasures)
3. **GeneralAccounts** (independent)
4. **Customers & Vendors** (independent)
5. **Locations** (independent)
6. **ResponsibilityCentres** (independent)
7. **ItemUnitOfMeasures** (depends on Items and UnitOfMeasures)

#### Sync Configuration
```csharp
private readonly List<ApiEndpointConfig> _endpoints = new()
{
    new() { Name = "Items", Url = "http://localhost:25048/BC250/api/bslink/docverse/v1.0/items", 
            Type = ApiEndpointType.Items, DefaultPollingIntervalMinutes = 60 },
    new() { Name = "GeneralAccounts", Url = "http://localhost:25048/BC250/api/bslink/docverse/v1.0/accounts", 
            Type = ApiEndpointType.GeneralAccounts, DefaultPollingIntervalMinutes = 60 },
    // ... other endpoints
};
```

#### Data Processing Pattern
```csharp
public async Task<SyncResult> SyncItemsAsync()
{
    var stopwatch = Stopwatch.StartNew();
    var result = new SyncResult { EndpointName = "Items", SyncTime = DateTime.UtcNow };
    
    try
    {
        // 1. Fetch data from Business Central
        var apiResponse = await _bcApiClient.GetItemsAsync();
        
        // 2. Process and validate data
        var items = apiResponse?.Value ?? new List<BcItemDto>();
        
        // 3. Update local database
        foreach (var bcItem in items)
        {
            var existingItem = await _context.Items.FindAsync(bcItem.No);
            if (existingItem == null)
            {
                // Create new item
                var newItem = new Item
                {
                    Code = bcItem.No,
                    Description = bcItem.Description,
                    Unite = bcItem.BaseUnitofMeasure,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.Items.Add(newItem);
                result.RecordsInserted++;
            }
            else
            {
                // Update existing item
                existingItem.Description = bcItem.Description;
                existingItem.Unite = bcItem.BaseUnitofMeasure;
                existingItem.UpdatedAt = DateTime.UtcNow;
            }
            result.RecordsProcessed++;
        }
        
        await _context.SaveChangesAsync();
        result.IsSuccess = true;
    }
    catch (Exception ex)
    {
        result.IsSuccess = false;
        result.ErrorMessage = ex.Message;
        _logger.LogError(ex, "Error syncing items");
    }
    
    result.Duration = stopwatch.Elapsed;
    return result;
}
```

### BcApiClient
**File**: `BcApiClient.cs` (192 lines)
**Purpose**: HTTP client for Business Central API communication.

#### Authentication Configuration
```csharp
public BcApiClient(HttpClient httpClient, ILogger<BcApiClient> logger, IConfiguration configuration)
{
    // NTLM authentication setup
    _username = Environment.GetEnvironmentVariable("USERNAME") ?? configuration["BcApi:Username"];
    _password = Environment.GetEnvironmentVariable("PASSWORD") ?? configuration["BcApi:Password"];
    _domain = Environment.GetEnvironmentVariable("DOMAIN") ?? configuration["BcApi:Domain"];
    
    ConfigureHttpClient();
}
```

#### API Endpoints
```csharp
public async Task<BcApiResponse<BcItemDto>?> GetItemsAsync()
    => await GetDataAsync<BcApiResponse<BcItemDto>>("http://localhost:25048/BC250/api/bslink/docverse/v1.0/items");

public async Task<BcApiResponse<BcCustomerDto>?> GetCustomersAsync() 
    => await GetDataAsync<BcApiResponse<BcCustomerDto>>("http://localhost:25048/BC250/api/bslink/docverse/v1.0/customers");
```

#### Generic Data Retrieval
```csharp
public async Task<T?> GetDataAsync<T>(string endpoint) where T : class
{
    try
    {
        _logger.LogInformation("Making API call to: {Endpoint}", endpoint);
        
        var response = await _httpClient.GetAsync(endpoint);
        
        if (response.IsSuccessStatusCode)
        {
            var content = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<T>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
        }
        
        _logger.LogWarning("API call failed with status: {StatusCode}", response.StatusCode);
        return null;
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error calling API endpoint: {Endpoint}", endpoint);
        return null;
    }
}
```

---

## Authentication & Authorization Services

### UserAuthorizationService
**File**: `UserAuthorizationService.cs` (50 lines)
**Purpose**: Centralizes user authorization logic across controllers.

#### Authorization Pattern
```csharp
public async Task<(bool IsAuthorized, ActionResult? ErrorResponse, User? User, int UserId)> AuthorizeUserAsync(
    ClaimsPrincipal userClaims, 
    string[]? allowedRoles = null)
{
    // Default roles if none specified
    allowedRoles ??= new[] { "Admin", "FullUser", "SimpleUser" };
    
    // Extract and validate user ID from claims
    var userIdClaim = userClaims.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    if (userIdClaim == null)
        return (false, new UnauthorizedObjectResult("User ID claim is missing."), null, 0);
    
    // Load user with role and responsibility center
    var user = await _context.Users
        .Include(u => u.Role)
        .Include(u => u.ResponsibilityCentre)
        .FirstOrDefaultAsync(u => u.Id == userId);
    
    // Validate user status and role
    if (user == null)
        return (false, new BadRequestObjectResult("User not found."), null, userId);
    
    if (!user.IsActive)
        return (false, new UnauthorizedObjectResult("User account is deactivated."), null, userId);
    
    if (user.Role == null || !allowedRoles.Contains(user.Role.RoleName))
        return (false, new UnauthorizedObjectResult("Insufficient permissions."), null, userId);
    
    return (true, null, user, userId);
}
```

#### Usage in Controllers
```csharp
[HttpPost]
public async Task<IActionResult> CreateDocument([FromBody] CreateDocumentRequest request)
{
    var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
    if (!authResult.IsAuthorized)
        return authResult.ErrorResponse!;
    
    var userId = authResult.UserId;
    var user = authResult.User!;
    
    // Continue with business logic...
}
```

---

## Communication Services

### EmailVerificationService
**File**: `EmailVerificationService.cs` (183 lines)
**Purpose**: Validates email addresses using external API service.

#### Email Validation Process
```csharp
public async Task<bool> VerifyEmailExistsAsync(string email)
{
    // 1. Basic format validation
    if (!IsValidEmailFormat(email))
        return false;
    
    // 2. External API validation (Abstract API)
    var apiUrl = $"https://emailvalidation.abstractapi.com/v1/?api_key={_apiKey}&email={Uri.EscapeDataString(email)}";
    var response = await _httpClient.GetAsync(apiUrl);
    
    // 3. Parse and evaluate response
    var apiResult = JsonSerializer.Deserialize<AbstractApiResponse>(jsonResponse);
    
    // 4. Multi-factor validation
    var isValidFormat = apiResult.IsValidFormat?.Value == true;
    var hasMxRecord = apiResult.IsMxFound?.Value == true;
    var isDeliverable = apiResult.Deliverability?.ToUpperInvariant() == "DELIVERABLE";
    var isDisposable = apiResult.IsDisposableEmail?.Value == true;
    
    // Return comprehensive validation result
    return isValidFormat && hasMxRecord && isDeliverable && !isDisposable;
}
```

#### Fallback Strategy
- **Development Mode**: Skip validation if API key not configured
- **API Failure**: Allow registration to continue if external service fails
- **Rate Limiting**: Handle API rate limits gracefully

### SmsVerificationService
**File**: `SmsVerificationService.cs` (82 lines)
**Purpose**: Handles SMS-based verification for phone numbers.

#### SMS Integration
```csharp
public async Task<bool> SendVerificationCodeAsync(string phoneNumber)
{
    var verificationCode = GenerateVerificationCode();
    var message = $"Your DocuVerse verification code is: {verificationCode}";
    
    // Integration with SMS provider (Twilio, etc.)
    return await SendSmsAsync(phoneNumber, message);
}

public bool VerifyCode(string phoneNumber, string providedCode)
{
    // Validate against stored verification codes
    return _verificationCodes.TryGetValue(phoneNumber, out var storedCode) && 
           storedCode.Code == providedCode && 
           storedCode.ExpiresAt > DateTime.UtcNow;
}
```

---

## Background Services

### ApiSyncBackgroundService
**File**: `ApiSyncBackgroundService.cs` (201 lines)
**Purpose**: Runs automatic synchronization with Business Central on schedule.

#### Background Service Implementation
```csharp
public class ApiSyncBackgroundService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<ApiSyncBackgroundService> _logger;
    private readonly Timer _timer;
    
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("API Sync Background Service started");
        
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await PerformScheduledSyncAsync();
                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken); // Check every 5 minutes
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in background sync service");
                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken); // Wait before retry
            }
        }
    }
    
    private async Task PerformScheduledSyncAsync()
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var apiSyncService = scope.ServiceProvider.GetRequiredService<IApiSyncService>();
        
        // Get configurations that are due for sync
        var dueConfigs = await context.ApiSyncConfigurations
            .Where(c => c.IsEnabled && c.NextSyncTime <= DateTime.UtcNow)
            .ToListAsync();
        
        foreach (var config in dueConfigs)
        {
            try
            {
                _logger.LogInformation("Starting scheduled sync for: {EndpointName}", config.EndpointName);
                
                var result = await apiSyncService.SyncEndpointAsync(
                    Enum.Parse<ApiEndpointType>(config.EndpointName));
                
                // Update configuration with sync results
                config.LastSyncTime = DateTime.UtcNow;
                config.NextSyncTime = DateTime.UtcNow.AddMinutes(config.PollingIntervalMinutes);
                config.LastSyncStatus = result.IsSuccess ? "Success" : "Failed";
                config.LastErrorMessage = result.ErrorMessage;
                
                if (result.IsSuccess)
                    config.SuccessfulSyncs++;
                else
                    config.FailedSyncs++;
                
                await context.SaveChangesAsync();
                
                _logger.LogInformation("Completed sync for {EndpointName}: {Status}", 
                    config.EndpointName, result.IsSuccess ? "Success" : "Failed");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error syncing endpoint: {EndpointName}", config.EndpointName);
            }
        }
    }
}
```

#### Service Registration
```csharp
// In Program.cs
builder.Services.AddHostedService<ApiSyncBackgroundService>();
```

---

## Configuration & Setup

### Service Dependencies
```csharp
// DocumentWorkflowService dependencies
public DocumentWorkflowService(
    ApplicationDbContext context,
    IDocumentErpArchivalService erpArchivalService,
    ILogger<DocumentWorkflowService> logger,
    IServiceProvider serviceProvider)
```

### Configuration Requirements

#### ERP Integration Settings
```json
{
  "BCApi": {
    "Username": "domain\\username",
    "Password": "password",
    "Domain": "domain",
    "Workstation": "workstation-name"
  }
}
```

#### External Service Settings
```json
{
  "ExternalServices": {
    "AbstractApiKey": "email-verification-api-key",
    "TwilioAccountSid": "sms-service-account",
    "TwilioAuthToken": "sms-service-token"
  }
}
```

### Environment Variables
```bash
# Authentication
JWT_SECRET=your-jwt-secret-key
ISSUER=DocuVerse
AUDIENCE=DocuVerse-Users

# Email
EMAIL_ADDRESS=notifications@company.com
EMAIL_PASSWORD=email-app-password

# Business Central
USERNAME=bc-username
PASSWORD=bc-password
DOMAIN=company-domain
WORKSTATION=api-client

# External APIs
ABSTRACT_API_KEY=email-validation-key
```

---

## Error Handling

### Service-Level Error Patterns

#### Standard Error Response
```csharp
public class ServiceResult<T>
{
    public bool IsSuccess { get; set; }
    public T? Data { get; set; }
    public string? ErrorMessage { get; set; }
    public List<string> ValidationErrors { get; set; } = new();
}
```

#### Exception Handling Strategy
```csharp
public async Task<ServiceResult<DocumentDto>> CreateDocumentAsync(CreateDocumentRequest request, int userId)
{
    try
    {
        // Business logic implementation
        var document = await CreateDocument(request, userId);
        
        return new ServiceResult<DocumentDto>
        {
            IsSuccess = true,
            Data = document
        };
    }
    catch (ValidationException ex)
    {
        return new ServiceResult<DocumentDto>
        {
            IsSuccess = false,
            ErrorMessage = "Validation failed",
            ValidationErrors = ex.Errors.ToList()
        };
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Error creating document for user {UserId}", userId);
        
        return new ServiceResult<DocumentDto>
        {
            IsSuccess = false,
            ErrorMessage = "An unexpected error occurred"
        };
    }
}
```

#### Transactional Operations
```csharp
public async Task<bool> ProcessWorkflowTransitionAsync(int documentId, int targetStatusId, int userId)
{
    using var transaction = await _context.Database.BeginTransactionAsync();
    
    try
    {
        // 1. Update document status
        await UpdateDocumentStatusAsync(documentId, targetStatusId, userId);
        
        // 2. Create history entry
        await CreateHistoryEntryAsync(documentId, targetStatusId, userId);
        
        // 3. Trigger approval process if needed
        await TriggerApprovalProcessAsync(documentId, targetStatusId);
        
        // 4. Handle ERP integration
        await HandleErpIntegrationAsync(documentId);
        
        await transaction.CommitAsync();
        return true;
    }
    catch (Exception ex)
    {
        await transaction.RollbackAsync();
        _logger.LogError(ex, "Error processing workflow transition for document {DocumentId}", documentId);
        throw;
    }
}
```

---

## Best Practices

### Service Design Guidelines

#### 1. Interface Segregation
```csharp
// Good: Focused interface
public interface IDocumentWorkflowService
{
    Task<bool> AssignToCircuitAsync(int documentId, int circuitId, int userId);
    Task<bool> MoveToStatusAsync(int documentId, int statusId, int userId);
}

// Bad: Large interface with multiple responsibilities
public interface IDocumentService
{
    // Workflow methods
    Task<bool> AssignToCircuitAsync(int documentId, int circuitId, int userId);
    // CRUD methods  
    Task<DocumentDto> CreateAsync(CreateDocumentRequest request);
    // ERP methods
    Task<bool> ArchiveToErpAsync(int documentId);
    // Reporting methods
    Task<List<ReportDto>> GenerateReportsAsync();
}
```

#### 2. Dependency Management
```csharp
// Good: Minimal dependencies
public class DocumentWorkflowService
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<DocumentWorkflowService> _logger;
    
    // Only inject what you need
}

// Bad: Too many dependencies
public class DocumentWorkflowService
{
    private readonly ApplicationDbContext _context;
    private readonly IEmailService _emailService;
    private readonly ISmsService _smsService;
    private readonly IReportService _reportService;
    private readonly ICacheService _cacheService;
    // ... many more dependencies
}
```

#### 3. Error Handling
```csharp
// Good: Structured error handling
public async Task<ServiceResult<T>> DoSomethingAsync<T>(int id)
{
    try
    {
        var result = await ProcessAsync(id);
        return ServiceResult<T>.Success(result);
    }
    catch (ValidationException ex)
    {
        return ServiceResult<T>.ValidationError(ex.Message);
    }
    catch (EntityNotFoundException ex)
    {
        return ServiceResult<T>.NotFound(ex.Message);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, "Unexpected error processing {Id}", id);
        return ServiceResult<T>.Error("An unexpected error occurred");
    }
}
```

#### 4. Async/Await Pattern
```csharp
// Good: Proper async implementation
public async Task<List<DocumentDto>> GetDocumentsAsync(int userId)
{
    var documents = await _context.Documents
        .Where(d => d.CreatedByUserId == userId)
        .Select(DocumentMappings.ToDocumentDto)
        .ToListAsync();
    
    return documents;
}

// Bad: Blocking async calls
public List<DocumentDto> GetDocuments(int userId)
{
    var documents = _context.Documents
        .Where(d => d.CreatedByUserId == userId)
        .Select(DocumentMappings.ToDocumentDto)
        .ToListAsync()
        .Result; // DON'T DO THIS
    
    return documents;
}
```

#### 5. Resource Management
```csharp
// Good: Proper resource disposal
public async Task<bool> ProcessLargeDatasetAsync()
{
    using var scope = _serviceProvider.CreateScope();
    using var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    
    // Process data with proper cleanup
    return await ProcessWithCleanupAsync(context);
}

// Good: HTTP client management
public class ExternalApiService : IDisposable
{
    private readonly HttpClient _httpClient;
    
    public ExternalApiService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }
    
    public void Dispose()
    {
        _httpClient?.Dispose();
    }
}
```

### Performance Guidelines

#### 1. Database Query Optimization
```csharp
// Good: Efficient queries with projection
public async Task<List<DocumentSummaryDto>> GetDocumentSummariesAsync()
{
    return await _context.Documents
        .Where(d => d.IsActive)
        .Select(d => new DocumentSummaryDto
        {
            Id = d.Id,
            Title = d.Title,
            CreatedAt = d.CreatedAt
        })
        .ToListAsync();
}

// Bad: Loading full entities
public async Task<List<DocumentSummaryDto>> GetDocumentSummariesAsync()
{
    var documents = await _context.Documents
        .Include(d => d.CreatedBy)
        .Include(d => d.Lignes)
        .Where(d => d.IsActive)
        .ToListAsync(); // Loads everything
    
    return documents.Select(d => new DocumentSummaryDto { /* ... */ }).ToList();
}
```

#### 2. Caching Strategy
```csharp
public class ReferenceDataService
{
    private readonly IMemoryCache _cache;
    
    public async Task<List<DocumentTypeDto>> GetDocumentTypesAsync()
    {
        return await _cache.GetOrCreateAsync("DocumentTypes", async entry =>
        {
            entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(1);
            return await LoadDocumentTypesFromDatabaseAsync();
        });
    }
}
```

#### 3. Background Processing
```csharp
// Good: Fire-and-forget for non-critical operations
public async Task<bool> ProcessDocumentAsync(int documentId)
{
    var result = await ProcessCriticalPartAsync(documentId);
    
    // Non-critical operation runs in background
    _ = Task.Run(async () =>
    {
        try
        {
            await SendNotificationsAsync(documentId);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to send notifications for document {DocumentId}", documentId);
        }
    });
    
    return result;
}
```

This comprehensive services documentation provides developers with detailed understanding of the business logic layer, integration patterns, and best practices for maintaining and extending the Document Management System. 