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

        public WorkflowController(DocumentWorkflowService workflowService, ApplicationDbContext context)
        {
            _workflowService = workflowService;
            _context = context;
        }

        [HttpPost("assign-circuit")]
        public async Task<IActionResult> AssignDocumentToCircuit([FromBody] AssignCircuitDto assignCircuitDto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized("User ID claim is missing.");

            int userId = int.Parse(userIdClaim);
            var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return BadRequest("User not found.");

            if (!user.IsActive)
                return Unauthorized("User account is deactivated.");

            if (user.Role!.RoleName != "Admin" && user.Role!.RoleName != "FullUser")
                return Unauthorized("User not allowed to assign documents to circuits.");

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
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized("User ID claim is missing.");

            int userId = int.Parse(userIdClaim);
            var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return BadRequest("User not found.");

            if (!user.IsActive)
                return Unauthorized("User account is deactivated.");

            if (user.Role!.RoleName != "Admin" && user.Role!.RoleName != "FullUser")
                return Unauthorized("User not allowed to do this action.");

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

        [HttpPost("move-next")]
        public async Task<IActionResult> MoveToNextStep([FromBody] MoveNextDto moveNextDto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized("User ID claim is missing.");

            int userId = int.Parse(userIdClaim);
            var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return BadRequest("User not found.");

            if (!user.IsActive)
                return Unauthorized("User account is deactivated.");

            if (user.Role!.RoleName != "Admin" && user.Role!.RoleName != "FullUser")
                return Unauthorized("User not allowed to perform this action.");

            try
            {
                var success = await _workflowService.MoveToNextStepAsync(
                    moveNextDto.DocumentId,
                    moveNextDto.CurrentStepId,
                    moveNextDto.NextStepId,
                    userId,
                    moveNextDto.Comments);

                if (success)
                    return Ok("Document moved to next step successfully.");
                else
                    return BadRequest("Failed to move document to next step.");
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

        [HttpPost("return-to-previous")]
        public async Task<IActionResult> ReturnToPreviousStep([FromBody] ReturnToPreviousDto returnDto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized("User ID claim is missing.");

            int userId = int.Parse(userIdClaim);
            var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return BadRequest("User not found.");

            if (!user.IsActive)
                return Unauthorized("User account is deactivated.");

            if (user.Role!.RoleName != "Admin" && user.Role!.RoleName != "FullUser")
                return Unauthorized("User not allowed to do action.");

            try
            {
                var success = await _workflowService.ReturnToPreviousStepAsync(
                    returnDto.DocumentId, userId, returnDto.Comments);

                if (success)
                    return Ok("Document returned to previous step successfully.");
                else
                    return BadRequest("Failed to return document to previous step.");
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
                return Unauthorized("User account is deactivated.");

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

        [HttpGet("document/{documentId}/step-statuses")]
        public async Task<ActionResult<IEnumerable<DocumentStatusDto>>> GetDocumentStepStatuses(int documentId)
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
                return Unauthorized("User account is deactivated.");

            // Get the document and check if it has a current step
            var document = await _context.Documents
                .Include(d => d.CurrentStep)
                .FirstOrDefaultAsync(d => d.Id == documentId);

            if (document == null)
                return NotFound("Document not found.");

            if (document.CurrentStepId == null)
                return NotFound("Document is not currently in any workflow step.");

            // Get statuses for the current step with completion info for this document
            var statuses = await _context.Status
                .Where(s => s.StepId == document.CurrentStepId)
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
                return Unauthorized("User account is deactivated.");

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

        [HttpGet("document/{documentId}/current-status")]
        public async Task<ActionResult<DocumentWorkflowStatusDto>> GetDocumentCurrentStatus(int documentId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized("User ID claim is missing.");

            int userId = int.Parse(userIdClaim);
            var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId);

            if (user == null)
                return BadRequest("User not found.");

            if (!user.IsActive)
                return Unauthorized("User account is deactivated.");

            try
            {
                var document = await _context.Documents
                    .Include(d => d.Circuit)
                    .Include(d => d.CurrentStep)
                    .FirstOrDefaultAsync(d => d.Id == documentId);

                if (document == null)
                    return NotFound("Document not found.");

                // Get current step's statuses with completion info
                var statusesQuery = from s in _context.Status
                                    where s.StepId == document.CurrentStepId
                                    join ds in _context.DocumentStatus
                                      on new { StatusId = s.Id, DocumentId = document.Id }
                                      equals new { StatusId = ds.StatusId, DocumentId = ds.DocumentId } into dsGroup
                                    from ds in dsGroup.DefaultIfEmpty()
                                    select new DocumentStatusDto
                                    {
                                        StatusId = s.Id,
                                        Title = s.Title,
                                        IsRequired = s.IsRequired,
                                        IsComplete = ds != null && ds.IsComplete,
                                        CompletedBy = ds != null && ds.CompletedByUserId.HasValue
                                            ? _context.Users
                                                .Where(u => u.Id == ds.CompletedByUserId.Value)
                                                .Select(u => u.Username)
                                                .FirstOrDefault()
                                            : null,
                                        CompletedAt = ds != null ? ds.CompletedAt : null
                                    };

                var statuses = await statusesQuery.ToListAsync();

                // Get actions available for current step
                var actions = await _context.StepActions
                    .Where(sa => sa.StepId == document.CurrentStepId)
                    .Select(sa => new ActionDto
                    {
                        ActionId = sa.ActionId,
                        Title = sa.Action!.Title,
                        Description = sa.Action.Description!
                    })
                    .ToListAsync();

                // Check if all required statuses are complete
                var canAdvance = statuses
                    .Where(s => s.IsRequired)
                    .All(s => s.IsComplete);

                // Check if backtracking is allowed
                var currentStep = document.CurrentStep;
                var canReturn = document.Circuit!.AllowBacktrack &&
                                currentStep != null &&
                                currentStep.PrevStepId.HasValue;

                var statusDto = new DocumentWorkflowStatusDto
                {
                    DocumentId = document.Id,
                    DocumentTitle = document.Title,
                    CircuitId = document.Circuit?.Id,
                    CircuitTitle = document.Circuit!.Title,
                    CurrentStepId = document.CurrentStepId,
                    CurrentStepTitle = document.CurrentStep!.Title,
                    Status = document.Status,
                    StatusText = GetStatusText(document.Status),
                    IsCircuitCompleted = document.IsCircuitCompleted,
                    Statuses = statuses,
                    AvailableActions = actions,
                    CanAdvanceToNextStep = canAdvance,
                    CanReturnToPreviousStep = canReturn
                };

                return Ok(statusDto);
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
                return Unauthorized("User account is deactivated.");

            try
            {
                // Get documents that are:
                // 1. Assigned to a circuit
                // 2. Not completed
                // 3. Current step is assigned to user's role (if role assignment is enabled)
                var pendingQuery = _context.Documents
                    .Include(d => d.Circuit)
                    .Include(d => d.CurrentStep)
                    .Include(d => d.CreatedBy)
                    .Where(d =>
                        d.CircuitId.HasValue &&
                        !d.IsCircuitCompleted &&
                        d.Status == 1 && // In Progress
                        d.CurrentStepId.HasValue);

                // Add role-based filtering if step has role assignment
                if (user.RoleId > 0) // Or another appropriate condition
                {
                    // For the first error - ensure CurrentStep is not null before accessing its properties
                    pendingQuery = pendingQuery.Where(d =>
                        d.CurrentStep != null &&
                        (!d.CurrentStep.ResponsibleRoleId.HasValue ||
                         d.CurrentStep.ResponsibleRoleId == user.RoleId));
                }

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
                    CurrentStepId = d.CurrentStepId!.Value,
                    CurrentStepTitle = d.CurrentStep?.Title ?? "Unknown",
                    DaysInCurrentStep = (int)(DateTime.UtcNow - d.UpdatedAt).TotalDays
                }).ToList();

                return Ok(pendingDtos);
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