using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DocManagementBackend.Data;
using DocManagementBackend.Models;
using System.Security.Claims;
using DocManagementBackend.Mappings;
// using DocManagementBackend.Utils;

namespace DocManagementBackend.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class CircuitProcessingController : ControllerBase
    {
        private readonly CircuitProcessingService _circuitService;
        private readonly ApplicationDbContext _context;

        public CircuitProcessingController(CircuitProcessingService circuitService, ApplicationDbContext context)
        {
            _circuitService = circuitService;
            _context = context;
        }

        [HttpPost("assign")]
        public async Task<IActionResult> AssignDocumentToCircuit([FromBody] AssignCircuitRequest request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized("User ID claim is missing.");
            int userId = int.Parse(userIdClaim);
            var ThisUser = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId);
            if (ThisUser == null)
                return BadRequest("User not found.");
            if (!ThisUser.IsActive)
                return Unauthorized("User account is deactivated.");
            if (ThisUser.Role!.RoleName != "Admin" && ThisUser.Role!.RoleName != "FullUser")
                return Unauthorized("User Not Allowed To do this action...!");

            var success = await _circuitService.AssignDocumentToCircuit(
                request.DocumentId, request.CircuitId, userId);

            if (!success)
                return BadRequest("Failed to assign document to circuit.");

            return Ok("Document assigned to circuit successfully.");
        }

        [HttpPost("process")]
        public async Task<IActionResult> ProcessCircuitStep([FromBody] ProcessCircuitRequest request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized("User ID claim is missing.");
            int userId = int.Parse(userIdClaim);
            var ThisUser = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId);
            if (ThisUser == null)
                return BadRequest("User not found.");
            if (!ThisUser.IsActive)
                return Unauthorized("User account is deactivated.");
            if (ThisUser.Role!.RoleName != "Admin" && ThisUser.Role!.RoleName != "FullUser")
                return Unauthorized("User Not Allowed To do this action...!");

            // Check if the user has the right to process this step
            var document = await _context.Documents
                .Include(d => d.CurrentCircuitDetail)
                .FirstOrDefaultAsync(d => d.Id == request.DocumentId);

            if (document == null || document.CurrentCircuitDetailId == null)
                return NotFound("Document or circuit detail not found.");

            // Here you could add logic to check if the user is authorized for this step
            // For example, check if their role matches the ResponsibleRoleId

            var success = await _circuitService.ProcessCircuitStep(
                request.DocumentId, userId, request.IsApproved, request.Comments);

            if (!success)
                return BadRequest("Failed to process circuit step.");

            return Ok("Circuit step processed successfully.");
        }

        [HttpGet("history/{documentId}")]
        public async Task<ActionResult<IEnumerable<DocumentCircuitHistoryDto>>> GetDocumentCircuitHistory(int documentId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized("User ID claim is missing.");
            int userId = int.Parse(userIdClaim);
            var ThisUser = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId);
            if (ThisUser == null)
                return BadRequest("User not found.");
            if (!ThisUser.IsActive)
                return Unauthorized("User account is deactivated.");
            var history = await _circuitService.GetDocumentCircuitHistory(documentId);
            var historyDtos = history.Select(h => new DocumentCircuitHistoryDto
            {
                Id = h.Id,
                CircuitDetailTitle = h.CircuitDetail?.Title ?? "",
                ProcessedBy = h.ProcessedBy?.Username ?? "",
                ProcessedAt = h.ProcessedAt,
                Comments = h.Comments,
                IsApproved = h.IsApproved
            });

            return Ok(historyDtos);
        }

        [HttpGet("pending")]
        public async Task<ActionResult<IEnumerable<DocumentDto>>> GetPendingDocuments()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
                return Unauthorized("User ID claim is missing.");
            int userId = int.Parse(userIdClaim);
            // var ThisUser = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId);
            var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
                return BadRequest("User not found.");
            if (!user.IsActive)
                return Unauthorized("User account is deactivated.");

            // Get documents pending for this user's role
            var pendingDocuments = await _context.Documents
                .Where(d =>
                    !d.IsCircuitCompleted &&
                    d.CurrentCircuitDetail != null &&
                    d.CurrentCircuitDetail.ResponsibleRoleId == user.RoleId)
                .Include(d => d.CreatedBy)
                .Include(d => d.DocumentType)
                .Include(d => d.Circuit)
                .Include(d => d.CurrentCircuitDetail)
                .Select(DocumentMappings.ToDocumentDto)
                .ToListAsync();

            return Ok(pendingDocuments);
        }
    }
}