using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DocManagementBackend.Data;
using DocManagementBackend.Models;
using System.Security.Claims;
using System.Threading.Tasks;

namespace DocManagementBackend.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class SousLignesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SousLignesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/SousLignes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SousLigne>>> GetSousLignes()
        {
            return await _context.SousLignes
                .Include(s => s.Ligne)
                .ToListAsync();
        }

        // GET: api/SousLignes/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<SousLigne>> GetSousLigne(int id)
        {
            var sousLigne = await _context.SousLignes
                .Include(s => s.Ligne)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (sousLigne == null)
                return NotFound("SousLigne not found.");

            return Ok(sousLigne);
        }

        // POST: api/SousLignes
        [HttpPost]
        public async Task<ActionResult<SousLigne>> CreateSousLigne([FromBody] SousLigne sousLigne)
        {
            var ligne = await _context.Lignes.FindAsync(sousLigne.LigneId);
            if (ligne == null)
                return BadRequest("Invalid LigneId. Ligne not found.");

            sousLigne.CreatedAt = DateTime.UtcNow;
            sousLigne.UpdatedAt = DateTime.UtcNow;

            _context.SousLignes.Add(sousLigne);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetSousLigne), new { id = sousLigne.Id }, sousLigne);
        }

        // PUT: api/SousLignes/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSousLigne(int id, [FromBody] SousLigne updatedSousLigne)
        {
            var sousLigne = await _context.SousLignes.FindAsync(id);
            if (sousLigne == null)
                return NotFound("SousLigne not found.");

            if (!string.IsNullOrEmpty(updatedSousLigne.Title))
                sousLigne.Title = updatedSousLigne.Title;

            if (!string.IsNullOrEmpty(updatedSousLigne.Attribute))
                sousLigne.Attribute = updatedSousLigne.Attribute;

            sousLigne.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/SousLignes/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSousLigne(int id)
        {
            var sousLigne = await _context.SousLignes.FindAsync(id);
            if (sousLigne == null)
                return NotFound("SousLigne not found.");

            _context.SousLignes.Remove(sousLigne);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
