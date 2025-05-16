using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DocManagementBackend.Data;
using DocManagementBackend.Models;
using DocManagementBackend.Services;
using System.Security.Claims;

namespace DocManagementBackend.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class WorkflowController : ControllerBase
    {
        private readonly DocumentWorkflowService _workflowService;
        private readonly ApplicationDbContext _context;
        private readonly UserAuthorizationService _authService;

        public WorkflowController(
            DocumentWorkflowService workflowService, 
            ApplicationDbContext context,
            UserAuthorizationService authService)
        {
            _workflowService = workflowService;
            _context = context;
            _authService = authService;
        }

        [HttpPost("assign-circuit")]
        public async Task<IActionResult> AssignDocumentToCircuit([FromBody] AssignCircuitDto assignCircuitDto)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var userId = authResult.UserId;

            try
            {
                var success = await _workflowService.AssignDocumentToCircuitAsync(
                    assignCircuitDto.DocumentId, assignCircuitDto.CircuitId, userId);

                if (success)
                    return Ok("Document assigned to circuit successfully.");
                else
                    return BadRequest("Failed to assign document to circuit.");
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpPost("perform-action")]
        public async Task<IActionResult> PerformAction([FromBody] PerformActionDto actionDto)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var userId = authResult.UserId;

            try
            {
                var success = await _workflowService.ProcessActionAsync(
                    actionDto.DocumentId, actionDto.ActionId, userId, actionDto.Comments, actionDto.IsApproved);

                if (success)
                    return Ok("Action performed successfully.");
                else
                    return BadRequest("Failed to perform action.");
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpPost("move-to-status")]
        public async Task<IActionResult> MoveToStatus([FromBody] MoveToStatusDto moveToStatusDto)
        {
            Console.WriteLine($"MoveToStatus called with documentId={moveToStatusDto.DocumentId}, targetStatusId={moveToStatusDto.TargetStatusId}");
            
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var userId = authResult.UserId;
            var user = authResult.User!;

            try
            {
                // Get document and status information for logging
                var document = await _context.Documents
                    .Include(d => d.CurrentStatus)
                    .FirstOrDefaultAsync(d => d.Id == moveToStatusDto.DocumentId);
                
                var targetStatus = await _context.Status
                    .FirstOrDefaultAsync(s => s.Id == moveToStatusDto.TargetStatusId);
        
                Console.WriteLine($"Attempting to move document from status '{document?.CurrentStatus?.Title}' to '{targetStatus?.Title}'");
                Console.WriteLine($"Target status IsFlexible: {targetStatus?.IsFlexible}");
        
                // Check if we can make this transition
                bool canMove = await _workflowService.CanMoveToStatusAsync(
                    moveToStatusDto.DocumentId, 
                    moveToStatusDto.TargetStatusId);
                
                Console.WriteLine($"CanMoveToStatusAsync result: {canMove}");
                
                if (!canMove)
                    return BadRequest("This status transition is not allowed in the current workflow.");
                
                // Find the step needed for this transition
                var step = await _context.Steps
                    .FirstOrDefaultAsync(s => 
                        s.CircuitId == document.CircuitId &&
                        s.CurrentStatusId == document.CurrentStatusId &&
                        s.NextStatusId == moveToStatusDto.TargetStatusId);
                        
                if (step == null)
                    return BadRequest("No valid step found for this transition.");
                    
                // Check if step requires approval
                if (step.RequiresApproval)
                {
                    // Initiate approval process
                    var (requiresApproval, approvalWritingId) = await _workflowService.InitiateApprovalIfRequiredAsync(
                        moveToStatusDto.DocumentId, step.Id, userId, moveToStatusDto.Comments);
                        
                    if (requiresApproval)
                    {
                        var approvalWriting = await _context.ApprovalWritings.FindAsync(approvalWritingId);
                        if (approvalWriting == null || approvalWriting.Status != ApprovalStatus.Accepted)
                        {
                            // Approval needed but not yet granted
                            return Ok(new { 
                                message = "This step requires approval. An approval request has been initiated.",
                                requiresApproval = true,
                                approvalId = approvalWritingId
                            });
                        }
                    }
                }
                
                // Approval is not required or has been granted, so proceed with the status transition
                var success = await _workflowService.MoveToNextStatusAsync(
                    moveToStatusDto.DocumentId,
                    moveToStatusDto.TargetStatusId,
                    userId,
                    moveToStatusDto.Comments);
        
                if (success)
                {
                    Console.WriteLine("Document status updated successfully");
                    return Ok(new { message = "Document status updated successfully." });
                }
                else
                {
                    Console.WriteLine("Failed to update document status");
                    return BadRequest("Failed to update document status.");
                }
            }
            catch (KeyNotFoundException ex)
            {
                Console.WriteLine($"KeyNotFoundException: {ex.Message}");
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                Console.WriteLine($"InvalidOperationException: {ex.Message}");
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception in MoveToStatus: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpPost("return-to-status")]
        public async Task<IActionResult> ReturnToStatus([FromBody] MoveToStatusDto returnDto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized("User ID claim is missing.");

            int userId = int.Parse(userIdClaim);
            var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return BadRequest("User not found.");

            if (!user.IsActive)
                return Unauthorized("User account is deactivated. Please contact un admin!");

            if (user.Role!.RoleName != "Admin" && user.Role!.RoleName != "FullUser")
                return Unauthorized("User not allowed to do action.");

            try
            {
                var success = await _workflowService.ReturnToPreviousStatusAsync(
                    returnDto.DocumentId,
                    returnDto.TargetStatusId,
                    userId,
                    returnDto.Comments);

                if (success)
                    return Ok("Document returned to status successfully.");
                else
                    return BadRequest("Failed to return document to status.");
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpPost("return-to-previous")]
        public async Task<IActionResult> ReturnToPreviousStatus([FromBody] ReturnToPreviousStatusDto returnDto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized("User ID claim is missing.");

            int userId = int.Parse(userIdClaim);
            var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return BadRequest("User not found.");

            if (!user.IsActive)
                return Unauthorized("User account is deactivated. Please contact an admin!");

            if (user.Role!.RoleName != "Admin" && user.Role!.RoleName != "FullUser")
                return Unauthorized("User not allowed to perform this action.");

            try
            {
                var success = await _workflowService.ReturnToPreviousStatusAsync(
                    returnDto.DocumentId,
                    userId,
                    returnDto.Comments);

                if (success)
                    return Ok("Document returned to previous status successfully.");
                else
                    return BadRequest("Failed to return document to previous status.");
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpPost("complete-status")]
        public async Task<IActionResult> CompleteDocumentStatus([FromBody] CompleteStatusDto completeStatusDto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized("User ID claim is missing.");

            int userId = int.Parse(userIdClaim);
            var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return BadRequest("User not found.");

            if (!user.IsActive)
                return Unauthorized("User account is deactivated. Please contact un admin!");

            try
            {
                var success = await _workflowService.CompleteDocumentStatusAsync(
                    completeStatusDto.DocumentId,
                    completeStatusDto.StatusId,
                    userId,
                    completeStatusDto.IsComplete,
                    completeStatusDto.Comments);

                if (success)
                    return Ok("Document status updated successfully.");
                else
                    return BadRequest("Failed to update document status.");
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpGet("document/{documentId}/current-status")]
        public async Task<ActionResult<DocumentCurrentStatusDto>> GetDocumentCurrentStatus(int documentId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized("User ID claim is missing.");

            int userId = int.Parse(userIdClaim);
            var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return BadRequest("User not found.");

            if (!user.IsActive)
                return Unauthorized("User account is deactivated. Please contact an admin!");

            try
            {
                // Get the document and its current status
                var document = await _context.Documents
                    .Include(d => d.CurrentStatus)
                    .Include(d => d.CurrentStep)
                    .Include(d => d.Circuit)
                    .FirstOrDefaultAsync(d => d.Id == documentId);

                if (document == null)
                    return NotFound("Document not found.");

                // Create the response object
                var response = new DocumentCurrentStatusDto
                {
                    DocumentId = document.Id,
                    DocumentKey = document.DocumentKey,
                    Title = document.Title,
                    Status = document.Status,
                    StatusText = GetStatusText(document.Status),
                    CircuitId = document.CircuitId,
                    CircuitTitle = document.Circuit?.Title,
                    CurrentStatusId = document.CurrentStatusId,
                    CurrentStatusTitle = document.CurrentStatus?.Title,
                    CurrentStepId = document.CurrentStepId,
                    CurrentStepTitle = document.CurrentStep?.Title,
                    IsCircuitCompleted = document.IsCircuitCompleted,
                    LastUpdated = document.UpdatedAt
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpGet("document/{documentId}/available-transitions")]
        public async Task<ActionResult<IEnumerable<StatusDto>>> GetAvailableTransitions(int documentId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized("User ID claim is missing.");

            int userId = int.Parse(userIdClaim);
            var user = await _context.Users.Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return BadRequest("User not found.");

            if (!user.IsActive)
                return Unauthorized("User account is deactivated. Please contact un admin!");

            try
            {
                var transitions = await _workflowService.GetAvailableTransitionsAsync(documentId);
                return Ok(transitions);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpGet("document/{documentId}/document-statuses")]
        public async Task<ActionResult<IEnumerable<DocumentStatusDto>>> GetDocumentStatuses(int documentId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized("User ID claim is missing.");

            int userId = int.Parse(userIdClaim);
            var user = await _context.Users.Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return BadRequest("User not found.");

            if (!user.IsActive)
                return Unauthorized("User account is deactivated. Please contact un admin!");

            // Get the document and check if it has a current status
            var document = await _context.Documents
                .Include(d => d.Circuit)
                .FirstOrDefaultAsync(d => d.Id == documentId);

            if (document == null)
                return NotFound("Document not found.");

            if (document.CircuitId == null)
                return NotFound("Document is not assigned to any circuit.");

            // Get statuses for the document's circuit with completion info for this document
            var statuses = await _context.Status
                .Where(s => s.CircuitId == document.CircuitId)
                .OrderBy(s => s.Id)
                .Select(s => new
                {
                    Status = s,
                    DocumentStatus = _context.DocumentStatus
                        .FirstOrDefault(ds => ds.DocumentId == documentId && ds.StatusId == s.Id)
                })
                .ToListAsync();

            var statusDtos = statuses.Select(item => new DocumentStatusDto
            {
                StatusId = item.Status.Id,
                Title = item.Status.Title,
                IsRequired = item.Status.IsRequired,
                IsComplete = item.DocumentStatus?.IsComplete ?? false,
                CompletedBy = item.DocumentStatus != null && item.DocumentStatus.CompletedByUserId.HasValue
                    ? _context.Users
                        .Where(u => u.Id == item.DocumentStatus.CompletedByUserId.Value)
                        .Select(u => u.Username)
                        .FirstOrDefault()
                    : null,
                CompletedAt = item.DocumentStatus?.CompletedAt
            }).ToList();

            return Ok(statusDtos);
        }

        [HttpGet("document/{documentId}/step-statuses")]
        public async Task<ActionResult<IEnumerable<DocumentStepStatusDto>>> GetDocumentStepStatuses(int documentId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized("User ID claim is missing.");

            int userId = int.Parse(userIdClaim);
            var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return BadRequest("User not found.");

            if (!user.IsActive)
                return Unauthorized("User account is deactivated. Please contact an admin!");

            try
            {
                // Get the document and verify it has a circuit
                var document = await _context.Documents
                    .Include(d => d.Circuit)
                    .Include(d => d.CurrentStatus)
                    .Include(d => d.CurrentStep)
                    .FirstOrDefaultAsync(d => d.Id == documentId);

                if (document == null)
                    return NotFound("Document not found.");

                if (document.CircuitId == null)
                    return BadRequest("Document is not assigned to any circuit.");

                // Get all steps in the circuit
                var steps = await _context.Steps
                    .Include(s => s.CurrentStatus)
                    .Include(s => s.NextStatus)
                    .Where(s => s.CircuitId == document.CircuitId)
                    .OrderBy(s => s.Id)
                    .ToListAsync();

                if (!steps.Any())
                    return Ok(new List<DocumentStepStatusDto>()); // Return empty list if no steps

                // Get document step history to determine completed steps
                var stepHistory = await _context.DocumentStepHistory
                    .Include(h => h.User)
                    .Where(h => h.DocumentId == documentId)
                    .OrderByDescending(h => h.TransitionDate)
                    .ToListAsync();

                var result = new List<DocumentStepStatusDto>();

                foreach (var step in steps)
                {
                    // Determine if this step is completed
                    var stepCompletion = stepHistory.FirstOrDefault(h => h.StepId == step.Id);

                    // Check if this is the current step
                    bool isCurrentStep = document.CurrentStepId == step.Id;

                    // Check if step is completed
                    // A step is considered completed if:
                    // 1. It has a record in history AND
                    // 2. Either it's not the current step OR the document has moved beyond this step's status
                    bool isCompleted = stepCompletion != null && 
                        (!isCurrentStep || 
                         (document.CurrentStatusId != null && document.CurrentStatusId != step.CurrentStatusId));

                    var stepStatus = new DocumentStepStatusDto
                    {
                        StepId = step.Id,
                        StepKey = step.StepKey,
                        Title = step.Title,
                        Description = step.Descriptif,
                        CurrentStatusId = step.CurrentStatusId,
                        CurrentStatusTitle = step.CurrentStatus?.Title ?? "Unknown",
                        NextStatusId = step.NextStatusId,
                        NextStatusTitle = step.NextStatus?.Title ?? "Unknown",
                        IsCurrentStep = isCurrentStep,
                        IsCompleted = isCompleted,
                        CompletedAt = stepCompletion?.TransitionDate,
                        CompletedBy = stepCompletion?.User?.Username
                    };

                    result.Add(stepStatus);
                }

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpGet("document/{documentId}/history")]
        public async Task<ActionResult<IEnumerable<DocumentHistoryDto>>> GetDocumentHistory(int documentId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized("User ID claim is missing.");

            int userId = int.Parse(userIdClaim);
            var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return BadRequest("User not found.");

            if (!user.IsActive)
                return Unauthorized("User account is deactivated. Please contact un admin!");

            try
            {
                var history = await _context.DocumentCircuitHistory
                    .Where(h => h.DocumentId == documentId)
                    .Include(h => h.Step)
                    .Include(h => h.ProcessedBy)
                    .Include(h => h.Action)
                    .Include(h => h.Status)
                    .OrderByDescending(h => h.ProcessedAt)
                    .ToListAsync();

                var historyDtos = history.Select(h => new DocumentHistoryDto
                {
                    Id = h.Id,
                    StepTitle = h.Step?.Title ?? "N/A",
                    ActionTitle = h.Action?.Title ?? "N/A",
                    StatusTitle = h.Status?.Title ?? "N/A",
                    ProcessedBy = h.ProcessedBy?.Username ?? "System",
                    ProcessedAt = h.ProcessedAt,
                    Comments = h.Comments,
                    IsApproved = h.IsApproved
                }).ToList();

                return Ok(historyDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpGet("document/{documentId}/next-statuses")]
        public async Task<ActionResult<IEnumerable<StatusDto>>> GetNextPossibleStatuses(int documentId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized("User ID claim is missing.");

            int userId = int.Parse(userIdClaim);
            var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return BadRequest("User not found.");

            if (!user.IsActive)
                return Unauthorized("User account is deactivated. Please contact an admin!");

            try
            {
                // Step 1: Get the document and verify it has a current status and is assigned to a circuit
                var document = await _context.Documents
                    .Include(d => d.CurrentStatus)
                    .FirstOrDefaultAsync(d => d.Id == documentId);

                if (document == null)
                    return NotFound("Document not found.");

                if (document.CircuitId == null)
                    return BadRequest("Document is not assigned to any circuit.");

                if (document.CurrentStatusId == null)
                    return BadRequest("Document does not have a current status.");

                // Step 2: Find all steps in the circuit where the currentStatus matches the document's status
                var matchingSteps = await _context.Steps
                    .Include(s => s.NextStatus)
                    .Where(s => s.CircuitId == document.CircuitId && s.CurrentStatusId == document.CurrentStatusId)
                    .ToListAsync();

                if (!matchingSteps.Any())
                    return Ok(new List<StatusDto>()); // No next statuses available

                // Step 3: Extract the next statuses from the matching steps
                var nextStatusIds = matchingSteps.Select(s => s.NextStatusId).Distinct().ToList();

                var nextStatuses = await _context.Status
                    .Where(s => nextStatusIds.Contains(s.Id))
                    .Select(s => new StatusDto
                    {
                        StatusId = s.Id,
                        StatusKey = s.StatusKey,
                        Title = s.Title,
                        Description = s.Description,
                        IsRequired = s.IsRequired,
                        IsInitial = s.IsInitial,
                        IsFinal = s.IsFinal,
                        IsFlexible = s.IsFlexible,
                        CircuitId = s.CircuitId
                    })
                    .ToListAsync();

                return Ok(nextStatuses);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpGet("document/{documentId}/workflow-status")]
        public async Task<ActionResult<DocumentWorkflowStatusDto>> GetDocumentWorkflowStatus(int documentId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized("User ID claim is missing.");

            int userId = int.Parse(userIdClaim);
            var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return BadRequest("User not found.");

            if (!user.IsActive)
                return Unauthorized("User account is deactivated. Please contact un admin!");

            try
            {
                var workflowStatus = await _workflowService.GetDocumentWorkflowStatusAsync(documentId);
                return Ok(workflowStatus);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpGet("pending-documents")]
        public async Task<ActionResult<IEnumerable<PendingDocumentDto>>> GetPendingDocuments()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized("User ID claim is missing.");

            int userId = int.Parse(userIdClaim);
            var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return BadRequest("User not found.");

            if (!user.IsActive)
                return Unauthorized("User account is deactivated. Please contact un admin!");

            try
            {
                // Get documents that are:
                // 1. Assigned to a circuit
                // 2. Not completed
                // 3. Current status is assigned to user's role (if role assignment is enabled)
                var pendingQuery = _context.Documents
                    .Include(d => d.Circuit)
                    .Include(d => d.CurrentStatus)
                    .Include(d => d.CreatedBy)
                    .Where(d =>
                        d.CircuitId.HasValue &&
                        !d.IsCircuitCompleted &&
                        d.Status == 1 && // In Progress
                        d.CurrentStatusId.HasValue);

                var pendingDocuments = await pendingQuery.ToListAsync();

                var pendingDtos = pendingDocuments.Select(d => new PendingDocumentDto
                {
                    DocumentId = d.Id,
                    DocumentKey = d.DocumentKey,
                    Title = d.Title,
                    CreatedBy = d.CreatedBy?.Username ?? "Unknown",
                    CreatedAt = d.CreatedAt,
                    CircuitId = d.CircuitId!.Value,
                    CircuitTitle = d.Circuit?.Title ?? "Unknown",
                    CurrentStatusId = d.CurrentStatusId!.Value,
                    CurrentStatusTitle = d.CurrentStatus?.Title ?? "Unknown",
                    DaysInCurrentStatus = (int)(DateTime.UtcNow - d.UpdatedAt).TotalDays
                }).ToList();

                return Ok(pendingDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        [HttpPost("reinitialize-workflow")]
        public async Task<IActionResult> ReinitializeWorkflow([FromBody] ReinitializeWorkflowDto reinitializeDto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized("User ID claim is missing.");

            int userId = int.Parse(userIdClaim);
            var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return BadRequest("User not found.");

            if (!user.IsActive)
                return Unauthorized("User account is deactivated. Please contact an admin!");

            // Only allow Admin users to reinitialize workflows
            if (user.Role!.RoleName != "Admin")
                return Unauthorized("Only administrators are allowed to reinitialize document workflows.");

            try
            {
                var success = await _workflowService.ReinitializeWorkflowAsync(
                    reinitializeDto.DocumentId,
                    userId,
                    reinitializeDto.Comments);

                if (success)
                    return Ok("Document workflow reinitialized successfully.");
                else
                    return BadRequest("Failed to reinitialize document workflow.");
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }

        private string GetStatusText(int status)
        {
            return status switch
            {
                0 => "Draft",
                1 => "In Progress",
                2 => "Completed",
                3 => "Rejected",
                _ => "Unknown"
            };
        }
    }
}