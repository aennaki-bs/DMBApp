using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DocManagementBackend.Data;
using DocManagementBackend.Models;
using System.Security.Claims;

namespace DocManagementBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CircuitDetailController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CircuitDetailController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CircuitDetailDto>>> GetCircuitDetails()
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
            var details = await _context.CircuitDetails
                .Include(cd => cd.Circuit)
                .Include(cd => cd.ResponsibleRole)
                .ToListAsync();

            var detailDtos = details.Select(MapToDto).ToList();

            return Ok(detailDtos);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CircuitDetailDto>> GetCircuitDetail(int id)
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
            var detail = await _context.CircuitDetails
                .Include(cd => cd.Circuit)
                .Include(cd => cd.ResponsibleRole)
                .FirstOrDefaultAsync(cd => cd.Id == id);

            if (detail == null)
                return NotFound("Circuit detail not found.");

            return Ok(MapToDto(detail));
        }

        [HttpGet("by-circuit/{circuitId}")]
        public async Task<ActionResult<IEnumerable<CircuitDetailDto>>> GetCircuitDetailsByCircuitId(int circuitId)
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
            var details = await _context.CircuitDetails
                .Where(cd => cd.CircuitId == circuitId)
                .Include(cd => cd.Circuit)
                .Include(cd => cd.ResponsibleRole)
                .ToListAsync();

            var detailDtos = details.Select(MapToDto).ToList();

            return Ok(detailDtos);
        }

        [HttpPost]
        public async Task<ActionResult<CircuitDetailDto>> CreateCircuitDetail([FromBody] CreateCircuitDetailDto dto)
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
            var circuit = await _context.Circuits.FindAsync(dto.CircuitId);
            if (circuit == null)
                return BadRequest("Invalid CircuitId. Circuit not found.");

            circuit.CrdCounter++;
            int counterValue = circuit.CrdCounter;
            string paddedCounter = counterValue.ToString("D2");

            var detail = new CircuitDetail
            {
                CircuitId = dto.CircuitId,
                Title = dto.Title,
                Descriptif = dto.Descriptif ?? string.Empty,
                OrderIndex = dto.OrderIndex,
                ResponsibleRoleId = dto.ResponsibleRoleId,
                CircuitDetailKey = $"{circuit.CircuitKey}-Crd{paddedCounter}"
            };

            _context.CircuitDetails.Add(detail);
            await _context.SaveChangesAsync();

            // Reload detail with its relationships
            detail = await _context.CircuitDetails
                .Include(cd => cd.Circuit)
                .Include(cd => cd.ResponsibleRole)
                .FirstOrDefaultAsync(cd => cd.Id == detail.Id);

            return CreatedAtAction(nameof(GetCircuitDetail), new { id = detail!.Id }, MapToDto(detail));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCircuitDetail(int id, [FromBody] CreateCircuitDetailDto dto)
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
            var detail = await _context.CircuitDetails.FindAsync(id);
            if (detail == null)
                return NotFound("Circuit detail not found.");

            // Don't change the CircuitId as it would require changing the key
            detail.Title = dto.Title;
            detail.Descriptif = dto.Descriptif ?? detail.Descriptif;
            detail.OrderIndex = dto.OrderIndex;
            detail.ResponsibleRoleId = dto.ResponsibleRoleId;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.CircuitDetails.Any(cd => cd.Id == id))
                    return NotFound("Circuit detail not found.");
                else
                    throw;
            }

            return Ok("Updated successfully.");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCircuitDetail(int id)
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
            var detail = await _context.CircuitDetails.FindAsync(id);
            if (detail == null)
                return NotFound("Circuit detail not found.");

            _context.CircuitDetails.Remove(detail);
            await _context.SaveChangesAsync();

            return Ok("Deleted!");
        }

        // Helper method to map entity to DTO
        private CircuitDetailDto MapToDto(CircuitDetail detail)
        {
            return new CircuitDetailDto
            {
                Id = detail.Id,
                CircuitDetailKey = detail.CircuitDetailKey,
                CircuitId = detail.CircuitId,
                Title = detail.Title,
                Descriptif = detail.Descriptif,
                OrderIndex = detail.OrderIndex,
                ResponsibleRoleId = detail.ResponsibleRoleId,
                CreatedAt = DateTime.UtcNow, // Adjust if your entity has CreatedAt properties
                UpdatedAt = DateTime.UtcNow,
                Circuit = detail.Circuit == null ? null : new CircuitSummaryDto
                {
                    Id = detail.Circuit.Id,
                    CircuitKey = detail.Circuit.CircuitKey,
                    Title = detail.Circuit.Title,
                    IsActive = detail.Circuit.IsActive
                }
            };
        }
    }
}