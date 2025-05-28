using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DocManagementBackend.Data;
using DocManagementBackend.Models;
using Microsoft.AspNetCore.Authorization;
using DocManagementBackend.Services;

namespace DocManagementBackend.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ResponsibilityCentreController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserAuthorizationService _authService;

        public ResponsibilityCentreController(ApplicationDbContext context, UserAuthorizationService authService)
        {
            _context = context;
            _authService = authService;
        }

        // GET: api/ResponsibilityCentre
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ResponsibilityCentreDto>>> GetResponsibilityCentres()
        {
            var responsibilityCentres = await _context.ResponsibilityCentres
                .Where(rc => rc.IsActive)
                .Select(rc => new ResponsibilityCentreDto
                {
                    Id = rc.Id,
                    Code = rc.Code,
                    Descr = rc.Descr,
                    CreatedAt = rc.CreatedAt,
                    UpdatedAt = rc.UpdatedAt,
                    IsActive = rc.IsActive,
                    UsersCount = rc.Users.Count(),
                    DocumentsCount = rc.Documents.Count()
                })
                .OrderBy(rc => rc.Code)
                .ToListAsync();

            return Ok(responsibilityCentres);
        }

        // GET: api/ResponsibilityCentre/simple
        [HttpGet("simple")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<ResponsibilityCentreSimpleDto>>> GetResponsibilityCentresSimple()
        {
            var responsibilityCentres = await _context.ResponsibilityCentres
                .Where(rc => rc.IsActive)
                .Select(rc => new ResponsibilityCentreSimpleDto
                {
                    Id = rc.Id,
                    Code = rc.Code,
                    Descr = rc.Descr,
                    IsActive = rc.IsActive
                })
                .OrderBy(rc => rc.Code)
                .ToListAsync();

            return Ok(responsibilityCentres);
        }

        // GET: api/ResponsibilityCentre/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ResponsibilityCentreDto>> GetResponsibilityCentre(int id)
        {
            var responsibilityCentre = await _context.ResponsibilityCentres
                .Where(rc => rc.Id == id)
                .Select(rc => new ResponsibilityCentreDto
                {
                    Id = rc.Id,
                    Code = rc.Code,
                    Descr = rc.Descr,
                    CreatedAt = rc.CreatedAt,
                    UpdatedAt = rc.UpdatedAt,
                    IsActive = rc.IsActive,
                    UsersCount = rc.Users.Count(),
                    DocumentsCount = rc.Documents.Count()
                })
                .FirstOrDefaultAsync();

            if (responsibilityCentre == null)
                return NotFound("Responsibility Centre not found.");

            return Ok(responsibilityCentre);
        }

        // POST: api/ResponsibilityCentre/validate-code
        [HttpPost("validate-code")]
        public async Task<IActionResult> ValidateCode([FromBody] CreateResponsibilityCentreRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Code))
                return BadRequest("Code is required.");

            var exists = await _context.ResponsibilityCentres
                .AnyAsync(rc => rc.Code.ToUpper() == request.Code.ToUpper());

            return Ok(!exists);
        }

        // POST: api/ResponsibilityCentre
        [HttpPost]
        public async Task<ActionResult<ResponsibilityCentreDto>> CreateResponsibilityCentre([FromBody] CreateResponsibilityCentreRequest request)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            if (string.IsNullOrWhiteSpace(request.Code))
                return BadRequest("Code is required.");

            if (string.IsNullOrWhiteSpace(request.Descr))
                return BadRequest("Description is required.");

            // Check if code already exists
            var existingCode = await _context.ResponsibilityCentres
                .AnyAsync(rc => rc.Code.ToUpper() == request.Code.ToUpper());

            if (existingCode)
                return BadRequest("A Responsibility Centre with this code already exists.");

            var responsibilityCentre = new ResponsibilityCentre
            {
                Code = request.Code.ToUpper().Trim(),
                Descr = request.Descr.Trim(),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                IsActive = true
            };

            _context.ResponsibilityCentres.Add(responsibilityCentre);

            try
            {
                await _context.SaveChangesAsync();

                var createdDto = new ResponsibilityCentreDto
                {
                    Id = responsibilityCentre.Id,
                    Code = responsibilityCentre.Code,
                    Descr = responsibilityCentre.Descr,
                    CreatedAt = responsibilityCentre.CreatedAt,
                    UpdatedAt = responsibilityCentre.UpdatedAt,
                    IsActive = responsibilityCentre.IsActive,
                    UsersCount = 0,
                    DocumentsCount = 0
                };

                return CreatedAtAction(nameof(GetResponsibilityCentre), new { id = responsibilityCentre.Id }, createdDto);
            }
            catch (DbUpdateException ex)
            {
                if (ex.InnerException != null && ex.InnerException.Message.Contains("UNIQUE"))
                    return BadRequest("A Responsibility Centre with this code already exists.");
                
                return StatusCode(500, $"An error occurred while creating the Responsibility Centre: {ex.Message}");
            }
        }

        // PUT: api/ResponsibilityCentre/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateResponsibilityCentre(int id, [FromBody] UpdateResponsibilityCentreRequest request)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var responsibilityCentre = await _context.ResponsibilityCentres.FindAsync(id);
            if (responsibilityCentre == null)
                return NotFound("Responsibility Centre not found.");

            // Update Code if provided
            if (!string.IsNullOrWhiteSpace(request.Code))
            {
                var newCode = request.Code.ToUpper().Trim();
                if (newCode != responsibilityCentre.Code)
                {
                    // Check if new code already exists
                    var existingCode = await _context.ResponsibilityCentres
                        .AnyAsync(rc => rc.Code.ToUpper() == newCode && rc.Id != id);

                    if (existingCode)
                        return BadRequest("A Responsibility Centre with this code already exists.");

                    responsibilityCentre.Code = newCode;
                }
            }

            // Update Description if provided
            if (!string.IsNullOrWhiteSpace(request.Descr))
                responsibilityCentre.Descr = request.Descr.Trim();

            // Update IsActive if provided
            if (request.IsActive.HasValue)
                responsibilityCentre.IsActive = request.IsActive.Value;

            responsibilityCentre.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateException ex)
            {
                if (ex.InnerException != null && ex.InnerException.Message.Contains("UNIQUE"))
                    return BadRequest("A Responsibility Centre with this code already exists.");
                
                return StatusCode(500, $"An error occurred while updating the Responsibility Centre: {ex.Message}");
            }
        }

        // DELETE: api/ResponsibilityCentre/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteResponsibilityCentre(int id)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var responsibilityCentre = await _context.ResponsibilityCentres
                .Include(rc => rc.Users)
                .Include(rc => rc.Documents)
                .FirstOrDefaultAsync(rc => rc.Id == id);

            if (responsibilityCentre == null)
                return NotFound("Responsibility Centre not found.");

            // Check if there are users or documents associated
            if (responsibilityCentre.Users.Any())
                return BadRequest("Cannot delete Responsibility Centre. There are users associated with it.");

            if (responsibilityCentre.Documents.Any())
                return BadRequest("Cannot delete Responsibility Centre. There are documents associated with it.");

            _context.ResponsibilityCentres.Remove(responsibilityCentre);

            try
            {
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, $"An error occurred while deleting the Responsibility Centre: {ex.Message}");
            }
        }

        // PUT: api/ResponsibilityCentre/5/deactivate
        [HttpPut("{id}/deactivate")]
        public async Task<IActionResult> DeactivateResponsibilityCentre(int id)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var responsibilityCentre = await _context.ResponsibilityCentres.FindAsync(id);
            if (responsibilityCentre == null)
                return NotFound("Responsibility Centre not found.");

            responsibilityCentre.IsActive = false;
            responsibilityCentre.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // PUT: api/ResponsibilityCentre/5/activate
        [HttpPut("{id}/activate")]
        public async Task<IActionResult> ActivateResponsibilityCentre(int id)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var responsibilityCentre = await _context.ResponsibilityCentres.FindAsync(id);
            if (responsibilityCentre == null)
                return NotFound("Responsibility Centre not found.");

            responsibilityCentre.IsActive = true;
            responsibilityCentre.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
} 