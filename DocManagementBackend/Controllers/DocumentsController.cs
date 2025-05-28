using Microsoft.AspNetCore.Mvc;
using DocManagementBackend.Models;
using DocManagementBackend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using DocManagementBackend.Mappings;
using DocManagementBackend.Services;
// using DocManagementBackend.ModelsDtos;
using DocManagementBackend.Utils;

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
        
        public DocumentsController(ApplicationDbContext context, DocumentWorkflowService workflowService, UserAuthorizationService authService) 
        { 
            _context = context;
            _workflowService = workflowService;
            _authService = authService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<DocumentDto>>> GetDocuments()
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser", "SimpleUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var userId = authResult.UserId;
            var user = authResult.User!;
            var documents = await _context.Documents
                .Include(d => d.CreatedBy).ThenInclude(u => u.Role)
                .Include(d => d.DocumentType)
                .Include(d => d.SubType)
                .Include(d => d.CurrentStep)
                .Include(d => d.ResponsibilityCentre)
                .Include(d => d.Lignes)
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
                .Include(d => d.DocumentType)
                .Include(d => d.SubType)
                .Include(d => d.CurrentStep)
                .Include(d => d.ResponsibilityCentre)
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

            var recentDocuments = await _context.Documents
                .Include(d => d.CreatedBy).ThenInclude(u => u.Role)
                .Include(d => d.DocumentType)
                .Include(d => d.SubType)
                .Include(d => d.CurrentStep)
                .Include(d => d.ResponsibilityCentre)
                .Include(d => d.Lignes)
                .OrderByDescending(d => d.CreatedAt) // Sort by creation date, newest first
                .Take(limit) // Take only the specified number of documents
                .Select(DocumentMappings.ToDocumentDto)
                .ToListAsync();

            return Ok(recentDocuments);
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

                var documentDate = request.DocDate ?? DateTime.UtcNow;
                if (documentDate < subType.StartDate || documentDate > subType.EndDate)
                    return BadRequest($"Document date ({documentDate:d}) must be within the selected SubType date range ({subType.StartDate:d} to {subType.EndDate:d})");
            }

            var docDate = request.DocDate ?? DateTime.UtcNow;
            var docAlias = "";

            if (!string.IsNullOrEmpty(request.DocumentAlias))
                docAlias = request.DocumentAlias.ToUpper();

            docType.DocumentCounter++;
            docType.DocCounter++;
            int counterValue = docType.DocCounter;
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
                IsCircuitCompleted = false // Explicitly set to false for new documents
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
                if (document.DocDate < subType.StartDate || document.DocDate > subType.EndDate)
                    return BadRequest($"Document date ({document.DocDate:d}) must be within the selected SubType date range ({subType.StartDate:d} to {subType.EndDate:d})");

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

            try
            {
                var document = await _context.Documents.FindAsync(id);
                if (document == null)
                    return NotFound("Document not found!");

                // Update the document type counter
                var type = await _context.DocumentTypes.FindAsync(document.TypeId);
                if (type == null)
                    return BadRequest("Missing DocumentType");
                if (type.DocumentCounter > 0)
                    type.DocumentCounter--;

                // Log the deletion
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
                DocumentCounter = 0,
                DocCounter = 0
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
            if (!string.IsNullOrEmpty(request.TypeName))
            {
                var typeName = request.TypeName.ToLower();
                var type = await _context.DocumentTypes.FirstOrDefaultAsync(t => t.TypeName.ToLower() == typeName);
                if (type != null && type.Id != ThisType.Id)
                    return BadRequest("TypeName already exist");
                // if ()
                ThisType.TypeName = request.TypeName;
            }
            if (!string.IsNullOrEmpty(request.TypeAttr))
                ThisType.TypeAttr = request.TypeAttr;
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
            var type = await _context.DocumentTypes.FindAsync(id);
            if (type == null)
                return NotFound("No type with this id!");
            if (type.DocumentCounter > 0)
                return BadRequest("This type can't be deleted. There are documents registered with!");
            _context.DocumentTypes.Remove(type);
            await _context.SaveChangesAsync();

            return Ok("Type deleted!");
        }
    }
}
