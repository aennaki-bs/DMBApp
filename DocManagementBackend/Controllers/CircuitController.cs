using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DocManagementBackend.Data;
using DocManagementBackend.Models;

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
        public async Task<ActionResult<IEnumerable<Circuit>>> GetCircuits()
        {
            return await _context.Circuits.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Circuit>> GetCircuit(int id)
        {
            var circuit = await _context.Circuits.FindAsync(id);
            if (circuit == null)
                return NotFound("Circuit not found.");
            return Ok(circuit);
        }

        [HttpPost]
        public async Task<ActionResult<Circuit>> CreateCircuit([FromBody] Circuit circuit)
        {
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
            var circuit = await _context.Circuits.FindAsync(id);
            if (circuit == null)
                return NotFound("Circuit not found.");

            _context.Circuits.Remove(circuit);
            await _context.SaveChangesAsync();
            return Ok("Circuit deleted!");
        }
    }
}
