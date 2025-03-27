using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DocManagementBackend.Data;
using DocManagementBackend.Models;

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
        public async Task<ActionResult<IEnumerable<CircuitDetail>>> GetCircuitDetails()
        {
            return await _context.CircuitDetails
                .Include(cd => cd.Circuit)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CircuitDetail>> GetCircuitDetail(int id)
        {
            var detail = await _context.CircuitDetails
                .Include(cd => cd.Circuit)
                .FirstOrDefaultAsync(cd => cd.Id == id);
            if (detail == null)
                return NotFound("Circuit detail not found.");
            return Ok(detail);
        }

        [HttpGet("by-circuit/{circuitId}")]
        public async Task<ActionResult<IEnumerable<CircuitDetail>>> GetCircuitDetailsByCircuitId(int circuitId)
        {
            var details = await _context.CircuitDetails
                .Where(cd => cd.CircuitId == circuitId)
                .Include(cd => cd.Circuit)
                .ToListAsync();
            return Ok(details);
        }

        [HttpPost]
        public async Task<ActionResult<CircuitDetail>> CreateCircuitDetail([FromBody] CircuitDetail detail)
        {
            var circuit = await _context.Circuits.FindAsync(detail.CircuitId);
            if (circuit == null)
                return BadRequest("Invalid CircuitId. Circuit not found.");
            circuit.CrdCounter++;
            int counterValue = circuit.CrdCounter;
            string paddedCounter = counterValue.ToString("D2");
            detail.CircuitDetailKey = $"{circuit.CircuitKey}-Crd{paddedCounter}";
            _context.CircuitDetails.Add(detail);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetCircuitDetail), new { id = detail.Id }, detail);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCircuitDetail(int id, [FromBody] CircuitDetail detail)
        {
            if (id != detail.Id)
                return BadRequest("CircuitDetail ID mismatch.");

            _context.Entry(detail).State = EntityState.Modified;
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
            return Ok("Updated successefully.");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCircuitDetail(int id)
        {
            var detail = await _context.CircuitDetails.FindAsync(id);
            if (detail == null)
                return NotFound("Circuit detail not found.");
            _context.CircuitDetails.Remove(detail);
            await _context.SaveChangesAsync();
            return Ok("Deleted!");
        }
    }
}
