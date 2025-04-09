using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DocManagementBackend.Data;
using DocManagementBackend.Models;
using System.Security.Claims;

namespace DocManagementBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CircuitController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CircuitController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CircuitDto>>> GetCircuits()
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
            var circuits = await _context.Circuits
                .Include(c => c.CircuitDetails)
                    .ThenInclude(cd => cd.ResponsibleRole)
                .ToListAsync();

            var circuitDtos = circuits.Select(c => new CircuitDto
            {
                Id = c.Id,
                CircuitKey = c.CircuitKey,
                Title = c.Title,
                Descriptif = c.Descriptif,
                IsActive = c.IsActive,
                CrdCounter = c.CrdCounter,
                HasOrderedFlow = c.HasOrderedFlow,
                CircuitDetails = c.CircuitDetails.Select(cd => new CircuitDetailDto
                {
                    Id = cd.Id,
                    CircuitDetailKey = cd.CircuitDetailKey,
                    CircuitId = cd.CircuitId,
                    Title = cd.Title,
                    Descriptif = cd.Descriptif,
                    OrderIndex = cd.OrderIndex,
                    ResponsibleRoleId = cd.ResponsibleRoleId,
                    // ResponsibleRoleName = cd.ResponsibleRole?.RoleName
                }).ToList()
            }).ToList();

            return Ok(circuitDtos);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Circuit>> GetCircuit(int id)
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
            var circuit = await _context.Circuits.FindAsync(id);
            if (circuit == null)
                return NotFound("Circuit not found.");
            return Ok(circuit);
        }

        [HttpPost]
        public async Task<ActionResult<Circuit>> CreateCircuit([FromBody] Circuit circuit)
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
            var ctCounter = await _context.TypeCounter.FirstOrDefaultAsync();
            if (ctCounter == null) { ctCounter = new TypeCounter { circuitCounter = 1 }; _context.TypeCounter.Add(ctCounter); }
            else {ctCounter.circuitCounter++;}
            int counterValue = ctCounter.circuitCounter;
            string paddedCounter = counterValue.ToString("D2");
            circuit.CircuitKey = $"Cr{paddedCounter}";
            _context.Circuits.Add(circuit);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetCircuit), new { id = circuit.Id }, circuit);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCircuit(int id, [FromBody] Circuit circuit)
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
            if (id != circuit.Id)
                return BadRequest("Circuit ID mismatch.");

            _context.Entry(circuit).State = EntityState.Modified;
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Circuits.Any(e => e.Id == id))
                    return NotFound("Circuit not found.");
                else
                    throw;
            }
            return Ok("Updated successfully");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCircuit(int id)
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
            var circuit = await _context.Circuits.FindAsync(id);
            if (circuit == null)
                return NotFound("Circuit not found.");

            _context.Circuits.Remove(circuit);
            await _context.SaveChangesAsync();
            return Ok("Circuit deleted!");
        }
    }
}
