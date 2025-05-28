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
    public class ItemController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserAuthorizationService _authService;

        public ItemController(ApplicationDbContext context, UserAuthorizationService authService)
        {
            _context = context;
            _authService = authService;
        }

        // GET: api/Item
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ItemDto>>> GetItems()
        {
            var items = await _context.Items
                .Include(i => i.UniteCodeNavigation)
                .Select(i => new ItemDto
                {
                    Code = i.Code,
                    Description = i.Description,
                    Unite = i.Unite,
                    UniteCodeNavigation = i.UniteCodeNavigation != null ? new UniteCodeDto
                    {
                        Code = i.UniteCodeNavigation.Code,
                        Description = i.UniteCodeNavigation.Description,
                        CreatedAt = i.UniteCodeNavigation.CreatedAt,
                        UpdatedAt = i.UniteCodeNavigation.UpdatedAt,
                        ItemsCount = i.UniteCodeNavigation.Items.Count()
                    } : null,
                    CreatedAt = i.CreatedAt,
                    UpdatedAt = i.UpdatedAt,
                    LignesCount = i.Lignes.Count()
                })
                .OrderBy(i => i.Code)
                .ToListAsync();

            return Ok(items);
        }

        // GET: api/Item/simple
        [HttpGet("simple")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<ItemSimpleDto>>> GetItemsSimple()
        {
            var items = await _context.Items
                .Select(i => new ItemSimpleDto
                {
                    Code = i.Code,
                    Description = i.Description,
                    Unite = i.Unite
                })
                .OrderBy(i => i.Code)
                .ToListAsync();

            return Ok(items);
        }

        // GET: api/Item/ABC123
        [HttpGet("{code}")]
        public async Task<ActionResult<ItemDto>> GetItem(string code)
        {
            var item = await _context.Items
                .Include(i => i.UniteCodeNavigation)
                .Where(i => i.Code == code)
                .Select(i => new ItemDto
                {
                    Code = i.Code,
                    Description = i.Description,
                    Unite = i.Unite,
                    UniteCodeNavigation = i.UniteCodeNavigation != null ? new UniteCodeDto
                    {
                        Code = i.UniteCodeNavigation.Code,
                        Description = i.UniteCodeNavigation.Description,
                        CreatedAt = i.UniteCodeNavigation.CreatedAt,
                        UpdatedAt = i.UniteCodeNavigation.UpdatedAt,
                        ItemsCount = i.UniteCodeNavigation.Items.Count()
                    } : null,
                    CreatedAt = i.CreatedAt,
                    UpdatedAt = i.UpdatedAt,
                    LignesCount = i.Lignes.Count()
                })
                .FirstOrDefaultAsync();

            if (item == null)
                return NotFound("Item not found.");

            return Ok(item);
        }

        // POST: api/Item/validate-code
        [HttpPost("validate-code")]
        public async Task<IActionResult> ValidateCode([FromBody] CreateItemRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Code))
                return BadRequest("Code is required.");

            var exists = await _context.Items
                .AnyAsync(i => i.Code.ToUpper() == request.Code.ToUpper());

            return Ok(!exists);
        }

        // POST: api/Item
        [HttpPost]
        public async Task<ActionResult<ItemDto>> CreateItem([FromBody] CreateItemRequest request)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            if (string.IsNullOrWhiteSpace(request.Code))
                return BadRequest("Code is required.");

            if (string.IsNullOrWhiteSpace(request.Description))
                return BadRequest("Description is required.");

            // Check if code already exists
            var existingCode = await _context.Items
                .AnyAsync(i => i.Code.ToUpper() == request.Code.ToUpper());

            if (existingCode)
                return BadRequest("An item with this code already exists.");

            // Validate Unite code if provided
            if (!string.IsNullOrWhiteSpace(request.Unite))
            {
                var uniteExists = await _context.UniteCodes
                    .AnyAsync(uc => uc.Code == request.Unite);
                
                if (!uniteExists)
                    return BadRequest("The specified unit code does not exist.");
            }

            var item = new Item
            {
                Code = request.Code.ToUpper().Trim(),
                Description = request.Description.Trim(),
                Unite = string.IsNullOrWhiteSpace(request.Unite) ? null : request.Unite.Trim(),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Items.Add(item);

            try
            {
                await _context.SaveChangesAsync();

                var createdDto = new ItemDto
                {
                    Code = item.Code,
                    Description = item.Description,
                    Unite = item.Unite,
                    UniteCodeNavigation = null,
                    CreatedAt = item.CreatedAt,
                    UpdatedAt = item.UpdatedAt,
                    LignesCount = 0
                };

                return CreatedAtAction(nameof(GetItem), new { code = item.Code }, createdDto);
            }
            catch (DbUpdateException ex)
            {
                if (ex.InnerException != null && ex.InnerException.Message.Contains("UNIQUE"))
                    return BadRequest("An item with this code already exists.");
                
                return StatusCode(500, $"An error occurred while creating the item: {ex.Message}");
            }
        }

        // PUT: api/Item/ABC123
        [HttpPut("{code}")]
        public async Task<IActionResult> UpdateItem(string code, [FromBody] UpdateItemRequest request)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var item = await _context.Items.FindAsync(code);
            if (item == null)
                return NotFound("Item not found.");

            // Update Description if provided
            if (!string.IsNullOrWhiteSpace(request.Description))
                item.Description = request.Description.Trim();

            // Update Unite if provided
            if (request.Unite != null)
            {
                if (string.IsNullOrWhiteSpace(request.Unite))
                {
                    item.Unite = null;
                }
                else
                {
                    // Validate Unite code exists
                    var uniteExists = await _context.UniteCodes
                        .AnyAsync(uc => uc.Code == request.Unite);
                    
                    if (!uniteExists)
                        return BadRequest("The specified unit code does not exist.");
                    
                    item.Unite = request.Unite.Trim();
                }
            }

            item.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, $"An error occurred while updating the item: {ex.Message}");
            }
        }

        // DELETE: api/Item/ABC123
        [HttpDelete("{code}")]
        public async Task<IActionResult> DeleteItem(string code)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var item = await _context.Items
                .Include(i => i.Lignes)
                .FirstOrDefaultAsync(i => i.Code == code);

            if (item == null)
                return NotFound("Item not found.");

            // Check if there are lines associated
            if (item.Lignes.Any())
                return BadRequest("Cannot delete item. There are lines associated with it.");

            _context.Items.Remove(item);

            try
            {
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, $"An error occurred while deleting the item: {ex.Message}");
            }
        }
    }
} 