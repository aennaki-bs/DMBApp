using DocManagementBackend.Data;
using DocManagementBackend.Models;
using DocManagementBackend.ModelsDtos;
using Microsoft.EntityFrameworkCore;
using System.Text;
using System.Text.Json;
using System.Net;

namespace DocManagementBackend.Services
{
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

    public class DocumentErpArchivalService : IDocumentErpArchivalService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<DocumentErpArchivalService> _logger;
        private readonly HttpClient _httpClient;
        private readonly string _username;
        private readonly string _password;
        private readonly string _domain;
        private readonly string _workstation;

        private readonly IServiceProvider _serviceProvider;

        public DocumentErpArchivalService(
            ApplicationDbContext context,
            ILogger<DocumentErpArchivalService> logger,
            IHttpClientFactory httpClientFactory,
            IConfiguration configuration,
            IServiceProvider serviceProvider)
        {
            _context = context;
            _serviceProvider = serviceProvider;
            _logger = logger;
            
            // Get NTLM credentials from configuration
            _username = configuration["BCApi:Username"] ?? throw new InvalidOperationException("BCApi:Username not configured");
            _password = configuration["BCApi:Password"] ?? throw new InvalidOperationException("BCApi:Password not configured");
            _domain = configuration["BCApi:Domain"] ?? "";
            _workstation = configuration["BCApi:Workstation"] ?? "";

            // Create HttpClient with NTLM authentication
            var handler = new HttpClientHandler()
            {
                Credentials = new NetworkCredential(_username, _password, _domain)
            };
            _httpClient = new HttpClient(handler);
            ConfigureHttpClient();
        }

        private void ConfigureHttpClient()
        {
            try
            {
                _logger.LogInformation("Configuring HTTP client for ERP archival - Username: {Username}, Domain: {Domain}", 
                    _username, _domain);
                
                _httpClient.DefaultRequestHeaders.Add("User-Agent", "DocVerse-ErpArchival/1.0");
                _httpClient.DefaultRequestHeaders.Add("Accept", "application/json");
                _httpClient.Timeout = TimeSpan.FromMinutes(5); // 5 minute timeout for ERP calls
                
                _logger.LogInformation("HTTP client configured successfully for NTLM authentication");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error configuring HTTP client for ERP archival");
                throw;
            }
        }

        public async Task<bool> ArchiveDocumentToErpAsync(int documentId, bool isRetry = false)
        {
            // Use a new scope and context to avoid Entity Framework concurrency issues
            using var scope = _serviceProvider.CreateScope();
            using var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            
            try
            {
                _logger.LogInformation("Starting ERP archival for document ID: {DocumentId}", documentId);

                // Check if document is already fully archived
                var existingDocument = await context.Documents
                    .AsNoTracking()
                    .FirstOrDefaultAsync(d => d.Id == documentId);
                    
                if (existingDocument != null && existingDocument.IsArchived)
                {
                    _logger.LogInformation("Document {DocumentId} is already fully archived to ERP", documentId);
                    return true;
                }

                // Get document with all necessary relationships
                var document = await context.Documents
                    .Include(d => d.DocumentType)
                    .Include(d => d.ResponsibilityCentre)
                    .FirstOrDefaultAsync(d => d.Id == documentId);

                if (document == null)
                {
                    _logger.LogError("Document {DocumentId} not found for ERP archival", documentId);
                    return false;
                }

                // NEW LOGIC: If document already has ERP code, just proceed to line archival
                if (!string.IsNullOrEmpty(document.ERPDocumentCode))
                {
                    _logger.LogInformation("Document {DocumentId} already has ERP code {ErpCode}, proceeding to line archival", 
                        documentId, document.ERPDocumentCode);
                    
                    // Proceed to line archival with rollback logic
                    return await ProcessLinesArchivalWithRollback(documentId, context, isRetry);
                }

                // Build the API request payload
                var payload = await BuildErpPayload(document);
                
                // Make the API call to Business Center
                var erpResult = await CallBusinessCenterApi(payload);
                
                if (erpResult.IsSuccess)
                {
                    // Check if this ERP code already exists in another document OF THE SAME TYPE
                    var existingDocumentWithCode = await context.Documents
                        .AsNoTracking()
                        .FirstOrDefaultAsync(d => d.Id != documentId && 
                                               d.TypeId == document.TypeId && 
                                               d.ERPDocumentCode == erpResult.Value);
                    
                    if (existingDocumentWithCode != null)
                    {
                        _logger.LogError("ERP returned duplicate document code {ErpCode} for document {DocumentId} (Type: {TypeId}). Code already exists in document {ExistingDocumentId} of the same type", 
                            erpResult.Value, documentId, document.TypeId, existingDocumentWithCode.Id);
                        
                        // Record this as a business rule error
                        await RecordErpErrorAsync(context, documentId, null, ErpErrorType.BusinessRuleError, 
                            $"Duplicate ERP document code '{erpResult.Value}' returned by ERP system for document type", 
                            $"ERP code '{erpResult.Value}' already exists in document ID {existingDocumentWithCode.Id} of the same document type ({document.TypeId}). This indicates a numbering issue in the ERP system for this document type.");
                        
                        // Document archival failed - stays "Completed" but not "Archived"
                        return false;
                    }
                    
                    try
                    {
                        // Update document with ERP document code (but not yet marked as archived)
                        document.ERPDocumentCode = erpResult.Value;
                        document.UpdatedAt = DateTime.UtcNow;
                        
                        await context.SaveChangesAsync();
                        
                        _logger.LogInformation("Document {DocumentId} successfully archived to ERP with code: {ErpCode}", 
                            documentId, erpResult.Value);
                        
                        // NEW LOGIC: Process lines with rollback capability
                        return await ProcessLinesArchivalWithRollback(documentId, context, isRetry);
                    }
                    catch (DbUpdateException dbEx) when (dbEx.InnerException?.Message?.Contains("IX_Documents_ERPDocumentCode") == true)
                    {
                        // Handle the unique constraint violation specifically
                        _logger.LogError(dbEx, "Unique constraint violation when saving ERP code {ErpCode} for document {DocumentId} (Type: {TypeId})", 
                            erpResult.Value, documentId, document.TypeId);
                        
                        // Record this as a business rule error with detailed information
                        await RecordErpErrorAsync(context, documentId, null, ErpErrorType.BusinessRuleError, 
                            $"Duplicate ERP document code '{erpResult.Value}' - database constraint violation for document type", 
                            $"Database unique constraint 'IX_Documents_ERPDocumentCode_TypeId' prevented saving duplicate ERP code '{erpResult.Value}' for document type {document.TypeId}. This indicates concurrent access or ERP numbering issues for this document type.");
                        
                        // Document archival failed - stays "Completed" but not "Archived"
                        return false;
                    }
                }
                
                _logger.LogError("Failed to archive document {DocumentId} to ERP - Error: {ErrorMessage}", 
                    documentId, erpResult.ErrorMessage);
                
                // Record the error in database
                await RecordErpErrorAsync(context, documentId, null, ErpErrorType.DocumentArchival, 
                    erpResult.ErrorMessage, erpResult.ErrorDetails);
                
                // Document archival failed - stays "Completed" but not "Archived"
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error archiving document {DocumentId} to ERP: {Error}", documentId, ex.Message);
                return false;
            }
        }

        public async Task<bool> CreateDocumentLinesInErpAsync(int documentId)
        {
            using var scope = _serviceProvider.CreateScope();
            using var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            
            return await CreateDocumentLinesInErpInternalAsync(documentId, context);
        }

        /// <summary>
        /// NEW METHOD: Process lines archival with rollback capability
        /// If ALL lines succeed, mark document as IsArchived = true
        /// If ANY line fails, rollback document archival (set ERPDocumentCode = null) and keep IsArchived = false
        /// </summary>
        private async Task<bool> ProcessLinesArchivalWithRollback(int documentId, ApplicationDbContext context, bool forceReprocessAllLines = false)
        {
            try
            {
                _logger.LogInformation("Processing lines archival with rollback for document {DocumentId}", documentId);

                // Get the document to check if it has an ERP code
                var document = await context.Documents
                    .FirstOrDefaultAsync(d => d.Id == documentId);

                if (document == null)
                {
                    _logger.LogError("Document {DocumentId} not found for lines archival", documentId);
                    return false;
                }

                // If document doesn't have ERP code, it means document archival failed
                if (string.IsNullOrEmpty(document.ERPDocumentCode))
                {
                    _logger.LogWarning("Document {DocumentId} does not have ERP code, cannot process lines", documentId);
                    return false;
                }

                // Process document lines
                var linesResult = await CreateDocumentLinesInErpInternalAsync(documentId, context, forceReprocessAllLines);

                if (linesResult)
                {
                    // ALL lines succeeded - mark document as fully archived
                    document.IsArchived = true;
                    document.UpdatedAt = DateTime.UtcNow;
                    
                    await context.SaveChangesAsync();
                    
                    _logger.LogInformation("Document {DocumentId} and all lines successfully archived - marked as IsArchived = true", 
                        documentId);
                    
                    return true;
                }
                else
                {
                    // ANY line failed - rollback document archival AND clear all line ERPLineCodes
                    _logger.LogWarning("One or more lines failed to archive for document {DocumentId} - rolling back document archival", 
                        documentId);
                    
                    // Clear the ERP document code and ensure not marked as archived
                    document.ERPDocumentCode = null;
                    document.IsArchived = false;
                    document.UpdatedAt = DateTime.UtcNow;
                    
                    // CRITICAL FIX: Clear ERPLineCode from ALL lines in this document
                    var allDocumentLines = await context.Lignes
                        .Where(l => l.DocumentId == documentId)
                        .ToListAsync();
                    
                    int clearedLinesCount = 0;
                    foreach (var ligne in allDocumentLines)
                    {
                        if (!string.IsNullOrEmpty(ligne.ERPLineCode))
                        {
                            ligne.ERPLineCode = null;
                            ligne.UpdatedAt = DateTime.UtcNow;
                            clearedLinesCount++;
                        }
                    }
                    
                    await context.SaveChangesAsync();
                    
                    // Record a rollback error
                    await RecordErpErrorAsync(context, documentId, null, ErpErrorType.BusinessRuleError, 
                        "Document archival rolled back due to line archival failures", 
                        $"One or more document lines failed to archive to ERP. Document archival has been rolled back and ERPDocumentCode cleared. Additionally, ERPLineCode cleared from {clearedLinesCount} lines. Document remains in Completed status and can be edited.");
                    
                    _logger.LogInformation("Document {DocumentId} archival rolled back - ERPDocumentCode cleared, IsArchived = false, ERPLineCode cleared from {ClearedLinesCount} lines", 
                        documentId, clearedLinesCount);
                    
                    return false;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing lines archival with rollback for document {DocumentId}: {Error}", 
                    documentId, ex.Message);
                return false;
            }
        }

        private async Task<bool> CreateDocumentLinesInErpInternalAsync(int documentId, ApplicationDbContext context, bool forceReprocessAllLines = false)
        {
            try
            {
                _logger.LogInformation("Starting ERP line creation for document ID: {DocumentId}, forceReprocessAllLines: {ForceReprocessAllLines}", 
                    documentId, forceReprocessAllLines);

                // Get document with all necessary relationships
                var document = await context.Documents
                    .Include(d => d.DocumentType)
                    .Include(d => d.Lignes)
                        .ThenInclude(l => l.LignesElementType)
                    .Include(d => d.Lignes)
                        .ThenInclude(l => l.Location)
                    .Include(d => d.Lignes)
                        .ThenInclude(l => l.Unit)
                    .FirstOrDefaultAsync(d => d.Id == documentId);

                if (document == null)
                {
                    _logger.LogError("Document {DocumentId} not found for ERP line creation", documentId);
                    return false;
                }

                if (string.IsNullOrEmpty(document.ERPDocumentCode))
                {
                    _logger.LogError("Document {DocumentId} is not archived to ERP (missing ERPDocumentCode)", documentId);
                    return false;
                }

                if (!document.Lignes.Any())
                {
                    _logger.LogInformation("Document {DocumentId} has no lines to create in ERP", documentId);
                    return true; // No lines to create is considered success
                }

                var successCount = 0;
                var errorCount = 0;

                // Process each line
                foreach (var ligne in document.Lignes)
                {
                    try
                    {
                        // Skip if line is already in ERP (unless forced re-processing)
                        if (!string.IsNullOrEmpty(ligne.ERPLineCode) && !forceReprocessAllLines)
                        {
                            _logger.LogInformation("Line {LigneId} already exists in ERP with code: {ErpLineCode}", 
                                ligne.Id, ligne.ERPLineCode);
                            successCount++;
                            continue;
                        }

                        // If forcing re-processing, clear existing ERPLineCode first
                        if (forceReprocessAllLines && !string.IsNullOrEmpty(ligne.ERPLineCode))
                        {
                            _logger.LogInformation("Forcing re-processing of line {LigneId} - clearing existing ERPLineCode: {ErpLineCode}", 
                                ligne.Id, ligne.ERPLineCode);
                            ligne.ERPLineCode = null;
                        }

                        // Load element data for the ligne
                        await ligne.LoadElementAsync(context);

                        // Build the line payload
                        var linePayload = await BuildErpLinePayload(document, ligne);
                        
                        // Make the API call to create the line
                        var erpLineResult = await CallBusinessCenterLineApi(linePayload);
                        
                        if (erpLineResult.IsSuccess)
                        {
                            // Update ligne with ERP line code
                            ligne.ERPLineCode = erpLineResult.Value;
                            ligne.UpdatedAt = DateTime.UtcNow;
                            successCount++;
                            
                            _logger.LogInformation("Line {LigneId} successfully created in ERP with code: {ErpLineCode}", 
                                ligne.Id, erpLineResult.Value);
                        }
                        else
                        {
                            errorCount++;
                            _logger.LogError("Failed to create line {LigneId} in ERP - Error: {ErrorMessage}", 
                                ligne.Id, erpLineResult.ErrorMessage);
                            
                            // Record the line error in database - use LigneKey first as it has the proper format (e.g., ITM_1000, ACC_100000)
                            var ligneCode = !string.IsNullOrEmpty(ligne.LigneKey) ? ligne.LigneKey : ligne.Title;
                            await RecordErpErrorAsync(context, documentId, ligne.Id, ErpErrorType.LineArchival, 
                                erpLineResult.ErrorMessage, erpLineResult.ErrorDetails, ligneCode);
                        }
                    }
                    catch (Exception ex)
                    {
                        errorCount++;
                        _logger.LogError(ex, "Error creating line {LigneId} in ERP: {Error}", ligne.Id, ex.Message);
                        
                        // Record the line error in database - use LigneKey first as it has the proper format (e.g., ITM_1000, ACC_100000)
                        var ligneCode = !string.IsNullOrEmpty(ligne.LigneKey) ? ligne.LigneKey : ligne.Title;
                        await RecordErpErrorAsync(context, documentId, ligne.Id, ErpErrorType.LineArchival, 
                            ex.Message, ex.ToString(), ligneCode);
                    }
                }

                // Save all changes
                await context.SaveChangesAsync();

                _logger.LogInformation("ERP line creation completed for document {DocumentId}: {SuccessCount} successful, {ErrorCount} errors", 
                    documentId, successCount, errorCount);

                return errorCount == 0; // Return true only if all lines were created successfully
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating lines for document {DocumentId} in ERP: {Error}", documentId, ex.Message);
                return false;
            }
        }

        public async Task<bool> IsDocumentArchived(int documentId)
        {
            using var scope = _serviceProvider.CreateScope();
            using var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            
            var document = await context.Documents
                .AsNoTracking()
                .FirstOrDefaultAsync(d => d.Id == documentId);
                
            return document?.IsArchived ?? false;
        }

        private async Task<object> BuildErpPayload(Document document)
        {
            // Determine tierType based on DocumentType.TierType
            int tierType = document.DocumentType?.TierType switch
            {
                TierType.None => 0,
                TierType.Customer => 1,
                TierType.Vendor => 2,
                _ => 0
            };

            // Get customer/vendor code from snapshot fields (more reliable than navigation properties)
            string custVendoNo = document.CustomerVendorCode ?? "";

            // Get responsibility centre code
            string responsabilityCentre = document.ResponsibilityCentre?.Code ?? "";

            // Format dates for API (ISO format)
            string documentDate = document.DocDate.ToString("yyyy-MM-dd");
            string postingDate = document.ComptableDate.ToString("yyyy-MM-dd");

            var payload = new
            {
                tierTYpe = tierType,
                type = document.DocumentType?.TypeNumber ?? 0,
                custVendoNo = custVendoNo,
                documentDate = documentDate,
                postingDate = postingDate,
                responsabilityCentre = responsabilityCentre,
                externalDocNo = document.DocumentExterne ?? ""
            };

            _logger.LogInformation("Built ERP payload for document {DocumentId}: TierType={TierType}, CustVendoNo={CustVendoNo}, Type={Type}", 
                document.Id, tierType, custVendoNo, document.DocumentType?.TypeNumber ?? 0);
            _logger.LogDebug("Full payload: {Payload}", JsonSerializer.Serialize(payload));

            return payload;
        }

        private async Task<object> BuildErpLinePayload(Document document, Ligne ligne)
        {
            // Determine tierType based on DocumentType.TierType
            int tierType = document.DocumentType?.TierType switch
            {
                TierType.None => 0,
                TierType.Customer => 1,
                TierType.Vendor => 2,
                _ => 0
            };

            // Determine line type: 1 = General Account, 2 = Item
            int type = ligne.LignesElementType?.TypeElement switch
            {
                ElementType.GeneralAccounts => 1,
                ElementType.Item => 2,
                _ => 1 // Default to General Account
            };

            // Get the code from the linked element (Item code or Account code)
            string codeLine = ligne.ElementId ?? "";

            // Get unit of measure code (only for Item types, fallback to item's default unit)
            string uniteOfMeasure = "";
            if (type == 2) // Item type
            {
                uniteOfMeasure = ligne.UnitCode ?? ligne.Item?.Unite ?? "";
            }

            // Get location code (note the API expects "locationCOde" with capital O)
            string locationCode = ligne.LocationCode ?? "";

            // Log detailed price information for debugging
            _logger.LogInformation("Price Details for ligne {LigneId}: PriceHT={PriceHT}, OriginalPriceHT={OriginalPriceHT}, DiscountAmount={DiscountAmount}, TierType={TierType}", 
                ligne.Id, ligne.PriceHT, ligne.OriginalPriceHT, ligne.DiscountAmount, tierType);

            var payload = new
            {
                tierTYpe = tierType,
                docType = document.DocumentType?.TypeNumber ?? 0,
                docNo = document.ERPDocumentCode ?? "",
                type = type,
                codeLine = codeLine,
                descriptionLine = ligne.Title ?? "",
                qty = ligne.Quantity,
                uniteOfMeasure = uniteOfMeasure,
                unitpriceCOst = ligne.PriceHT,
                discountAmt = ligne.DiscountAmount,
                locationCOde = locationCode
            };

            _logger.LogInformation("Built ERP line payload for ligne {LigneId}: Type={Type}, CodeLine={CodeLine}, Qty={Qty}, LocationCode={LocationCode}, Price={Price}", 
                ligne.Id, type, codeLine, ligne.Quantity, locationCode, ligne.PriceHT);
            
            // Enhanced payload logging with exact JSON that will be sent
            var jsonForLogging = JsonSerializer.Serialize(payload, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = true
            });
            _logger.LogDebug("Full line payload JSON that will be sent to BC: {Payload}", jsonForLogging);

            return payload;
        }

        private async Task<ErpOperationResult> CallBusinessCenterApi(object payload)
        {
            const string apiEndpoint = "http://localhost:25048/BC250/ODataV4/APICreateDocVerse_CreateDoc?company=CRONUS%20France%20S.A.";
            
            try
            {
                var json = JsonSerializer.Serialize(payload, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });

                var content = new StringContent(json, Encoding.UTF8, "application/json");

                _logger.LogInformation("Making POST request to BC API: {Endpoint}", apiEndpoint);
                _logger.LogDebug("Request payload: {Payload}", json);

                var response = await _httpClient.PostAsync(apiEndpoint, content);
                var responseContent = await response.Content.ReadAsStringAsync();
                
                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation("BC API call successful. Response: {Response}", responseContent);
                    
                    // Parse the response to extract the document code
                    if (!string.IsNullOrWhiteSpace(responseContent))
                    {
                        try
                        {
                            var responseObj = JsonSerializer.Deserialize<JsonElement>(responseContent);
                            if (responseObj.TryGetProperty("value", out var valueElement))
                            {
                                var documentCode = valueElement.GetString();
                                return ErpOperationResult.Success(documentCode ?? responseContent.Trim('"'));
                            }
                            return ErpOperationResult.Success(responseContent.Trim('"'));
                        }
                        catch (JsonException ex)
                        {
                            // Not JSON, treat as direct response
                            return ErpOperationResult.Success(responseContent.Trim().Trim('"'));
                        }
                    }
                    
                    return ErpOperationResult.Success(responseContent);
                }
                else
                {
                    // Extract meaningful error message from Business Central response
                    string userFriendlyError = ExtractBusinessCentralError(responseContent, (int)response.StatusCode);
                    
                    _logger.LogError("BC API call failed with status {StatusCode}. Response: {Response}", 
                        response.StatusCode, responseContent);
                    
                    return ErpOperationResult.Failure(
                        userFriendlyError,
                        responseContent,
                        (int)response.StatusCode,
                        GetErrorTypeFromStatusCode((int)response.StatusCode)
                    );
                }
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Network error calling BC API: {Error}", ex.Message);
                return ErpOperationResult.Failure(
                    "Unable to connect to Business Central ERP system. Please check network connectivity.",
                    ex.Message,
                    null,
                    "NetworkError"
                );
            }
            catch (TaskCanceledException ex)
            {
                _logger.LogError(ex, "Timeout calling BC API: {Error}", ex.Message);
                return ErpOperationResult.Failure(
                    "ERP operation timed out. The system may be busy, please try again later.",
                    ex.Message,
                    null,
                    "TimeoutError"
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error calling BC API: {Error}", ex.Message);
                return ErpOperationResult.Failure(
                    "An unexpected error occurred while communicating with the ERP system.",
                    ex.Message,
                    null,
                    "UnexpectedError"
                );
            }
        }

        private async Task<ErpOperationResult> CallBusinessCenterLineApi(object payload)
        {
            const string apiEndpoint = "http://localhost:25048/BC250/ODataV4/APICreateDocVerse_CreateDocLine?company=CRONUS%20France%20S.A.";
            
            try
            {
                var json = JsonSerializer.Serialize(payload, new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                });

                var content = new StringContent(json, Encoding.UTF8, "application/json");

                _logger.LogInformation("Making POST request to BC Line API: {Endpoint}", apiEndpoint);
                _logger.LogInformation("HTTP Headers: Content-Type={ContentType}, Content-Length={ContentLength}", 
                    content.Headers.ContentType, content.Headers.ContentLength);
                _logger.LogWarning("EXACT JSON PAYLOAD BEING SENT TO BC: {JsonPayload}", json);

                var response = await _httpClient.PostAsync(apiEndpoint, content);
                var responseContent = await response.Content.ReadAsStringAsync();
                
                if (response.IsSuccessStatusCode)
                {
                    _logger.LogInformation("BC Line API call successful. Response: {Response}", responseContent);
                    
                    // The CreateDocLine API returns an integer (Line No.) directly
                    if (!string.IsNullOrWhiteSpace(responseContent))
                    {
                        try
                        {
                            var responseObj = JsonSerializer.Deserialize<JsonElement>(responseContent);
                            if (responseObj.TryGetProperty("value", out var valueElement))
                            {
                                // If it's in a JSON wrapper, extract the value
                                if (valueElement.ValueKind == JsonValueKind.Number)
                                {
                                    return ErpOperationResult.Success(valueElement.GetInt32().ToString());
                                }
                                return ErpOperationResult.Success(valueElement.GetString() ?? responseContent.Trim('"'));
                            }
                        }
                        catch (JsonException)
                        {
                            // Not JSON, continue with direct parsing
                        }

                        // Handle direct integer response
                        var cleanResponse = responseContent.Trim().Trim('"');
                        if (int.TryParse(cleanResponse, out var lineNumber))
                        {
                            return ErpOperationResult.Success(lineNumber.ToString());
                        }
                        
                        // Fallback to string response
                        return ErpOperationResult.Success(cleanResponse);
                    }
                    
                    return ErpOperationResult.Success(responseContent);
                }
                else
                {
                    // Extract meaningful error message from Business Central response
                    string userFriendlyError = ExtractBusinessCentralLineError(responseContent, (int)response.StatusCode);
                    
                    _logger.LogError("BC Line API call failed with status {StatusCode}. Response: {Response}", 
                        response.StatusCode, responseContent);
                    
                    return ErpOperationResult.Failure(
                        userFriendlyError,
                        responseContent,
                        (int)response.StatusCode,
                        GetErrorTypeFromStatusCode((int)response.StatusCode)
                    );
                }
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Network error calling BC Line API: {Error}", ex.Message);
                return ErpOperationResult.Failure(
                    "Unable to connect to Business Central ERP system. Please check network connectivity.",
                    ex.Message,
                    null,
                    "NetworkError"
                );
            }
            catch (TaskCanceledException ex)
            {
                _logger.LogError(ex, "Timeout calling BC Line API: {Error}", ex.Message);
                return ErpOperationResult.Failure(
                    "ERP line creation timed out. The system may be busy, please try again later.",
                    ex.Message,
                    null,
                    "TimeoutError"
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error calling BC Line API: {Error}", ex.Message);
                return ErpOperationResult.Failure(
                    "An unexpected error occurred while creating the line in the ERP system.",
                    ex.Message,
                    null,
                    "UnexpectedError"
                );
            }
        }

        // Error tracking and management methods
        private async Task RecordErpErrorAsync(ApplicationDbContext context, int documentId, int? ligneId, 
            ErpErrorType errorType, string errorMessage, string? errorDetails = null, string? ligneCode = null)
        {
            try
            {
                var error = new ErpArchivalError
                {
                    DocumentId = documentId,
                    LigneId = ligneId,
                    ErrorType = errorType,
                    ErrorMessage = errorMessage.Length > 500 ? errorMessage.Substring(0, 500) : errorMessage,
                    ErrorDetails = errorDetails?.Length > 2000 ? errorDetails.Substring(0, 2000) : errorDetails,
                    LigneCode = ligneCode?.Length > 100 ? ligneCode.Substring(0, 100) : ligneCode,
                    OccurredAt = DateTime.UtcNow,
                    IsResolved = false
                };

                context.ErpArchivalErrors.Add(error);
                await context.SaveChangesAsync();
                
                _logger.LogInformation("Recorded ERP error for document {DocumentId}, ligne {LigneId}, type {ErrorType}", 
                    documentId, ligneId, errorType);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to record ERP error for document {DocumentId}: {Error}", documentId, ex.Message);
            }
        }

        public async Task<DocumentErpStatusDto> GetDocumentErpStatusAsync(int documentId)
        {
            using var scope = _serviceProvider.CreateScope();
            using var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var document = await context.Documents
                .Include(d => d.Lignes)
                .AsNoTracking()
                .FirstOrDefaultAsync(d => d.Id == documentId);

            if (document == null)
            {
                throw new KeyNotFoundException($"Document {documentId} not found");
            }

            var errors = await context.ErpArchivalErrors
                .Include(e => e.ResolvedBy)
                .Where(e => e.DocumentId == documentId)
                .OrderByDescending(e => e.OccurredAt)
                .AsNoTracking()
                .ToListAsync();

            var ligneStatuses = new List<LigneErpStatusDto>();
            foreach (var ligne in document.Lignes)
            {
                var ligneErrors = errors.Where(e => e.LigneId == ligne.Id).ToList();
                // Use LigneKey first as it has the proper format (e.g., ITM_1000, ACC_100000)
                var ligneCode = !string.IsNullOrEmpty(ligne.LigneKey) ? ligne.LigneKey : ligne.Title;
                ligneStatuses.Add(new LigneErpStatusDto
                {
                    LigneId = ligne.Id,
                    LigneCode = ligneCode,
                    Title = ligne.Title,
                    IsArchived = !string.IsNullOrEmpty(ligne.ERPLineCode),
                    ErpLineCode = ligne.ERPLineCode,
                    HasErrors = ligneErrors.Any(e => !e.IsResolved),
                    Errors = ligneErrors.Select(MapToDto).ToList()
                });
            }

            var lastArchivalAttempt = errors.Any() ? errors.Max(e => e.OccurredAt) : (DateTime?)null;
            var unresolvedErrors = errors.Where(e => !e.IsResolved).ToList();

            return new DocumentErpStatusDto
            {
                DocumentId = documentId,
                DocumentKey = document.DocumentKey,
                IsArchived = document.IsArchived,
                ErpDocumentCode = document.ERPDocumentCode,
                HasErrors = errors.Any(),
                HasUnresolvedErrors = unresolvedErrors.Any(),
                Errors = errors.Select(MapToDto).ToList(),
                LigneStatuses = ligneStatuses,
                LastArchivalAttempt = lastArchivalAttempt,
                ArchivalStatusSummary = GenerateArchivalStatusSummary(document, ligneStatuses, unresolvedErrors)
            };
        }

        public async Task<List<ErpArchivalErrorDto>> GetDocumentErpErrorsAsync(int documentId)
        {
            using var scope = _serviceProvider.CreateScope();
            using var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var errors = await context.ErpArchivalErrors
                .Include(e => e.ResolvedBy)
                .Where(e => e.DocumentId == documentId)
                .OrderByDescending(e => e.OccurredAt)
                .AsNoTracking()
                .ToListAsync();

            return errors.Select(MapToDto).ToList();
        }

        public async Task<bool> ResolveErpErrorAsync(int errorId, int userId, string resolutionNotes)
        {
            using var scope = _serviceProvider.CreateScope();
            using var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var error = await context.ErpArchivalErrors.FindAsync(errorId);
            if (error == null)
            {
                return false;
            }

            error.IsResolved = true;
            error.ResolvedAt = DateTime.UtcNow;
            error.ResolvedByUserId = userId;
            error.ResolutionNotes = resolutionNotes;

            await context.SaveChangesAsync();
            
            _logger.LogInformation("ERP error {ErrorId} resolved by user {UserId}", errorId, userId);
            return true;
        }

        public async Task<bool> RetryDocumentArchivalAsync(int documentId, int userId, string? reason = null)
        {
            _logger.LogInformation("Retrying document archival for document {DocumentId} by user {UserId}. Reason: {Reason}", 
                documentId, userId, reason ?? "Manual retry");

            // The retry uses the new archival logic which includes rollback capability
            // Force re-processing of all lines during retry
            return await ArchiveDocumentToErpAsync(documentId, isRetry: true);
        }

        public async Task<bool> RetryLineArchivalAsync(int documentId, List<int> ligneIds, int userId, string? reason = null)
        {
            _logger.LogInformation("Retrying line archival for document {DocumentId}, lines {LigneIds} by user {UserId}. Reason: {Reason}", 
                documentId, string.Join(",", ligneIds), userId, reason ?? "Manual retry");

            // Use the new archival logic which includes rollback capability
            // This will retry the entire document archival process including lines
            // Force re-processing of all lines during retry
            return await ArchiveDocumentToErpAsync(documentId, isRetry: true);
        }

        private ErpArchivalErrorDto MapToDto(ErpArchivalError error)
        {
            return new ErpArchivalErrorDto
            {
                Id = error.Id,
                DocumentId = error.DocumentId,
                LigneId = error.LigneId,
                ErrorType = error.ErrorType.ToString(),
                ErrorMessage = error.ErrorMessage,
                ErrorDetails = error.ErrorDetails,
                LigneCode = error.LigneCode,
                OccurredAt = error.OccurredAt,
                ResolvedAt = error.ResolvedAt,
                IsResolved = error.IsResolved,
                ResolutionNotes = error.ResolutionNotes,
                ResolvedByUsername = error.ResolvedBy?.Username
            };
        }

        private string GenerateArchivalStatusSummary(Document document, List<LigneErpStatusDto> ligneStatuses, List<ErpArchivalError> unresolvedErrors)
        {
            if (document.IsArchived)
            {
                var archivedLines = ligneStatuses.Count(l => l.IsArchived);
                var totalLines = ligneStatuses.Count;
                
                if (totalLines == 0)
                {
                    return "Document fully archived (no lines)";
                }
                else if (archivedLines == totalLines)
                {
                    return "Document and all lines fully archived";
                }
                else
                {
                    // This shouldn't happen with new logic, but keep for safety
                    return "Document marked as archived (inconsistent state)";
                }
            }
            else if (!string.IsNullOrEmpty(document.ERPDocumentCode))
            {
                var archivedLines = ligneStatuses.Count(l => l.IsArchived);
                var totalLines = ligneStatuses.Count;
                    var failedLines = totalLines - archivedLines;
                
                if (totalLines == 0)
                {
                    return "Document archived to ERP but not marked as fully archived";
                }
                else if (failedLines > 0)
                {
                    return $"Document archived to ERP, but {failedLines} of {totalLines} lines failed - archival rolled back";
                }
                else
                {
                    return "Document and lines archived to ERP, pending final archival status";
                }
            }
            else if (unresolvedErrors.Any(e => e.ErrorType == ErpErrorType.DocumentArchival))
            {
                return "Document archival failed - remains in Completed status";
            }
            else
            {
                return "Document not yet archived - remains in Completed status";
            }
        }

        public void Dispose()
        {
            _httpClient?.Dispose();
        }

        // Helper method to extract user-friendly error messages from Business Central responses
        private string ExtractBusinessCentralError(string responseContent, int statusCode)
        {
            if (string.IsNullOrWhiteSpace(responseContent))
            {
                return GetGenericErrorMessage(statusCode, "document creation");
            }

            try
            {
                // Try to parse Business Central OData error format
                var responseObj = JsonSerializer.Deserialize<JsonElement>(responseContent);
                
                if (responseObj.TryGetProperty("error", out var errorObj))
                {
                    if (errorObj.TryGetProperty("message", out var messageObj))
                    {
                        var message = messageObj.GetString();
                        return TranslateBusinessCentralMessage(message ?? responseContent, "document creation");
                    }
                }
                
                // Check for direct error message
                if (responseObj.TryGetProperty("message", out var directMessage))
                {
                    var message = directMessage.GetString();
                    return TranslateBusinessCentralMessage(message ?? responseContent, "document creation");
                }
            }
            catch (JsonException)
            {
                // Not JSON, check for common error patterns in plain text
                return TranslateBusinessCentralMessage(responseContent, "document creation");
            }

            return GetGenericErrorMessage(statusCode, "document creation");
        }

        // Helper method for line-specific error extraction
        private string ExtractBusinessCentralLineError(string responseContent, int statusCode)
        {
            if (string.IsNullOrWhiteSpace(responseContent))
            {
                return GetGenericErrorMessage(statusCode, "line creation");
            }

            try
            {
                var responseObj = JsonSerializer.Deserialize<JsonElement>(responseContent);
                
                if (responseObj.TryGetProperty("error", out var errorObj))
                {
                    if (errorObj.TryGetProperty("message", out var messageObj))
                    {
                        var message = messageObj.GetString();
                        return TranslateBusinessCentralMessage(message ?? responseContent, "line creation");
                    }
                }
                
                if (responseObj.TryGetProperty("message", out var directMessage))
                {
                    var message = directMessage.GetString();
                    return TranslateBusinessCentralMessage(message ?? responseContent, "line creation");
                }
            }
            catch (JsonException)
            {
                return TranslateBusinessCentralMessage(responseContent, "line creation");
            }

            return GetGenericErrorMessage(statusCode, "line creation");
        }

        // Helper method to translate Business Central error messages to user-friendly messages
        private string TranslateBusinessCentralMessage(string bcMessage, string operation)
        {
            var lowerMessage = bcMessage.ToLower();

            // Common Business Central error patterns
            if (lowerMessage.Contains("item") && lowerMessage.Contains("not found"))
                return "The specified item does not exist in Business Central. Please verify the item code.";
            
            if (lowerMessage.Contains("account") && lowerMessage.Contains("not found"))
                return "The specified general ledger account does not exist in Business Central. Please verify the account code.";
            
            if (lowerMessage.Contains("customer") && lowerMessage.Contains("not found"))
                return "The specified customer does not exist in Business Central. Please verify the customer code.";
            
            if (lowerMessage.Contains("vendor") && lowerMessage.Contains("not found"))
                return "The specified vendor does not exist in Business Central. Please verify the vendor code.";
            
            if (lowerMessage.Contains("location") && lowerMessage.Contains("not found"))
                return "The specified location does not exist in Business Central. Please verify the location code.";
            
            if (lowerMessage.Contains("unit of measure") || lowerMessage.Contains("uom"))
                return "Invalid unit of measure. Please verify the unit code exists for this item in Business Central.";
            
            if (lowerMessage.Contains("responsibility center") || lowerMessage.Contains("responsibility centre"))
                return "The specified responsibility center does not exist in Business Central. Please verify the center code.";
            
            if (lowerMessage.Contains("dimension") || lowerMessage.Contains("shortcut dimension"))
                return "Invalid dimension value. Please verify the dimension settings in Business Central.";
            
            if (lowerMessage.Contains("posting date"))
                return "Invalid posting date. Please check the date falls within an open accounting period.";
            
            if (lowerMessage.Contains("document date"))
                return "Invalid document date. Please verify the date format and value.";
            
            if (lowerMessage.Contains("quantity") && lowerMessage.Contains("negative"))
                return "Negative quantities are not allowed for this operation.";
            
            if (lowerMessage.Contains("price") && (lowerMessage.Contains("negative") || lowerMessage.Contains("invalid")))
                return "Invalid price value. Please enter a valid positive price.";
            
            if (lowerMessage.Contains("currency"))
                return "Currency code issue. Please verify the currency is valid in Business Central.";
            
            if (lowerMessage.Contains("blocked"))
                return "The record is blocked in Business Central and cannot be used for new transactions.";
            
            if (lowerMessage.Contains("permission") || lowerMessage.Contains("access"))
                return "Insufficient permissions to perform this operation in Business Central. Contact your administrator.";
            
            if (lowerMessage.Contains("connection") || lowerMessage.Contains("timeout"))
                return "Connection issue with Business Central. Please try again later.";

            // If no specific pattern matches, return the original message with context
            return $"Business Central {operation} error: {bcMessage}";
        }

        // Helper method to get generic error messages based on status code
        private string GetGenericErrorMessage(int statusCode, string operation)
        {
            return statusCode switch
            {
                400 => $"Invalid data provided for {operation}. Please check all required fields.",
                401 => "Authentication failed with Business Central. Please check API credentials.",
                403 => "Access denied to Business Central. Contact your administrator for permissions.",
                404 => "Business Central API endpoint not found. Please verify system configuration.",
                500 => "Business Central server error occurred. Please try again later or contact support.",
                502 => "Business Central service is temporarily unavailable. Please try again later.",
                503 => "Business Central service is temporarily unavailable. Please try again later.",
                _ => $"An error occurred during {operation} (HTTP {statusCode}). Please try again or contact support."
            };
        }

        // Helper method to categorize error types
        private string GetErrorTypeFromStatusCode(int statusCode)
        {
            return statusCode switch
            {
                400 => "ValidationError",
                401 => "AuthenticationError",
                403 => "AuthorizationError",
                404 => "NotFoundError",
                408 => "TimeoutError",
                429 => "RateLimitError",
                500 => "ServerError",
                502 => "ServiceUnavailableError",
                503 => "ServiceUnavailableError",
                504 => "TimeoutError",
                _ => "UnknownError"
            };
        }
    }
} 