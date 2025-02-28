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
    public class LignesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public LignesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Lignes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Ligne>>> GetLignes()
        {
            return await _context.Lignes
                .Include(l => l.Document)
                .ToListAsync();
        }

        // GET: api/Lignes/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<Ligne>> GetLigne(int id)
        {
            var ligne = await _context.Lignes
                .Include(l => l.Document)
                .FirstOrDefaultAsync(l => l.Id == id);

            if (ligne == null)
                return NotFound("Ligne not found.");

            return Ok(ligne);
        }

        // POST: api/Lignes
        [HttpPost]
        public async Task<ActionResult<Ligne>> CreateLigne([FromBody] Ligne ligne)
        {
            var document = await _context.Documents.FindAsync(ligne.DocumentId);
            if (document == null)
                return BadRequest("Invalid DocumentId. Document not found.");

            ligne.CreatedAt = DateTime.UtcNow;
            ligne.UpdatedAt = DateTime.UtcNow;

            _context.Lignes.Add(ligne);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetLigne), new { id = ligne.Id }, ligne);
        }

        // PUT: api/Lignes/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateLigne(int id, [FromBody] Ligne updatedLigne)
        {
            var ligne = await _context.Lignes.FindAsync(id);
            if (ligne == null)
                return NotFound("Ligne not found.");

            if (!string.IsNullOrEmpty(updatedLigne.Title))
                ligne.Title = updatedLigne.Title;

            if (!string.IsNullOrEmpty(updatedLigne.Article))
                ligne.Article = updatedLigne.Article;

            if (updatedLigne.Prix >= 0)
                ligne.Prix = updatedLigne.Prix;

            ligne.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/Lignes/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLigne(int id)
        {
            var ligne = await _context.Lignes.FindAsync(id);
            if (ligne == null)
                return NotFound("Ligne not found.");

            _context.Lignes.Remove(ligne);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
