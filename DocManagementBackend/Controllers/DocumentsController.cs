using Microsoft.AspNetCore.Mvc;
using DocManagementBackend.Models;
using DocManagementBackend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using DocManagementBackend.Mappings;
using DocManagementBackend.Services;
using DocManagementBackend.ModelsDtos;
using DocManagementBackend.Utils;
using System.Text;

namespace DocManagementBackend.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class DocumentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly DocumentWorkflowService _workflowService;
        private readonly UserAuthorizationService _authService;
        private readonly IDocumentErpArchivalService _erpArchivalService;
        private readonly ILogger<DocumentsController> _logger;
        
        public DocumentsController(ApplicationDbContext context, DocumentWorkflowService workflowService, UserAuthorizationService authService, IDocumentErpArchivalService erpArchivalService, ILogger<DocumentsController> logger) 
        { 
            _context = context;
            _workflowService = workflowService;
            _authService = authService;
            _erpArchivalService = erpArchivalService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<DocumentDto>>> GetDocuments()
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser", "SimpleUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var userId = authResult.UserId;
            var user = authResult.User!;
            
            // Query builder for active documents (exclude completed circuits and archived documents)
            IQueryable<Document> documentsQuery = _context.Documents
                .Include(d => d.CreatedBy).ThenInclude(u => u.Role)
                .Include(d => d.UpdatedBy).ThenInclude(u => u.Role)
                .Include(d => d.DocumentType)
                .Include(d => d.SubType)
                .Include(d => d.CurrentStep)
                .Include(d => d.ResponsibilityCentre)
                .Include(d => d.Circuit)
                .Include(d => d.Lignes)
                .Where(d => !d.IsCircuitCompleted); // Only active documents (not completed circuits)

            // Filter based on user's responsibility center
            if (user.ResponsibilityCentreId.HasValue)
            {
                // User has a responsibility center - show only documents from that center
                documentsQuery = documentsQuery.Where(d => d.ResponsibilityCentreId == user.ResponsibilityCentreId.Value);
            }
            // If user doesn't have a responsibility center, show all documents (no filter applied)

            var documents = await documentsQuery
                .Select(DocumentMappings.ToDocumentDto)
                .ToListAsync();

            return Ok(documents);
        }

        [HttpGet("my-documents")]
        public async Task<ActionResult<IEnumerable<DocumentDto>>> GetMyDocuments()
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser", "SimpleUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var userId = authResult.UserId;
            var user = authResult.User!;

            // Query builder for active documents (exclude completed circuits and archived documents)
            IQueryable<Document> documentsQuery = _context.Documents
                .Include(d => d.CreatedBy).ThenInclude(u => u.Role)
                .Include(d => d.UpdatedBy).ThenInclude(u => u.Role)
                .Include(d => d.DocumentType)
                .Include(d => d.SubType)
                .Include(d => d.CurrentStep)
                .Include(d => d.ResponsibilityCentre)
                .Include(d => d.Circuit)
                .Include(d => d.Lignes)
                .Where(d => !d.IsCircuitCompleted); // Only active documents (not completed circuits)

            // Filter based on user's responsibility center
            if (user.ResponsibilityCentreId.HasValue)
            {
                // User has a responsibility center - show only documents from that center
                documentsQuery = documentsQuery.Where(d => d.ResponsibilityCentreId == user.ResponsibilityCentreId.Value);
            }
            // If user doesn't have a responsibility center, show all documents (no filter applied)

            var documents = await documentsQuery
                .Select(DocumentMappings.ToDocumentDto)
                .ToListAsync();

            return Ok(documents);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<DocumentDto>> GetDocument(int id)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser", "SimpleUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var userId = authResult.UserId;
            var user = authResult.User!;
            var documentDto = await _context.Documents
                .Include(d => d.CreatedBy).ThenInclude(u => u.Role)
                .Include(d => d.UpdatedBy).ThenInclude(u => u.Role)
                .Include(d => d.DocumentType)
                .Include(d => d.SubType)
                .Include(d => d.CurrentStep)
                .Include(d => d.ResponsibilityCentre)
                .Include(d => d.Circuit)
                .Include(d => d.Lignes)
                .Where(d => d.Id == id)
                .Select(DocumentMappings.ToDocumentDto)
                .FirstOrDefaultAsync();
            if (documentDto == null) { return NotFound("Document not found!"); }

            return Ok(documentDto);
        }

        [HttpGet("recent")]
        public async Task<ActionResult<IEnumerable<DocumentDto>>> GetRecentDocuments([FromQuery] int limit = 5)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser", "SimpleUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var userId = authResult.UserId;
            var thisUser = authResult.User!;

            // Ensure the limit is reasonable
            if (limit <= 0)
                limit = 5;
            if (limit > 50)
                limit = 50; // Set a maximum limit to prevent excessive queries

            // Query builder for documents
            IQueryable<Document> documentsQuery = _context.Documents
                .Include(d => d.CreatedBy).ThenInclude(u => u.Role)
                .Include(d => d.UpdatedBy).ThenInclude(u => u.Role)
                .Include(d => d.DocumentType)
                .Include(d => d.SubType)
                .Include(d => d.CurrentStep)
                .Include(d => d.ResponsibilityCentre)
                .Include(d => d.Circuit)
                .Include(d => d.Lignes);

            // Filter based on user's responsibility center
            if (thisUser.ResponsibilityCentreId.HasValue)
            {
                // User has a responsibility center - show only documents from that center
                documentsQuery = documentsQuery.Where(d => d.ResponsibilityCentreId == thisUser.ResponsibilityCentreId.Value);
            }
            // If user doesn't have a responsibility center, show all documents (no filter applied)

            var recentDocuments = await documentsQuery
                .OrderByDescending(d => d.CreatedAt) // Sort by creation date, newest first
                .Take(limit) // Take only the specified number of documents
                .Select(DocumentMappings.ToDocumentDto)
                .ToListAsync();

            return Ok(recentDocuments);
        }

        [HttpGet("archived")]
        public async Task<ActionResult<IEnumerable<DocumentDto>>> GetArchivedDocuments()
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser", "SimpleUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var userId = authResult.UserId;
            var user = authResult.User!;

            // Query builder for archived documents (documents with ERPDocumentCode)
            IQueryable<Document> documentsQuery = _context.Documents
                .Include(d => d.CreatedBy).ThenInclude(u => u.Role)
                .Include(d => d.UpdatedBy).ThenInclude(u => u.Role)
                .Include(d => d.DocumentType)
                .Include(d => d.SubType)
                .Include(d => d.CurrentStep)
                .Include(d => d.ResponsibilityCentre)
                .Include(d => d.Circuit)
                .Include(d => d.Lignes)
                .Where(d => !string.IsNullOrEmpty(d.ERPDocumentCode)); // Only archived documents

            // Filter based on user's responsibility center
            if (user.ResponsibilityCentreId.HasValue)
            {
                // User has a responsibility center - show only documents from that center
                documentsQuery = documentsQuery.Where(d => d.ResponsibilityCentreId == user.ResponsibilityCentreId.Value);
            }
            // If user doesn't have a responsibility center, show all documents (no filter applied)

            var archivedDocuments = await documentsQuery
                .OrderByDescending(d => d.UpdatedAt) // Sort by last update (when archived)
                .Select(DocumentMappings.ToDocumentDto)
                .ToListAsync();

            return Ok(archivedDocuments);
        }

        [HttpGet("completed-not-archived")]
        public async Task<ActionResult<IEnumerable<DocumentDto>>> GetCompletedNotArchivedDocuments()
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser", "SimpleUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var userId = authResult.UserId;
            var user = authResult.User!;

            // Query builder for completed but not archived documents (IsCircuitCompleted = true but ERPDocumentCode is null/empty)
            IQueryable<Document> documentsQuery = _context.Documents
                .Include(d => d.CreatedBy).ThenInclude(u => u.Role)
                .Include(d => d.UpdatedBy).ThenInclude(u => u.Role)
                .Include(d => d.DocumentType)
                .Include(d => d.SubType)
                .Include(d => d.CurrentStep)
                .Include(d => d.CurrentStatus)
                .Include(d => d.ResponsibilityCentre)
                .Include(d => d.Circuit)
                .Include(d => d.Lignes)
                .Where(d => d.IsCircuitCompleted && string.IsNullOrEmpty(d.ERPDocumentCode)); // Completed circuit but not archived

            // Filter based on user's responsibility center
            if (user.ResponsibilityCentreId.HasValue)
            {
                // User has a responsibility center - show only documents from that center
                documentsQuery = documentsQuery.Where(d => d.ResponsibilityCentreId == user.ResponsibilityCentreId.Value);
            }
            // If user doesn't have a responsibility center, show all documents (no filter applied)

            var completedNotArchivedDocuments = await documentsQuery
                .OrderByDescending(d => d.UpdatedAt) // Sort by last update (when circuit was completed)
                .Select(DocumentMappings.ToDocumentDto)
                .ToListAsync();

            return Ok(completedNotArchivedDocuments);
        }

        [HttpPost]
        public async Task<ActionResult<DocumentDto>> CreateDocument([FromBody] CreateDocumentRequest request)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var userId = authResult.UserId;
            var user = authResult.User!;

            // Handle Responsibility Centre logic
            int? responsibilityCentreId = null;
            if (user.ResponsibilityCentreId.HasValue)
            {
                // User has a responsibility centre, use it automatically
                responsibilityCentreId = user.ResponsibilityCentreId.Value;
            }
            else if (request.ResponsibilityCentreId.HasValue)
            {
                // User has no responsibility centre, but one was provided explicitly
                // Validate the provided responsibility centre
                var responsibilityCentre = await _context.ResponsibilityCentres
                    .FirstOrDefaultAsync(rc => rc.Id == request.ResponsibilityCentreId.Value);
                if (responsibilityCentre == null)
                    return BadRequest("Invalid Responsibility Centre.");
                
                responsibilityCentreId = request.ResponsibilityCentreId.Value;
            }
            else
            {
                // Neither user nor request has a responsibility centre - this is allowed for now
                // but should be handled in business logic
                responsibilityCentreId = null;
            }

            var docType = await _context.DocumentTypes.FirstOrDefaultAsync(t => t.Id == request.TypeId);
            if (docType == null)
                return BadRequest("Invalid Document type!");

            // Validate circuit if specified
            if (request.CircuitId.HasValue && request.CircuitId.Value > 0)
            {
                var circuit = await _context.Circuits.FirstOrDefaultAsync(c => c.Id == request.CircuitId.Value);
                if (circuit == null)
                    return BadRequest($"The specified circuit (ID: {request.CircuitId}) does not exist.");
                
                // if (!circuit.IsActive)
                //     return BadRequest($"The specified circuit (ID: {request.CircuitId}) is not active.");
            }

            SubType? subType = null;
            if (request.SubTypeId.HasValue)
            {
                subType = await _context.SubTypes.FirstOrDefaultAsync(s => s.Id == request.SubTypeId.Value);
                if (subType == null)
                    return BadRequest("Invalid SubType!");

                if (subType.DocumentTypeId != request.TypeId)
                    return BadRequest("Selected SubType does not belong to the selected Document Type!");

                var documentDate = (request.DocDate ?? DateTime.UtcNow).Date;
                var subTypeStartDate = subType.StartDate.Date;
                var subTypeEndDate = subType.EndDate.Date;
                
                Console.WriteLine($"[DEBUG] Document creation validation: docDate={documentDate:yyyy-MM-dd}, subTypeStart={subTypeStartDate:yyyy-MM-dd}, subTypeEnd={subTypeEndDate:yyyy-MM-dd}");
                
                if (documentDate < subTypeStartDate || documentDate > subTypeEndDate)
                    return BadRequest($"Document date ({documentDate:d}) must be within the selected SubType date range ({subTypeStartDate:d} to {subTypeEndDate:d})");
            }

            var docDate = request.DocDate ?? DateTime.UtcNow;
            var docAlias = "";

            if (!string.IsNullOrEmpty(request.DocumentAlias))
                docAlias = request.DocumentAlias.ToUpper();

            docType.DocumentCounter++;
            subType.DocumentCounter++;
            int counterValue = subType.DocumentCounter;
            string paddedCounter = counterValue.ToString("D4");

            string documentKey;
            if (subType != null)
                documentKey = $"{subType.SubTypeKey}-{docAlias}{paddedCounter}";
            else
                documentKey = $"{docType.TypeKey}-{docAlias}{paddedCounter}";

            var document = new Document
            {
                Title = request.Title,
                DocumentAlias = docAlias,
                Content = request.Content,
                CreatedByUserId = userId,
                CreatedBy = user,
                DocDate = docDate,
                TypeId = request.TypeId,
                DocumentType = docType,
                SubTypeId = request.SubTypeId,
                SubType = subType,
                ResponsibilityCentreId = responsibilityCentreId,
                // Don't set CircuitId here, will be set by workflow service if needed
                CircuitId = null,
                ComptableDate = request.ComptableDate ?? DateTime.UtcNow,
                DocumentExterne = request.DocumentExterne ?? string.Empty,
                Status = 0, // Initially set to 0 (Open/Draft)
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                DocumentKey = documentKey,
                IsCircuitCompleted = false, // Explicitly set to false for new documents
                
                // Customer/Vendor snapshot data
                CustomerVendorCode = request.CustomerVendorCode,
                CustomerVendorName = request.CustomerVendorName,
                CustomerVendorAddress = request.CustomerVendorAddress,
                CustomerVendorCity = request.CustomerVendorCity,
                CustomerVendorCountry = request.CustomerVendorCountry
            };

            _context.Documents.Add(document);
            
            try
            {
                await _context.SaveChangesAsync();

                // Assign to circuit if specified, using the workflow service
                if (request.CircuitId.HasValue && request.CircuitId.Value > 0)
                {
                    try
                    {
                        await _workflowService.AssignDocumentToCircuitAsync(document.Id, request.CircuitId.Value, userId);
                    }
                    catch (Exception circuitEx)
                    {
                        return BadRequest($"Error assigning document to circuit: {circuitEx.Message}");
                    }
                }
                
                // Now fetch the complete document with all related entities
                var createdDocument = await _context.Documents
                    .Include(d => d.CreatedBy).ThenInclude(u => u.Role)
                    .Include(d => d.DocumentType)
                    .Include(d => d.SubType)
                    .Include(d => d.CurrentStep)
                    .Include(d => d.CurrentStatus)
                    .Include(d => d.ResponsibilityCentre)
                    .Where(d => d.Id == document.Id)
                    .Select(DocumentMappings.ToDocumentDto)
                    .FirstOrDefaultAsync();

                var logEntry = new LogHistory
                {
                    UserId = userId,
                    User = user,
                    Timestamp = DateTime.UtcNow,
                    ActionType = 4,
                    Description = $"{user.Username} has created the document {document.DocumentKey}"
                };
                _context.LogHistories.Add(logEntry);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetDocument), new { id = document.Id }, createdDocument);
            }
            catch (DbUpdateException ex)
            {
                // Roll back counter increment
                docType.DocumentCounter--;
                docType.DocCounter--;
                
                // Check for foreign key constraint violations
                if (ex.InnerException != null && ex.InnerException.Message.Contains("FK_Documents_Circuits_CircuitId"))
                {
                    return BadRequest("The specified circuit does not exist. Please select a valid circuit or leave it empty.");
                }
                
                return StatusCode(500, $"An error occurred while creating the document: {ex.Message}");
            }
            catch (Exception ex)
            {
                // Roll back counter increment
                docType.DocumentCounter--;
                docType.DocCounter--;
                
                return StatusCode(500, $"An unexpected error occurred: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDocument(int id, [FromBody] UpdateDocumentRequest request)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var userId = authResult.UserId;
            var user = authResult.User!;
            var document = await _context.Documents.FindAsync(id);
            if (document == null)
                return NotFound("Document not found.");

            // Check if document is archived to ERP
            if (!string.IsNullOrEmpty(document.ERPDocumentCode))
                return BadRequest("This document has been archived to the ERP system and cannot be modified.");

            // Update basic document fields
            document.Content = request.Content ?? document.Content;
            document.Title = request.Title ?? document.Title;
            document.DocDate = request.DocDate ?? document.DocDate;
            
            // Debug logging for ComptableDate
            if (request.ComptableDate.HasValue)
            {
                Console.WriteLine($"Updating ComptableDate from {document.ComptableDate} to {request.ComptableDate}");
                document.ComptableDate = request.ComptableDate.Value;
            }
            
            // Update DocumentExterne if provided
            if (request.DocumentExterne != null)
            {
                document.DocumentExterne = request.DocumentExterne;
            }
            
            // Update Customer/Vendor fields if provided
            if (request.CustomerVendorCode != null)
                document.CustomerVendorCode = request.CustomerVendorCode;
            if (request.CustomerVendorName != null)
                document.CustomerVendorName = request.CustomerVendorName;
            if (request.CustomerVendorAddress != null)
                document.CustomerVendorAddress = request.CustomerVendorAddress;
            if (request.CustomerVendorCity != null)
                document.CustomerVendorCity = request.CustomerVendorCity;
            if (request.CustomerVendorCountry != null)
                document.CustomerVendorCountry = request.CustomerVendorCountry;

            // Handle SubType changes
            if (request.SubTypeId.HasValue && request.SubTypeId != document.SubTypeId)
            {
                var subType = await _context.SubTypes.FindAsync(request.SubTypeId.Value);
                if (subType == null)
                    return BadRequest("Invalid SubType!");

                // If type is also changing, verify SubType belongs to that type
                if (request.TypeId.HasValue && request.TypeId != document.TypeId)
                {
                    if (subType.DocumentTypeId != request.TypeId.Value)
                        return BadRequest("Selected SubType does not belong to the selected Document Type!");
                }
                else
                {
                    // Otherwise check against current document type
                    if (subType.DocumentTypeId != document.TypeId)
                        return BadRequest("Selected SubType does not belong to the document's current type!");
                }

                // Verify DocDate falls within SubType date range
                var docDate = document.DocDate.Date;
                var subTypeStartDate = subType.StartDate.Date;
                var subTypeEndDate = subType.EndDate.Date;
                
                Console.WriteLine($"[DEBUG] Document update validation: docDate={docDate:yyyy-MM-dd}, subTypeStart={subTypeStartDate:yyyy-MM-dd}, subTypeEnd={subTypeEndDate:yyyy-MM-dd}");
                
                if (docDate < subTypeStartDate || docDate > subTypeEndDate)
                    return BadRequest($"Document date ({docDate:d}) must be within the selected SubType date range ({subTypeStartDate:d} to {subTypeEndDate:d})");

                document.SubTypeId = request.SubTypeId;
                document.SubType = subType;

                // Need to update document key
                var docType = await _context.DocumentTypes.FindAsync(document.TypeId);

                // Extract counter from the existing key (assuming format ends with -XXXX)
                string counterStr = document.DocumentKey.Split('-').Last();
                string documentKey = $"{subType.SubTypeKey}-{counterStr}";
                document.DocumentKey = documentKey;
            }
            // Handle removing a subtype
            else if (request.SubTypeId.HasValue && request.SubTypeId.Value == 0 && document.SubTypeId.HasValue)
            {
                document.SubTypeId = null;
                document.SubType = null;

                // Regenerate document key using the document type
                var docType = await _context.DocumentTypes.FindAsync(document.TypeId);
                string counterStr = document.DocumentKey.Split('-').Last();
                string documentKey = $"{docType!.TypeKey}{document.DocumentAlias}-{counterStr}";
                document.DocumentKey = documentKey;
            }

            // Handle type changes as in original method
            if (request.TypeId.HasValue)
            {
                if (request.TypeId != document.TypeId)
                {
                    var docType = await _context.DocumentTypes.FirstOrDefaultAsync(t => t.Id == request.TypeId);
                    if (docType == null)
                        return BadRequest("Invalid type!");
                    var type = await _context.DocumentTypes.FirstOrDefaultAsync(t => t.Id == document.TypeId);
                    if (type == null)
                        return BadRequest("Missing DocumentType");
                    type.DocumentCounter--;

                    // If changing document type, clear the subtype if it doesn't match
                    if (document.SubTypeId.HasValue)
                    {
                        var subType = await _context.SubTypes.FindAsync(document.SubTypeId.Value);
                        if (subType!.DocumentTypeId != request.TypeId)
                        {
                            document.SubTypeId = null;
                            document.SubType = null;
                        }
                    }

                    document.TypeId = request.TypeId ?? document.TypeId;
                    document.DocumentType = docType;
                    docType.DocumentCounter++;
                    int counterValue = docType.DocumentCounter;
                    string paddedCounter = counterValue.ToString("D4");

                    if (document.SubTypeId.HasValue && document.SubType != null)
                        document.DocumentKey = $"{document.SubType.SubTypeKey}-{paddedCounter}";
                    else
                        document.DocumentKey = $"{docType.TypeKey}{document.DocumentAlias.ToUpper()}-{paddedCounter}";
                }
            }

            if (!string.IsNullOrEmpty(request.DocumentAlias))
            {
                document.DocumentAlias = request.DocumentAlias.ToUpper();

                // Only update the document key if we're not using a subtype
                if (!document.SubTypeId.HasValue)
                {
                    var docType = await _context.DocumentTypes.FindAsync(document.TypeId);
                    string counterStr = document.DocumentKey.Split('-').Last();
                    document.DocumentKey = $"{docType!.TypeKey}{request.DocumentAlias.ToUpper()}-{counterStr}";
                }
            }

            // Handle circuit changes
            if (request.CircuitId.HasValue)
            {
                if (request.CircuitId.Value > 0)
                {
                    // Verify the circuit exists
                    var circuit = await _context.Circuits.FirstOrDefaultAsync(c => c.Id == request.CircuitId.Value);
                    if (circuit == null)
                        return BadRequest($"The specified circuit (ID: {request.CircuitId}) does not exist.");
                    
                    document.CircuitId = request.CircuitId;
                    document.Circuit = circuit;
                }
                else
                {
                    // If CircuitId is 0, remove the circuit association
                    document.CircuitId = null;
                    document.Circuit = null;
                }
            }

            document.UpdatedAt = DateTime.UtcNow;
            document.UpdatedByUserId = userId;
            _context.Entry(document).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
                var logEntry = new LogHistory
                {
                    UserId = userId,
                    User = user,
                    Timestamp = DateTime.UtcNow,
                    ActionType = 5,
                    Description = $"{user.Username} has updated the document {document.DocumentKey}"
                };
                _context.LogHistories.Add(logEntry);
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Documents.Any(d => d.Id == id)) { return NotFound(); }
                else { throw; }
            }
            catch (DbUpdateException ex)
            {
                // Check for foreign key constraint violations
                if (ex.InnerException != null && ex.InnerException.Message.Contains("FK_Documents_Circuits_CircuitId"))
                {
                    return BadRequest("The specified circuit does not exist. Please select a valid circuit or leave it empty.");
                }
                
                return StatusCode(500, $"An error occurred while updating the document: {ex.Message}");
            }
            return Ok("Document updated!");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDocument(int id)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var userId = authResult.UserId;
            var user = authResult.User!;
            
            // Check if document is archived to ERP before allowing deletion
            var documentToCheck = await _context.Documents.AsNoTracking().FirstOrDefaultAsync(d => d.Id == id);
            if (documentToCheck != null && !string.IsNullOrEmpty(documentToCheck.ERPDocumentCode))
                return BadRequest("This document has been archived to the ERP system and cannot be deleted.");

            try
            {
                // Get document for logging before deletion
                var document = await _context.Documents.FindAsync(id);
                if (document == null)
                    return NotFound("Document not found!");

                // Log the deletion before actually deleting
                var logEntry = new LogHistory
                {
                    UserId = userId,
                    User = user,
                    Timestamp = DateTime.UtcNow,
                    ActionType = 6,
                    Description = $"{user.Username} has deleted the document {document.DocumentKey}"
                };
                _context.LogHistories.Add(logEntry);
                await _context.SaveChangesAsync();

                // Use the workflow service to delete the document and all related records
                // The workflow service now handles the counter decrement within its transaction
                bool success = await _workflowService.DeleteDocumentAsync(id);
                if (!success)
                    return NotFound("Document not found or could not be deleted");

                return Ok("Document deleted!");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpGet("Types")]
        public async Task<ActionResult> GetTypes()
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var userId = authResult.UserId;
            var user = authResult.User!;
            var types = await _context.DocumentTypes.ToListAsync();
            return Ok(types);
        }

        [HttpGet("Types/{id}")]
        public async Task<ActionResult<DocumentType>> GetDocumentType(int id)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var userId = authResult.UserId;
            var user = authResult.User!;

            var documentType = await _context.DocumentTypes.FindAsync(id);

            if (documentType == null)
                return NotFound("Document type not found.");

            return Ok(documentType);
        }

        [HttpPost("valide-typeKey")]
        public async Task<IActionResult> ValideTypeKey([FromBody] DocumentTypeDto request)
        {
            if (await _context.DocumentTypes.AnyAsync(t => t.TypeKey == request.TypeKey))
                return Ok("False");
            return Ok("True");
        }

        [HttpPost("Types")]
        public async Task<ActionResult> CreateTypes([FromBody] DocumentTypeDto request)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var userId = authResult.UserId;
            var user = authResult.User!;
            if (string.IsNullOrEmpty(request.TypeName))
                return BadRequest("Type Name is required!");
            var typeNameExists = await _context.DocumentTypes.AnyAsync(t => t.TypeName == request.TypeName);
            if (typeNameExists)
                return BadRequest("Type Name already exists!");
            var typeCounter = await _context.TypeCounter.FirstOrDefaultAsync();
            if (typeCounter == null)
            {
                typeCounter = new TypeCounter { Counter = 1 };
                _context.TypeCounter.Add(typeCounter);
            }
            string baseKey = (request.TypeName.Length >= 2) ? request.TypeName.Substring(0, 2).ToUpper() : request.TypeName.ToUpper();
            if (!string.IsNullOrEmpty(request.TypeKey))
                baseKey = request.TypeKey;
            bool exists = await _context.DocumentTypes.AnyAsync(t => t.TypeKey == baseKey);
            string finalTypeKey = exists ? $"{baseKey}{typeCounter.Counter++}" : baseKey;
            var type = new DocumentType
            {
                TypeKey = finalTypeKey,
                TypeName = request.TypeName,
                TypeAttr = request.TypeAttr,
                TierType = request.TierType,
                DocumentCounter = 0,
                DocCounter = 0,
                TypeNumber = request.TypeNumber.HasValue ? request.TypeNumber.Value : -1
            };
            _context.DocumentTypes.Add(type);
            await _context.SaveChangesAsync();
            return Ok("Type successfully added!");
        }

        [HttpPost("valide-type")]
        public async Task<IActionResult> ValideType([FromBody] DocumentTypeDto request)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;
                
            var typeName = request.TypeName.ToLower();
            var type = await _context.DocumentTypes.AnyAsync(t => t.TypeName.ToLower() == typeName);
            if (type)
                return Ok("True");
            return Ok("False");
        }

        [HttpPut("Types/{id}")]
        public async Task<IActionResult> UpdateType([FromBody] DocumentTypeDto request, int id)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var userId = authResult.UserId;
            var user = authResult.User!;
            var ThisType = await _context.DocumentTypes.FindAsync(id);
            if (ThisType == null)
                return NotFound("No type with this id!");
            var typeAssociated = await _context.Documents.AnyAsync(d => d.TypeId == id);
            if (typeAssociated)
                return BadRequest("This type is associated with documents and cannot be edited!");
            var typeAssociatedWithCircuits = await _context.Circuits.AnyAsync(c => c.DocumentTypeId == id);
            if (typeAssociatedWithCircuits)
                return BadRequest("This type is associated with circuits and cannot be edited!");
            if (!string.IsNullOrEmpty(request.TypeName))
            {
                var typeName = request.TypeName.ToLower();
                var type = await _context.DocumentTypes.FirstOrDefaultAsync(t => t.TypeName.ToLower() == typeName);
                if (type != null && type.Id != ThisType.Id)
                    return BadRequest("TypeName already exist");
                ThisType.TypeName = request.TypeName;
            }
            if (!string.IsNullOrEmpty(request.TypeAttr))
                ThisType.TypeAttr = request.TypeAttr;
            
            // Update TierType
            ThisType.TierType = request.TierType;
            
            // _context.DocumentTypes.Add(ThisType);
            await _context.SaveChangesAsync();
            return Ok("Type edited successfully");
        }

        [HttpDelete("Types/{id}")]
        public async Task<IActionResult> DeleteType(int id)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var userId = authResult.UserId;
            var user = authResult.User!;
            
            try
            {
                var type = await _context.DocumentTypes.FindAsync(id);
                if (type == null)
                    return NotFound("No document type found with this ID!");

                // Check if there are documents using this type
                var documentCount = await _context.Documents.CountAsync(d => d.TypeId == id);
                if (documentCount > 0)
                    return BadRequest($"This document type cannot be deleted. There are {documentCount} document(s) using this type.");

                // Check if there are circuits using this document type
                var circuitCount = await _context.Circuits.CountAsync(c => c.DocumentTypeId == id);
                if (circuitCount > 0)
                    return BadRequest($"This document type cannot be deleted. There are {circuitCount} circuit(s) associated with this type.");

                // Get associated subtypes for cascade deletion
                var subTypes = await _context.SubTypes
                    .Where(st => st.DocumentTypeId == id)
                    .ToListAsync();

                // Begin transaction for cascade deletion
                using var transaction = await _context.Database.BeginTransactionAsync();
                
                try
                {
                    // Delete associated subtypes first
                    if (subTypes.Any())
                    {
                        _context.SubTypes.RemoveRange(subTypes);
                        await _context.SaveChangesAsync();
                        
                        // Log subtype deletions
                        var subTypeLogEntry = new LogHistory
                        {
                            UserId = userId,
                            User = user,
                            Timestamp = DateTime.UtcNow,
                            ActionType = 6, // Delete action
                            Description = $"{user.Username} deleted {subTypes.Count} series as part of document type '{type.TypeName}' deletion"
                        };
                        _context.LogHistories.Add(subTypeLogEntry);
                    }

                    // Update the document counter to match actual count (for data consistency)
                    type.DocumentCounter = documentCount;

                    // Delete the document type
                    _context.DocumentTypes.Remove(type);
                    await _context.SaveChangesAsync();

                    // Log document type deletion
                    var typeLogEntry = new LogHistory
                    {
                        UserId = userId,
                        User = user,
                        Timestamp = DateTime.UtcNow,
                        ActionType = 6, // Delete action
                        Description = $"{user.Username} deleted document type '{type.TypeName}' and {subTypes.Count} associated series"
                    };
                    _context.LogHistories.Add(typeLogEntry);
                    await _context.SaveChangesAsync();

                    await transaction.CommitAsync();

                    var message = subTypes.Any() 
                        ? $"Document type deleted successfully! Also removed {subTypes.Count} associated series."
                        : "Document type deleted successfully!";

                    return Ok(message);
                }
                catch (Exception)
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            }
            catch (DbUpdateException ex)
            {
                // Handle any unexpected database constraint violations
                var innerMessage = ex.InnerException?.Message ?? ex.Message;
                
                if (innerMessage.Contains("REFERENCE constraint") || innerMessage.Contains("FOREIGN KEY"))
                {
                    return BadRequest("Cannot delete this document type because it is referenced by other records in the system.");
                }
                
                return StatusCode(500, $"Database error occurred while deleting document type: {innerMessage}");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An unexpected error occurred while deleting document type: {ex.Message}");
            }
        }

        [HttpPost("bulk-delete")]
        public async Task<IActionResult> BulkDeleteDocuments([FromBody] List<int> documentIds)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var userId = authResult.UserId;
            var user = authResult.User!;

            if (documentIds == null || !documentIds.Any())
                return BadRequest("No document IDs provided");

            try
            {
                // Check for ERP-archived documents before attempting deletion
                var documentsToCheck = await _context.Documents
                    .Where(d => documentIds.Contains(d.Id))
                    .Select(d => new { d.Id, d.ERPDocumentCode, d.DocumentKey, d.Status })
                    .ToListAsync();

                var erpArchivedDocs = documentsToCheck
                    .Where(d => !string.IsNullOrEmpty(d.ERPDocumentCode))
                    .ToList();

                // Enhanced debug logging
                Console.WriteLine($"[DEBUG] Bulk delete request for {documentIds.Count} documents");
                foreach (var doc in documentsToCheck)
                {
                    var isErpArchived = !string.IsNullOrEmpty(doc.ERPDocumentCode);
                    Console.WriteLine($"[DEBUG] Document {doc.Id} ({doc.DocumentKey}) - Status: {doc.Status}, ERPCode: '{doc.ERPDocumentCode ?? "NULL"}', IsErpArchived: {isErpArchived}");
                }
                Console.WriteLine($"[DEBUG] Found {erpArchivedDocs.Count} ERP-archived documents out of {documentsToCheck.Count} total");

                // Log the bulk deletion attempt
                var logEntry = new LogHistory
                {
                    UserId = userId,
                    User = user,
                    Timestamp = DateTime.UtcNow,
                    ActionType = 6,
                    Description = $"{user.Username} attempted to delete {documentIds.Count} documents in bulk"
                };
                _context.LogHistories.Add(logEntry);
                await _context.SaveChangesAsync();

                // Use the workflow service's bulk delete method
                var (successCount, failedIds) = await _workflowService.DeleteMultipleDocumentsAsync(documentIds);

                // Categorize failed documents
                var erpArchivedFailedDocs = erpArchivedDocs
                    .Where(d => failedIds.Contains(d.Id))
                    .ToList();

                var otherFailedIds = failedIds
                    .Where(id => !erpArchivedFailedDocs.Any(d => d.Id == id))
                    .ToList();

                // Build detailed message
                var messageBuilder = new StringBuilder();
                if (successCount > 0)
                {
                    messageBuilder.Append($"Successfully deleted {successCount} documents");
                }

                if (erpArchivedFailedDocs.Any())
                {
                    if (messageBuilder.Length > 0) messageBuilder.Append(". ");
                    messageBuilder.Append($"{erpArchivedFailedDocs.Count} documents could not be deleted because they are archived to ERP");
                }

                if (otherFailedIds.Any())
                {
                    if (messageBuilder.Length > 0) messageBuilder.Append(". ");
                    messageBuilder.Append($"{otherFailedIds.Count} documents failed for other reasons");
                }

                // Log the result with detailed information
                var resultLogEntry = new LogHistory
                {
                    UserId = userId,
                    User = user,
                    Timestamp = DateTime.UtcNow,
                    ActionType = 6,
                    Description = $"{user.Username} bulk delete completed: {successCount} successful, {erpArchivedFailedDocs.Count} ERP-archived (protected), {otherFailedIds.Count} other failures"
                };
                _context.LogHistories.Add(resultLogEntry);
                await _context.SaveChangesAsync();

                if (failedIds.Any())
                {
                    return Ok(new 
                    { 
                        message = messageBuilder.ToString(),
                        successCount = successCount,
                        failedIds = failedIds,
                        erpArchivedCount = erpArchivedFailedDocs.Count,
                        erpArchivedDocuments = erpArchivedFailedDocs.Select(d => new { 
                            id = d.Id, 
                            documentKey = d.DocumentKey, 
                            erpCode = d.ERPDocumentCode 
                        }),
                        otherFailedCount = otherFailedIds.Count,
                        totalRequested = documentIds.Count
                    });
                }

                return Ok(new 
                { 
                    message = $"Successfully deleted {successCount} documents",
                    successCount = successCount,
                    totalRequested = documentIds.Count
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred during bulk deletion: {ex.Message}");
            }
        }

        [HttpPost("recalculate-counters")]
        public async Task<IActionResult> RecalculateDocumentCounters()
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var userId = authResult.UserId;
            var user = authResult.User!;

            try
            {
                // Get all document types
                var documentTypes = await _context.DocumentTypes.ToListAsync();
                var updatedTypes = new List<object>();

                foreach (var docType in documentTypes)
                {
                    // Calculate actual document count for this type
                    var actualCount = await _context.Documents.CountAsync(d => d.TypeId == docType.Id);
                    var oldCounter = docType.DocumentCounter;
                    
                    // Update the counter to match actual count
                    docType.DocumentCounter = actualCount;
                    
                    if (oldCounter != actualCount)
                    {
                        updatedTypes.Add(new 
                        {
                            TypeId = docType.Id,
                            TypeName = docType.TypeName,
                            OldCounter = oldCounter,
                            NewCounter = actualCount,
                            Difference = actualCount - oldCounter
                        });
                    }
                }

                await _context.SaveChangesAsync();

                // Log the recalculation
                var logEntry = new LogHistory
                {
                    UserId = userId,
                    User = user,
                    Timestamp = DateTime.UtcNow,
                    ActionType = 5, // Update action
                    Description = $"{user.Username} recalculated document type counters. Updated {updatedTypes.Count} types."
                };
                _context.LogHistories.Add(logEntry);
                await _context.SaveChangesAsync();

                return Ok(new 
                {
                    message = $"Successfully recalculated counters for {documentTypes.Count} document types",
                    updatedTypes = updatedTypes,
                    totalTypesChecked = documentTypes.Count,
                    typesUpdated = updatedTypes.Count
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while recalculating counters: {ex.Message}");
            }
        }

        [HttpPost("Types/bulk-delete")]
        public async Task<IActionResult> BulkDeleteDocumentTypes([FromBody] List<int> typeIds)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var userId = authResult.UserId;
            var user = authResult.User!;

            if (typeIds == null || !typeIds.Any())
                return BadRequest("No document type IDs provided");

            var results = new
            {
                successful = new List<object>(),
                failed = new List<object>()
            };

            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                foreach (var typeId in typeIds)
                {
                    try
                    {
                        var type = await _context.DocumentTypes.FindAsync(typeId);
                        if (type == null)
                        {
                            results.failed.Add(new { id = typeId, error = "Document type not found" });
                            continue;
                        }

                        // Check if there are documents using this type
                        var documentCount = await _context.Documents.CountAsync(d => d.TypeId == typeId);
                        if (documentCount > 0)
                        {
                            results.failed.Add(new { 
                                id = typeId, 
                                name = type.TypeName,
                                error = $"Cannot delete - {documentCount} document(s) are using this type" 
                            });
                            continue;
                        }

                        // Check if there are circuits using this document type
                        var circuitCount = await _context.Circuits.CountAsync(c => c.DocumentTypeId == typeId);
                        if (circuitCount > 0)
                        {
                            results.failed.Add(new { 
                                id = typeId, 
                                name = type.TypeName,
                                error = $"Cannot delete - {circuitCount} circuit(s) are associated with this type" 
                            });
                            continue;
                        }

                        // Get associated subtypes for cascade deletion
                        var subTypes = await _context.SubTypes
                            .Where(st => st.DocumentTypeId == typeId)
                            .ToListAsync();

                        // Delete associated subtypes first
                        if (subTypes.Any())
                        {
                            _context.SubTypes.RemoveRange(subTypes);
                        }

                        // Delete the document type
                        _context.DocumentTypes.Remove(type);

                        results.successful.Add(new { 
                            id = typeId, 
                            name = type.TypeName,
                            deletedSeries = subTypes.Count 
                        });
                    }
                    catch (Exception ex)
                    {
                        results.failed.Add(new { 
                            id = typeId, 
                            error = $"Unexpected error: {ex.Message}" 
                        });
                    }
                }

                // Save all changes in the transaction
                await _context.SaveChangesAsync();

                // Log the bulk operation
                var logEntry = new LogHistory
                {
                    UserId = userId,
                    User = user,
                    Timestamp = DateTime.UtcNow,
                    ActionType = 6, // Delete action
                    Description = $"{user.Username} bulk deleted {results.successful.Count} document types, {results.failed.Count} failed"
                };
                _context.LogHistories.Add(logEntry);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                var message = results.failed.Any() 
                    ? $"Partially completed: {results.successful.Count} deleted, {results.failed.Count} failed"
                    : $"Successfully deleted {results.successful.Count} document types";

                return Ok(new 
                {
                    message = message,
                    successful = results.successful,
                    failed = results.failed,
                    totalRequested = typeIds.Count
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"An error occurred during bulk deletion: {ex.Message}");
            }
        }

        // Test endpoint for manual ERP archival
        [HttpPost("{id}/archive-to-erp")]
        public async Task<IActionResult> ManualErpArchival(int id)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            try
            {
                var document = await _context.Documents.FindAsync(id);
                if (document == null)
                    return NotFound("Document not found");

                // Check if already archived
                if (!string.IsNullOrEmpty(document.ERPDocumentCode))
                    return BadRequest($"Document is already archived to ERP with code: {document.ERPDocumentCode}");

                // Trigger ERP archival
                var success = await _erpArchivalService.ArchiveDocumentToErpAsync(id);
                
                if (success)
                {
                    // Refresh document to get updated ERP code
                    await _context.Entry(document).ReloadAsync();
                    return Ok(new { 
                        message = "Document successfully archived to ERP", 
                        erpDocumentCode = document.ERPDocumentCode 
                    });
                }
                else
                {
                    return StatusCode(500, new { 
                        message = "Failed to archive document to ERP. Check logs for details.",
                        errorType = "ErpArchivalError"
                    });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error during ERP archival: {ex.Message}");
            }
        }

        // Get ERP archival status for a document
        [HttpGet("{id}/erp-status")]
        public async Task<IActionResult> GetDocumentErpStatus(int id)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser", "SimpleUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            try
            {
                var erpStatus = await _erpArchivalService.GetDocumentErpStatusAsync(id);
                return Ok(erpStatus);
            }
            catch (KeyNotFoundException)
            {
                return NotFound("Document not found");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error retrieving ERP status: {ex.Message}");
            }
        }

        // Get ERP errors for a document
        [HttpGet("{id}/erp-errors")]
        public async Task<IActionResult> GetDocumentErpErrors(int id)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser", "SimpleUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            try
            {
                var errors = await _erpArchivalService.GetDocumentErpErrorsAsync(id);
                return Ok(errors);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error retrieving ERP errors: {ex.Message}");
            }
        }

        // Resolve an ERP error
        [HttpPost("erp-errors/{errorId}/resolve")]
        public async Task<IActionResult> ResolveErpError(int errorId, [FromBody] ResolveErpErrorRequest request)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            try
            {
                var success = await _erpArchivalService.ResolveErpErrorAsync(errorId, authResult.UserId, request.ResolutionNotes);
                
                if (success)
                {
                    return Ok(new { message = "ERP error resolved successfully" });
                }
                else
                {
                    return NotFound("ERP error not found");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error resolving ERP error: {ex.Message}");
            }
        }

        // Retry document archival
        [HttpPost("{id}/retry-archival")]
        public async Task<IActionResult> RetryDocumentArchival(int id, [FromBody] RetryErpArchivalRequest request)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            try
            {
                var success = await _erpArchivalService.RetryDocumentArchivalAsync(id, authResult.UserId, request.Reason);
                
                if (success)
                {
                    return Ok(new { message = "Document archival retry completed successfully" });
                }
                else
                {
                    return StatusCode(500, new { message = "Document archival retry failed" });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error retrying document archival: {ex.Message}");
            }
        }

        // Retry line archival
        [HttpPost("{id}/retry-line-archival")]
        public async Task<IActionResult> RetryLineArchival(int id, [FromBody] RetryErpArchivalRequest request)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            try
            {
                if (request.LigneIds == null || !request.LigneIds.Any())
                {
                    return BadRequest("Ligne IDs must be provided for line archival retry");
                }

                var success = await _erpArchivalService.RetryLineArchivalAsync(id, request.LigneIds, authResult.UserId, request.Reason);
                
                if (success)
                {
                    return Ok(new { message = "Line archival retry completed successfully" });
                }
                else
                {
                    return StatusCode(500, new { message = "Line archival retry failed" });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error retrying line archival: {ex.Message}");
            }
        }

        // Test endpoint for manual ERP line creation
        [HttpPost("{id}/create-lines-in-erp")]
        public async Task<IActionResult> ManualErpLineCreation(int id)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            try
            {
                var document = await _context.Documents
                    .Include(d => d.Lignes)
                    .FirstOrDefaultAsync(d => d.Id == id);
                    
                if (document == null)
                    return NotFound("Document not found");

                // Check if document is archived to ERP
                if (string.IsNullOrEmpty(document.ERPDocumentCode))
                    return BadRequest("Document must be archived to ERP first before creating lines");

                if (!document.Lignes.Any())
                    return BadRequest("Document has no lines to create in ERP");

                // Trigger ERP line creation
                var success = await _erpArchivalService.CreateDocumentLinesInErpAsync(id);
                
                if (success)
                {
                    // Refresh document lines to get updated ERP line codes
                    await _context.Entry(document).ReloadAsync();
                    await _context.Entry(document).Collection(d => d.Lignes).LoadAsync();
                    
                    var lineResults = document.Lignes.Select(l => new {
                        ligneId = l.Id,
                        title = l.Title,
                        erpLineCode = l.ERPLineCode,
                        isCreated = !string.IsNullOrEmpty(l.ERPLineCode)
                    }).ToList();
                    
                    return Ok(new { 
                        message = "Document lines successfully processed in ERP", 
                        erpDocumentCode = document.ERPDocumentCode,
                        totalLines = document.Lignes.Count,
                        createdLines = lineResults.Count(l => l.isCreated),
                        lines = lineResults
                    });
                }
                else
                {
                    return StatusCode(500, new { 
                        message = "Failed to create some or all document lines in ERP. Check logs for details.",
                        errorType = "ErpLineCreationError"
                    });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error during ERP line creation: {ex.Message}");
            }
        }

        // Endpoint to fix archived documents that don't have their lines created in ERP
        [HttpPost("fix-missing-erp-lines")]
        public async Task<IActionResult> FixMissingErpLines()
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            try
            {
                // Find documents that are archived to ERP but have lines without ERPLineCode
                var documentsNeedingLineFix = await _context.Documents
                    .Include(d => d.Lignes)
                    .Where(d => !string.IsNullOrEmpty(d.ERPDocumentCode) && 
                               d.Lignes.Any(l => string.IsNullOrEmpty(l.ERPLineCode)))
                    .ToListAsync();

                if (!documentsNeedingLineFix.Any())
                {
                    return Ok(new { 
                        message = "No documents found that need line fixes",
                        documentsProcessed = 0
                    });
                }

                var successCount = 0;
                var errorCount = 0;
                var results = new List<object>();

                foreach (var document in documentsNeedingLineFix)
                {
                    try
                    {
                        var linesNeedingCreation = document.Lignes.Where(l => string.IsNullOrEmpty(l.ERPLineCode)).Count();
                        
                        if (linesNeedingCreation > 0)
                        {
                            var success = await _erpArchivalService.CreateDocumentLinesInErpAsync(document.Id);
                            
                            if (success)
                            {
                                successCount++;
                                
                                // Refresh to get updated line codes
                                await _context.Entry(document).ReloadAsync();
                                await _context.Entry(document).Collection(d => d.Lignes).LoadAsync();
                                
                                var createdLines = document.Lignes.Count(l => !string.IsNullOrEmpty(l.ERPLineCode));
                                
                                results.Add(new {
                                    documentId = document.Id,
                                    documentKey = document.DocumentKey,
                                    erpDocumentCode = document.ERPDocumentCode,
                                    status = "success",
                                    totalLines = document.Lignes.Count,
                                    createdLines = createdLines
                                });
                            }
                            else
                            {
                                errorCount++;
                                results.Add(new {
                                    documentId = document.Id,
                                    documentKey = document.DocumentKey,
                                    erpDocumentCode = document.ERPDocumentCode,
                                    status = "failed",
                                    error = "Failed to create lines in ERP"
                                });
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        errorCount++;
                        results.Add(new {
                            documentId = document.Id,
                            documentKey = document.DocumentKey,
                            erpDocumentCode = document.ERPDocumentCode,
                            status = "error",
                            error = ex.Message
                        });
                    }
                }

                return Ok(new {
                    message = $"Processed {documentsNeedingLineFix.Count} documents with missing ERP lines",
                    documentsProcessed = documentsNeedingLineFix.Count,
                    successCount = successCount,
                    errorCount = errorCount,
                    results = results
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error during bulk ERP line fix: {ex.Message}");
            }
        }

        // Debug endpoint to check ERP archival status
        [HttpPost("check-erp-status")]
        public async Task<IActionResult> CheckErpStatus([FromBody] List<int> documentIds)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            try
            {
                var documents = await _context.Documents
                    .Where(d => documentIds.Contains(d.Id))
                    .Select(d => new { 
                        d.Id, 
                        d.DocumentKey, 
                        d.Status, 
                        d.ERPDocumentCode,
                        IsErpArchived = !string.IsNullOrEmpty(d.ERPDocumentCode),
                        d.IsCircuitCompleted,
                        d.UpdatedAt
                    })
                    .ToListAsync();

                return Ok(new { 
                    message = "ERP archival status check",
                    requestedCount = documentIds.Count,
                    foundCount = documents.Count,
                    documents = documents
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error checking ERP status: {ex.Message}");
            }
        }

        // Diagnostic endpoint to check circuit configurations for ERP archival issues
        [HttpGet("diagnose-erp-archival")]
        public async Task<IActionResult> DiagnoseErpArchivalIssues()
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            try
            {
                // Get all circuits with their statuses and document types
                var circuits = await _context.Circuits
                    .Include(c => c.DocumentType)
                    .Include(c => c.Statuses)
                    .Where(c => c.IsActive)
                    .ToListAsync();

                var diagnosticResults = new List<object>();

                foreach (var circuit in circuits)
                {
                    var finalStatuses = circuit.Statuses.Where(s => s.IsFinal).ToList();
                    var totalStatuses = circuit.Statuses.Count;

                    // Get completed documents for this circuit that are not archived
                    var completedNotArchivedCount = await _context.Documents
                        .Where(d => d.CircuitId == circuit.Id && 
                                   d.IsCircuitCompleted && 
                                   string.IsNullOrEmpty(d.ERPDocumentCode))
                        .CountAsync();

                    // Get sample completed documents
                    var sampleCompletedDocs = await _context.Documents
                        .Where(d => d.CircuitId == circuit.Id && 
                                   d.IsCircuitCompleted && 
                                   string.IsNullOrEmpty(d.ERPDocumentCode))
                        .Include(d => d.CurrentStatus)
                        .Take(5)
                        .Select(d => new {
                            d.Id,
                            d.DocumentKey,
                            CurrentStatusTitle = d.CurrentStatus != null ? d.CurrentStatus.Title : "None",
                            CurrentStatusIsFinal = d.CurrentStatus != null ? d.CurrentStatus.IsFinal : false,
                            d.IsCircuitCompleted,
                            d.UpdatedAt
                        })
                        .ToListAsync();

                    diagnosticResults.Add(new
                    {
                        CircuitId = circuit.Id,
                        CircuitKey = circuit.CircuitKey,
                        CircuitTitle = circuit.Title,
                        DocumentType = circuit.DocumentType?.TypeName ?? "No Type",
                        TotalStatuses = totalStatuses,
                        FinalStatusCount = finalStatuses.Count,
                        FinalStatuses = finalStatuses.Select(s => new { 
                            s.Id, 
                            s.Title, 
                            s.StatusKey,
                            s.IsFinal 
                        }).ToList(),
                        HasProperFinalStatus = finalStatuses.Count == 1,
                        CompletedNotArchivedCount = completedNotArchivedCount,
                        SampleCompletedDocuments = sampleCompletedDocs,
                        Issue = finalStatuses.Count == 0 ? "NO_FINAL_STATUS" :
                               finalStatuses.Count > 1 ? "MULTIPLE_FINAL_STATUS" :
                               completedNotArchivedCount > 0 ? "COMPLETED_NOT_ARCHIVED" : "OK",
                        Recommendation = finalStatuses.Count == 0 ? 
                            "Mark the final status as IsFinal=true in the database" :
                        finalStatuses.Count > 1 ? 
                            "Only one status should be marked as IsFinal=true" :
                        completedNotArchivedCount > 0 ? 
                            "Check ERP archival errors for these documents" : "Circuit is properly configured"
                    });
                }

                var summary = new
                {
                    TotalCircuits = circuits.Count,
                    CircuitsWithNoFinalStatus = diagnosticResults.Count(r => ((string)((dynamic)r).Issue) == "NO_FINAL_STATUS"),
                    CircuitsWithMultipleFinalStatus = diagnosticResults.Count(r => ((string)((dynamic)r).Issue) == "MULTIPLE_FINAL_STATUS"),
                    CircuitsWithCompletedNotArchived = diagnosticResults.Count(r => ((string)((dynamic)r).Issue) == "COMPLETED_NOT_ARCHIVED"),
                    CircuitsOK = diagnosticResults.Count(r => ((string)((dynamic)r).Issue) == "OK")
                };

                return Ok(new
                {
                    summary = summary,
                    circuits = diagnosticResults,
                    message = "ERP archival diagnostic complete. Check circuits with issues.",
                    action = "Fix circuit configurations by setting IsFinal=true on final statuses"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error diagnosing ERP archival issues: {ex.Message}");
            }
        }

        // Fix endpoint to correct circuit configurations for ERP archival
        [HttpPost("fix-circuit-final-statuses")]
        public async Task<IActionResult> FixCircuitFinalStatuses([FromBody] List<int> circuitIds)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                var results = new List<object>();

                foreach (var circuitId in circuitIds)
                {
                    var circuit = await _context.Circuits
                        .Include(c => c.Statuses)
                        .Include(c => c.Steps)
                        .FirstOrDefaultAsync(c => c.Id == circuitId);

                    if (circuit == null)
                    {
                        results.Add(new { CircuitId = circuitId, Status = "Not Found" });
                        continue;
                    }

                    var finalStatuses = circuit.Statuses.Where(s => s.IsFinal).ToList();

                    if (finalStatuses.Count == 1)
                    {
                        results.Add(new { 
                            CircuitId = circuitId, 
                            CircuitTitle = circuit.Title,
                            Status = "Already Configured", 
                            FinalStatus = finalStatuses.First().Title 
                        });
                        continue;
                    }

                    if (finalStatuses.Count > 1)
                    {
                        results.Add(new { 
                            CircuitId = circuitId, 
                            CircuitTitle = circuit.Title,
                            Status = "Multiple Final Statuses - Manual Fix Required", 
                            FinalStatuses = finalStatuses.Select(s => s.Title).ToList()
                        });
                        continue;
                    }

                    // No final status - try to identify which one should be final
                    // Look for statuses that are not "next status" targets (likely terminal statuses)
                    var nextStatusIds = circuit.Steps.Select(s => s.NextStatusId).Distinct().ToHashSet();
                    var terminalStatuses = circuit.Statuses
                        .Where(s => !nextStatusIds.Contains(s.Id) && !s.IsInitial)
                        .ToList();

                    if (terminalStatuses.Count == 1)
                    {
                        // Perfect - found exactly one terminal status
                        var terminalStatus = terminalStatuses.First();
                        terminalStatus.IsFinal = true;
                        
                        results.Add(new { 
                            CircuitId = circuitId,
                            CircuitTitle = circuit.Title,
                            Status = "Fixed - Marked Terminal Status as Final",
                            MarkedFinal = terminalStatus.Title,
                            StatusId = terminalStatus.Id
                        });
                    }
                    else if (terminalStatuses.Count == 0)
                    {
                        // No clear terminal status - look for statuses with "final" keywords
                        var likelyFinalStatuses = circuit.Statuses
                            .Where(s => s.Title.ToLower().Contains("final") || 
                                       s.Title.ToLower().Contains("complete") ||
                                       s.Title.ToLower().Contains("approved") ||
                                       s.Title.ToLower().Contains("closed") ||
                                       s.Title.ToLower().Contains("finished"))
                            .ToList();

                        if (likelyFinalStatuses.Count == 1)
                        {
                            var finalStatus = likelyFinalStatuses.First();
                            finalStatus.IsFinal = true;
                            
                            results.Add(new { 
                                CircuitId = circuitId,
                                CircuitTitle = circuit.Title,
                                Status = "Fixed - Marked Likely Final Status",
                                MarkedFinal = finalStatus.Title,
                                StatusId = finalStatus.Id
                            });
                        }
                        else
                        {
                            results.Add(new { 
                                CircuitId = circuitId,
                                CircuitTitle = circuit.Title,
                                Status = "Cannot Auto-Fix - Manual Review Required",
                                AvailableStatuses = circuit.Statuses.Select(s => new { s.Id, s.Title }).ToList(),
                                Suggestion = "Please manually mark one status as IsFinal=true"
                            });
                        }
                    }
                    else
                    {
                        // Multiple terminal statuses
                        results.Add(new { 
                            CircuitId = circuitId,
                            CircuitTitle = circuit.Title,
                            Status = "Multiple Terminal Statuses - Manual Review Required",
                            TerminalStatuses = terminalStatuses.Select(s => new { s.Id, s.Title }).ToList(),
                            Suggestion = "Please manually choose which status should be marked as IsFinal=true"
                        });
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                var summary = new
                {
                    TotalCircuits = circuitIds.Count,
                    Fixed = results.Count(r => ((string)((dynamic)r).Status).Contains("Fixed")),
                    AlreadyConfigured = results.Count(r => ((string)((dynamic)r).Status) == "Already Configured"),
                    RequireManualReview = results.Count(r => ((string)((dynamic)r).Status).Contains("Manual"))
                };

                return Ok(new
                {
                    summary = summary,
                    results = results,
                    message = "Circuit final status fix completed",
                    nextSteps = "Run the diagnostic endpoint again to verify fixes"
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"Error fixing circuit configurations: {ex.Message}");
            }
        }

        // Retroactively trigger ERP archival for completed documents that weren't archived
        [HttpPost("retroactive-erp-archival")]
        public async Task<IActionResult> RetroactiveErpArchival([FromBody] List<int>? documentIds = null)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            try
            {
                IQueryable<Document> query = _context.Documents;

                if (documentIds != null && documentIds.Any())
                {
                    // Process specific documents
                    query = query.Where(d => documentIds.Contains(d.Id));
                }
                else
                {
                    // Process all completed documents that are not archived
                    query = query.Where(d => d.IsCircuitCompleted && string.IsNullOrEmpty(d.ERPDocumentCode));
                }

                var documentsToArchive = await query
                    .Include(d => d.DocumentType)
                    .Include(d => d.Circuit)
                    .Include(d => d.CurrentStatus)
                    .ToListAsync();

                var results = new List<object>();
                var successCount = 0;
                var errorCount = 0;

                foreach (var document in documentsToArchive)
                {
                    try
                    {
                        _logger.LogInformation("Retroactively archiving document {DocumentId} ({DocumentKey})", 
                            document.Id, document.DocumentKey);

                        var archivalSuccess = await _erpArchivalService.ArchiveDocumentToErpAsync(document.Id);

                        if (archivalSuccess)
                        {
                            // Reload document to get updated ERP code
                            await _context.Entry(document).ReloadAsync();
                            
                            results.Add(new
                            {
                                DocumentId = document.Id,
                                DocumentKey = document.DocumentKey,
                                Status = "Success",
                                ErpDocumentCode = document.ERPDocumentCode,
                                Message = "Successfully archived to ERP"
                            });
                            successCount++;
                        }
                        else
                        {
                            results.Add(new
                            {
                                DocumentId = document.Id,
                                DocumentKey = document.DocumentKey,
                                Status = "Failed",
                                Message = "ERP archival returned false - check logs for details"
                            });
                            errorCount++;
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error during retroactive archival for document {DocumentId}: {Error}", 
                            document.Id, ex.Message);
                        
                        results.Add(new
                        {
                            DocumentId = document.Id,
                            DocumentKey = document.DocumentKey,
                            Status = "Error",
                            Message = ex.Message
                        });
                        errorCount++;
                    }
                }

                var summary = new
                {
                    TotalDocuments = documentsToArchive.Count,
                    Successful = successCount,
                    Failed = errorCount,
                    SuccessRate = documentsToArchive.Count > 0 ? 
                        Math.Round((double)successCount / documentsToArchive.Count * 100, 2) : 0
                };

                return Ok(new
                {
                    summary = summary,
                    results = results,
                    message = $"Retroactive ERP archival completed. {successCount} successful, {errorCount} failed."
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error during retroactive ERP archival: {ex.Message}");
            }
        }

        // Diagnose and fix duplicate ERP code issues
        [HttpGet("diagnose-duplicate-erp-codes")]
        public async Task<IActionResult> DiagnoseDuplicateErpCodes()
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            try
            {
                // Find all documents with duplicate ERP codes WITHIN THE SAME DOCUMENT TYPE
                var duplicateGroups = await _context.Documents
                    .Include(d => d.DocumentType)
                    .Where(d => !string.IsNullOrEmpty(d.ERPDocumentCode))
                    .GroupBy(d => new { d.ERPDocumentCode, d.TypeId })
                    .Where(g => g.Count() > 1)
                    .Select(g => new
                    {
                        ErpCode = g.Key.ERPDocumentCode,
                        TypeId = g.Key.TypeId,
                        DocumentTypeName = g.First().DocumentType != null ? g.First().DocumentType.TypeName : "Unknown",
                        DocumentCount = g.Count(),
                        Documents = g.Select(d => new
                        {
                            d.Id,
                            d.DocumentKey,
                            d.CreatedAt,
                            d.UpdatedAt,
                            d.Status,
                            DocumentTypeName = d.DocumentType != null ? d.DocumentType.TypeName : "Unknown"
                        }).OrderBy(d => d.CreatedAt).ToList()
                    })
                    .ToListAsync();

                // Find documents that are completed but not archived (potential victims of duplicate code issues)
                var completedNotArchived = await _context.Documents
                    .Include(d => d.DocumentType)
                    .Where(d => d.IsCircuitCompleted && string.IsNullOrEmpty(d.ERPDocumentCode))
                    .Select(d => new
                    {
                        d.Id,
                        d.DocumentKey,
                        d.CreatedAt,
                        d.UpdatedAt,
                        DocumentTypeName = d.DocumentType != null ? d.DocumentType.TypeName : "Unknown",
                        d.Status
                    })
                    .OrderByDescending(d => d.UpdatedAt)
                    .Take(50) // Limit to recent ones
                    .ToListAsync();

                // Check for recent ERP archival errors related to duplicates
                var duplicateErrors = await _context.ErpArchivalErrors
                    .Include(e => e.Document)
                    .Where(e => !e.IsResolved && 
                               (e.ErrorMessage.Contains("duplicate") || 
                                e.ErrorMessage.Contains("Duplicate") ||
                                e.ErrorMessage.Contains("unique") ||
                                e.ErrorMessage.Contains("IX_Documents_ERPDocumentCode") ||
                                e.ErrorMessage.Contains("IX_Documents_ERPDocumentCode_TypeId")))
                    .OrderByDescending(e => e.OccurredAt)
                    .Take(20)
                    .Select(e => new
                    {
                        e.Id,
                        e.DocumentId,
                        DocumentKey = e.Document != null ? e.Document.DocumentKey : "Unknown",
                        e.ErrorMessage,
                        e.ErrorDetails,
                        e.OccurredAt,
                        e.ErrorType
                    })
                    .ToListAsync();

                var analysis = new
                {
                    DuplicateErpCodes = new
                    {
                        Count = duplicateGroups.Count,
                        TotalAffectedDocuments = duplicateGroups.Sum(g => g.DocumentCount),
                        Groups = duplicateGroups
                    },
                    CompletedNotArchived = new
                    {
                        Count = completedNotArchived.Count,
                        Documents = completedNotArchived
                    },
                    RecentDuplicateErrors = new
                    {
                        Count = duplicateErrors.Count,
                        Errors = duplicateErrors
                    },
                    Recommendations = new List<string>
                    {
                        duplicateGroups.Any() ? "Remove duplicate ERP codes by clearing them from newer documents" : "No duplicate ERP codes found",
                        completedNotArchived.Any() ? $"Retry archival for {completedNotArchived.Count} completed documents" : "All completed documents are archived",
                        duplicateErrors.Any() ? "Resolve duplicate-related ERP errors" : "No recent duplicate errors",
                        "Check Business Central numbering series configuration",
                        "Consider implementing ERP code uniqueness validation before saving"
                    }
                };

                return Ok(analysis);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error diagnosing duplicate ERP codes: {ex.Message}");
            }
        }

        // Fix duplicate ERP codes by clearing duplicates and retrying archival
        [HttpPost("fix-duplicate-erp-codes")]
        public async Task<IActionResult> FixDuplicateErpCodes([FromBody] FixDuplicateErpCodesRequest request)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            using var transaction = await _context.Database.BeginTransactionAsync();
            
            try
            {
                var results = new List<object>();
                
                // Step 1: Clear duplicate ERP codes within the same document type (keep the oldest document with each code per type)
                var duplicateGroups = await _context.Documents
                    .Include(d => d.DocumentType)
                    .Where(d => !string.IsNullOrEmpty(d.ERPDocumentCode))
                    .GroupBy(d => new { d.ERPDocumentCode, d.TypeId })
                    .Where(g => g.Count() > 1)
                    .ToListAsync();

                foreach (var group in duplicateGroups)
                {
                    var documentsInGroup = group.OrderBy(d => d.CreatedAt).ToList();
                    var keepDocument = documentsInGroup.First(); // Keep the oldest
                    var duplicateDocuments = documentsInGroup.Skip(1).ToList();
                    
                    var documentTypeName = keepDocument.DocumentType?.TypeName ?? "Unknown";

                    foreach (var duplicate in duplicateDocuments)
                    {
                        _logger.LogInformation("Clearing duplicate ERP code {ErpCode} from document {DocumentId} of type {DocumentType} (keeping in document {KeepDocumentId})", 
                            duplicate.ERPDocumentCode, duplicate.Id, documentTypeName, keepDocument.Id);
                        
                        duplicate.ERPDocumentCode = null; // Clear the duplicate
                        duplicate.UpdatedAt = DateTime.UtcNow;
                        
                        results.Add(new
                        {
                            Action = "Cleared Duplicate ERP Code",
                            DocumentId = duplicate.Id,
                            DocumentKey = duplicate.DocumentKey,
                            DocumentType = documentTypeName,
                            ClearedErpCode = group.Key.ERPDocumentCode,
                            KeptInDocument = keepDocument.DocumentKey
                        });
                    }
                }

                await _context.SaveChangesAsync();

                // Step 2: Retry archival for completed documents without ERP codes
                if (request.RetryArchival)
                {
                    var documentsToRetry = await _context.Documents
                        .Where(d => d.IsCircuitCompleted && string.IsNullOrEmpty(d.ERPDocumentCode))
                        .Take(request.MaxRetryCount ?? 10)
                        .ToListAsync();

                    foreach (var document in documentsToRetry)
                    {
                        try
                        {
                            var archivalSuccess = await _erpArchivalService.ArchiveDocumentToErpAsync(document.Id);
                            
                            if (archivalSuccess)
                            {
                                // Reload to get the new ERP code
                                await _context.Entry(document).ReloadAsync();
                                
                                results.Add(new
                                {
                                    Action = "Retry Archival Success",
                                    DocumentId = document.Id,
                                    DocumentKey = document.DocumentKey,
                                    NewErpCode = document.ERPDocumentCode
                                });
                            }
                            else
                            {
                                results.Add(new
                                {
                                    Action = "Retry Archival Failed",
                                    DocumentId = document.Id,
                                    DocumentKey = document.DocumentKey,
                                    Message = "Check ERP archival errors for details"
                                });
                            }
                        }
                        catch (Exception ex)
                        {
                            results.Add(new
                            {
                                Action = "Retry Archival Error",
                                DocumentId = document.Id,
                                DocumentKey = document.DocumentKey,
                                Error = ex.Message
                            });
                        }
                    }
                }

                await transaction.CommitAsync();

                var summary = new
                {
                    DuplicatesCleared = results.Count(r => ((dynamic)r).Action == "Cleared Duplicate ERP Code"),
                    ArchivalRetries = results.Count(r => ((string)((dynamic)r).Action).StartsWith("Retry Archival")),
                    SuccessfulRetries = results.Count(r => ((dynamic)r).Action == "Retry Archival Success"),
                    FailedRetries = results.Count(r => ((dynamic)r).Action == "Retry Archival Failed")
                };

                return Ok(new
                {
                    summary = summary,
                    results = results,
                    message = "Duplicate ERP code fix completed",
                    nextSteps = new[]
                    {
                        "Run the diagnostic again to verify fixes",
                        "Check Business Central numbering series configuration",
                        "Monitor for new duplicate code issues"
                    }
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"Error fixing duplicate ERP codes: {ex.Message}");
            }
        }

        // Fix existing ERP archival errors with incorrect ligne codes
        [HttpPost("fix-erp-error-ligne-codes")]
        public async Task<IActionResult> FixErpErrorLigneCodes()
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            try
            {
                // Get all ERP archival errors that have ligne IDs but potentially wrong ligne codes
                var errorsToFix = await _context.ErpArchivalErrors
                    .Include(e => e.Ligne)
                    .Where(e => e.LigneId.HasValue && e.Ligne != null)
                    .ToListAsync();

                var fixedCount = 0;
                var skippedCount = 0;

                foreach (var error in errorsToFix)
                {
                    if (error.Ligne != null)
                    {
                        // Use LigneKey first as it has the proper format (e.g., ITM_1000, ACC_100000)
                        var correctLigneCode = !string.IsNullOrEmpty(error.Ligne.LigneKey) ? 
                            error.Ligne.LigneKey : error.Ligne.ElementId;
                        
                        // Only update if the code is different
                        if (error.LigneCode != correctLigneCode)
                        {
                            _logger.LogInformation("Fixing ligne code for error {ErrorId}: '{OldCode}' -> '{NewCode}'", 
                                error.Id, error.LigneCode, correctLigneCode);
                            
                            error.LigneCode = correctLigneCode?.Length > 100 ? 
                                correctLigneCode.Substring(0, 100) : correctLigneCode;
                            fixedCount++;
                        }
                        else
                        {
                            skippedCount++;
                        }
                    }
                }

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    message = "ERP archival error ligne codes fix completed",
                    totalErrors = errorsToFix.Count,
                    fixedCount = fixedCount,
                    skippedCount = skippedCount,
                    details = "Updated ligne codes to use proper format (e.g., ITM_1000, ACC_100000 instead of raw element IDs)"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error fixing ERP archival error ligne codes: {ex.Message}");
            }
        }
    }
}
