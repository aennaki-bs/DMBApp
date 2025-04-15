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
    public class CircuitController : ControllerBase
    {
        private readonly CircuitManagementService _circuitService;
        private readonly ApplicationDbContext _context;

        public CircuitController(CircuitManagementService circuitService, ApplicationDbContext context)
        {
            _circuitService = circuitService;
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CircuitDto>>> GetCircuits()
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

            var circuits = await _context.Circuits
                .Include(c => c.Steps.OrderBy(cd => cd.OrderIndex))
                .ToListAsync();

            var circuitDtos = circuits.Select(c => new CircuitDto
            {
                Id = c.Id,
                CircuitKey = c.CircuitKey,
                Title = c.Title,
                Descriptif = c.Descriptif,
                IsActive = c.IsActive,
                HasOrderedFlow = c.HasOrderedFlow,
                AllowBacktrack = c.AllowBacktrack,
                Steps = c.Steps.Select(cd => new StepDto
                {
                    Id = cd.Id,
                    StepKey = cd.StepKey,
                    CircuitId = cd.CircuitId,
                    Title = cd.Title,
                    Descriptif = cd.Descriptif,
                    OrderIndex = cd.OrderIndex,
                    ResponsibleRoleId = cd.ResponsibleRoleId,
                    IsFinalStep = cd.IsFinalStep
                }).ToList()
            }).ToList();

            return Ok(circuitDtos);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CircuitDto>> GetCircuit(int id)
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

            var circuit = await _context.Circuits
                .Include(c => c.Steps.OrderBy(cd => cd.OrderIndex))
                .FirstOrDefaultAsync(c => c.Id == id);

            if (circuit == null)
                return NotFound("Circuit not found.");

            var circuitDto = new CircuitDto
            {
                Id = circuit.Id,
                CircuitKey = circuit.CircuitKey,
                Title = circuit.Title,
                Descriptif = circuit.Descriptif,
                IsActive = circuit.IsActive,
                HasOrderedFlow = circuit.HasOrderedFlow,
                AllowBacktrack = circuit.AllowBacktrack,
                Steps = circuit.Steps.Select(cd => new StepDto
                {
                    Id = cd.Id,
                    StepKey = cd.StepKey,
                    CircuitId = cd.CircuitId,
                    Title = cd.Title,
                    Descriptif = cd.Descriptif,
                    OrderIndex = cd.OrderIndex,
                    ResponsibleRoleId = cd.ResponsibleRoleId,
                    IsFinalStep = cd.IsFinalStep
                }).ToList()
            };

            return Ok(circuitDto);
        }

        [HttpPost]
        public async Task<ActionResult<CircuitDto>> CreateCircuit([FromBody] CreateCircuitDto createCircuitDto)
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
                return Unauthorized("User not allowed to create circuits.");

            Console.WriteLine($"is active value ========> {createCircuitDto.IsActive}");

            var circuit = new Circuit
            {
                Title = createCircuitDto.Title,
                Descriptif = createCircuitDto.Descriptif,
                HasOrderedFlow = createCircuitDto.HasOrderedFlow,
                AllowBacktrack = createCircuitDto.AllowBacktrack,
                IsActive = createCircuitDto.IsActive
            };

            try
            {
                Console.WriteLine($"is active value circuit ========> {circuit.IsActive}");
                var createdCircuit = await _circuitService.CreateCircuitAsync(circuit);
                Console.WriteLine($"is active value circuit ========> {createdCircuit.IsActive}");

                return CreatedAtAction(nameof(GetCircuit), new { id = createdCircuit.Id }, new CircuitDto
                {
                    Id = createdCircuit.Id,
                    CircuitKey = createdCircuit.CircuitKey,
                    Title = createdCircuit.Title,
                    Descriptif = createdCircuit.Descriptif,
                    IsActive = createdCircuit.IsActive,
                    HasOrderedFlow = createdCircuit.HasOrderedFlow,
                    AllowBacktrack = createdCircuit.AllowBacktrack,
                    Steps = new List<StepDto>()
                });
            }
            catch (Exception ex)
            {
                return BadRequest($"Error creating circuit: {ex.Message}");
            }
        }

        [HttpPost("{circuitId}/steps")]
        public async Task<ActionResult<StepDto>> AddStepToCircuit(int circuitId, [FromBody] CreateStepDto createStepDto)
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
                return Unauthorized("User not allowed to modify circuits.");

            var step = new Step
            {
                CircuitId = circuitId,
                Title = createStepDto.Title,
                Descriptif = createStepDto.Descriptif,
                ResponsibleRoleId = createStepDto.ResponsibleRoleId,
                OrderIndex = createStepDto.OrderIndex
            };

            try
            {
                var createdStep = await _circuitService.AddStepToCircuitAsync(step);

                return CreatedAtAction(nameof(GetCircuit), new { id = circuitId }, new StepDto
                {
                    Id = createdStep.Id,
                    StepKey = createdStep.StepKey,
                    CircuitId = createdStep.CircuitId,
                    Title = createdStep.Title,
                    Descriptif = createdStep.Descriptif,
                    OrderIndex = createdStep.OrderIndex,
                    ResponsibleRoleId = createdStep.ResponsibleRoleId,
                    IsFinalStep = createdStep.IsFinalStep
                });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error adding step: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCircuit(int id, [FromBody] CreateCircuitDto updateCircuitDto)
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
                return Unauthorized("User not allowed to modify circuits.");

            var circuit = await _context.Circuits.FindAsync(id);
            if (circuit == null)
                return NotFound("Circuit not found.");

            circuit.Title = updateCircuitDto.Title;
            circuit.Descriptif = updateCircuitDto.Descriptif;
            circuit.HasOrderedFlow = updateCircuitDto.HasOrderedFlow;
            circuit.AllowBacktrack = updateCircuitDto.AllowBacktrack;
            circuit.IsActive = updateCircuitDto.IsActive;

            try
            {
                await _context.SaveChangesAsync();
                return Ok("Circuit updated successfully.");
            }
            catch (Exception ex)
            {
                return BadRequest($"Error updating circuit: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCircuit(int id)
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
                return Unauthorized("User not allowed to delete circuits.");

            var circuit = await _context.Circuits.FindAsync(id);
            if (circuit == null)
                return NotFound("Circuit not found.");

            // Check if circuit is in use by documents
            var inUse = await _context.Documents.AnyAsync(d => d.CircuitId == id);
            if (inUse)
                return BadRequest("Cannot delete circuit that is in use by documents.");

            _context.Circuits.Remove(circuit);
            await _context.SaveChangesAsync();

            return Ok("Circuit deleted successfully.");
        }
    }
}