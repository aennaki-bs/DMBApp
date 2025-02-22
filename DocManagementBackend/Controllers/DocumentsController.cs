using Microsoft.AspNetCore.Mvc;
using DocManagementBackend.Models;
using DocManagementBackend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace DocManagementBackend.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class DocumentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DocumentsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Documents
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Document>>> GetDocuments()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null)
            {
                return Unauthorized("User ID claim is missing.");
            }

            var userId = int.Parse(userIdClaim);

            // Get all documents with status "Posted" (1)
            var postedDocuments = await _context.Documents
                .Where(d => d.Status == 1)
                .ToListAsync();

            // Get documents with status "Open" (0) created by the current user
            var openDocuments = await _context.Documents
                .Where(d => d.Status == 0 && d.CreatedByUserId == userId)
                .ToListAsync();

            // Combine the results
            var result = postedDocuments.Concat(openDocuments).ToList();

            return result;
        }

        // GET: api/Documents/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Document>> GetDocument(int id)
        {
            var document = await _context.Documents.FindAsync(id);

            if (document == null)
            {
                return NotFound();
            }

            return document;
        }

        // POST: api/Documents
        [HttpPost]
        public async Task<ActionResult<Document>> CreateDocument(Document document)
        {
            document.CreatedAt = DateTime.UtcNow;
            document.Status = 0; // Default status is Open

            _context.Documents.Add(document);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetDocument), new { id = document.Id }, document);
        }

        // PUT: api/Documents/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateDocument(int id, Document document)
        {
            if (id != document.Id)
            {
                return BadRequest();
            }

            var existingDocument = await _context.Documents.FindAsync(id);
            if (existingDocument == null)
            {
                return NotFound();
            }

            // Ensure the document status is Open (0) before allowing edits
            if (existingDocument.Status != 0)
            {
                return BadRequest("Only documents with status 'Open' can be edited.");
            }

            existingDocument.Title = document.Title;
            existingDocument.Content = document.Content;

            _context.Entry(existingDocument).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!_context.Documents.Any(d => d.Id == id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/Documents/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteDocument(int id)
        {
            var document = await _context.Documents.FindAsync(id);
            if (document == null)
            {
                return NotFound();
            }

            // Ensure the document status is Open (0) before allowing deletion
            if (document.Status != 0)
            {
                return BadRequest("Only documents with status 'Open' can be deleted.");
            }

            _context.Documents.Remove(document);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}