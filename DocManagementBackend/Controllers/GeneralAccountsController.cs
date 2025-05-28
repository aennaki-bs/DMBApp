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
    public class GeneralAccountsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserAuthorizationService _authService;

        public GeneralAccountsController(ApplicationDbContext context, UserAuthorizationService authService)
        {
            _context = context;
            _authService = authService;
        }

        // GET: api/GeneralAccounts
        [HttpGet]
        public async Task<ActionResult<IEnumerable<GeneralAccountsDto>>> GetGeneralAccounts()
        {
            var accounts = await _context.GeneralAccounts
                .Select(ga => new GeneralAccountsDto
                {
                    Code = ga.Code,
                    Description = ga.Description,
                    CreatedAt = ga.CreatedAt,
                    UpdatedAt = ga.UpdatedAt,
                    LignesCount = ga.Lignes.Count()
                })
                .OrderBy(ga => ga.Code)
                .ToListAsync();

            return Ok(accounts);
        }

        // GET: api/GeneralAccounts/simple
        [HttpGet("simple")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<GeneralAccountsSimpleDto>>> GetGeneralAccountsSimple()
        {
            var accounts = await _context.GeneralAccounts
                .Select(ga => new GeneralAccountsSimpleDto
                {
                    Code = ga.Code,
                    Description = ga.Description
                })
                .OrderBy(ga => ga.Code)
                .ToListAsync();

            return Ok(accounts);
        }

        // GET: api/GeneralAccounts/6001
        [HttpGet("{code}")]
        public async Task<ActionResult<GeneralAccountsDto>> GetGeneralAccount(string code)
        {
            var account = await _context.GeneralAccounts
                .Where(ga => ga.Code == code)
                .Select(ga => new GeneralAccountsDto
                {
                    Code = ga.Code,
                    Description = ga.Description,
                    CreatedAt = ga.CreatedAt,
                    UpdatedAt = ga.UpdatedAt,
                    LignesCount = ga.Lignes.Count()
                })
                .FirstOrDefaultAsync();

            if (account == null)
                return NotFound("General account not found.");

            return Ok(account);
        }

        // POST: api/GeneralAccounts
        [HttpPost]
        public async Task<ActionResult<GeneralAccountsDto>> CreateGeneralAccount([FromBody] CreateGeneralAccountsRequest request)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            if (string.IsNullOrWhiteSpace(request.Code))
                return BadRequest("Code is required.");

            if (string.IsNullOrWhiteSpace(request.Description))
                return BadRequest("Description is required.");

            // Check if code already exists
            var existingCode = await _context.GeneralAccounts
                .AnyAsync(ga => ga.Code.ToUpper() == request.Code.ToUpper());

            if (existingCode)
                return BadRequest("A general account with this code already exists.");

            var account = new GeneralAccounts
            {
                Code = request.Code.ToUpper().Trim(),
                Description = request.Description.Trim(),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.GeneralAccounts.Add(account);

            try
            {
                await _context.SaveChangesAsync();

                var createdDto = new GeneralAccountsDto
                {
                    Code = account.Code,
                    Description = account.Description,
                    CreatedAt = account.CreatedAt,
                    UpdatedAt = account.UpdatedAt,
                    LignesCount = 0
                };

                return CreatedAtAction(nameof(GetGeneralAccount), new { code = account.Code }, createdDto);
            }
            catch (DbUpdateException ex)
            {
                if (ex.InnerException != null && ex.InnerException.Message.Contains("UNIQUE"))
                    return BadRequest("A general account with this code already exists.");
                
                return StatusCode(500, $"An error occurred while creating the general account: {ex.Message}");
            }
        }

        // PUT: api/GeneralAccounts/6001
        [HttpPut("{code}")]
        public async Task<IActionResult> UpdateGeneralAccount(string code, [FromBody] UpdateGeneralAccountsRequest request)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var account = await _context.GeneralAccounts.FindAsync(code);
            if (account == null)
                return NotFound("General account not found.");

            // Update Description if provided
            if (!string.IsNullOrWhiteSpace(request.Description))
                account.Description = request.Description.Trim();

            account.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, $"An error occurred while updating the general account: {ex.Message}");
            }
        }

        // DELETE: api/GeneralAccounts/6001
        [HttpDelete("{code}")]
        public async Task<IActionResult> DeleteGeneralAccount(string code)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var account = await _context.GeneralAccounts
                .Include(ga => ga.Lignes)
                .FirstOrDefaultAsync(ga => ga.Code == code);

            if (account == null)
                return NotFound("General account not found.");

            // Check if there are lines associated
            if (account.Lignes.Any())
                return BadRequest("Cannot delete general account. There are lines associated with it.");

            _context.GeneralAccounts.Remove(account);

            try
            {
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, $"An error occurred while deleting the general account: {ex.Message}");
            }
        }
    }
} 