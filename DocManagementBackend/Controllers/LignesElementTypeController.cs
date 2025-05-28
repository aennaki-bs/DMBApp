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
    public class LignesElementTypeController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserAuthorizationService _authService;

        public LignesElementTypeController(ApplicationDbContext context, UserAuthorizationService authService)
        {
            _context = context;
            _authService = authService;
        }

        // GET: api/LignesElementType
        [HttpGet]
        public async Task<ActionResult<IEnumerable<LignesElementTypeDto>>> GetLignesElementTypes()
        {
            var elementTypes = await _context.LignesElementTypes
                .Select(let => new LignesElementTypeDto
                {
                    Id = let.Id,
                    TypeElement = let.TypeElement,
                    Description = let.Description,
                    TableName = let.TableName,
                    CreatedAt = let.CreatedAt,
                    UpdatedAt = let.UpdatedAt
                })
                .OrderBy(let => let.TypeElement)
                .ToListAsync();

            return Ok(elementTypes);
        }

        // GET: api/LignesElementType/simple
        [HttpGet("simple")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<LignesElementTypeSimpleDto>>> GetLignesElementTypesSimple()
        {
            var elementTypes = await _context.LignesElementTypes
                .Select(let => new LignesElementTypeSimpleDto
                {
                    Id = let.Id,
                    TypeElement = let.TypeElement,
                    Description = let.Description
                })
                .OrderBy(let => let.TypeElement)
                .ToListAsync();

            return Ok(elementTypes);
        }

        // GET: api/LignesElementType/5
        [HttpGet("{id}")]
        public async Task<ActionResult<LignesElementTypeDto>> GetLignesElementType(int id)
        {
            var elementType = await _context.LignesElementTypes
                .Where(let => let.Id == id)
                .Select(let => new LignesElementTypeDto
                {
                    Id = let.Id,
                    TypeElement = let.TypeElement,
                    Description = let.Description,
                    TableName = let.TableName,
                    CreatedAt = let.CreatedAt,
                    UpdatedAt = let.UpdatedAt
                })
                .FirstOrDefaultAsync();

            if (elementType == null)
                return NotFound("Element type not found.");

            return Ok(elementType);
        }

        // POST: api/LignesElementType
        [HttpPost]
        public async Task<ActionResult<LignesElementTypeDto>> CreateLignesElementType([FromBody] CreateLignesElementTypeRequest request)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            if (string.IsNullOrWhiteSpace(request.TypeElement))
                return BadRequest("TypeElement is required.");

            if (string.IsNullOrWhiteSpace(request.Description))
                return BadRequest("Description is required.");

            if (string.IsNullOrWhiteSpace(request.TableName))
                return BadRequest("TableName is required.");

            // Check if TypeElement already exists
            var existingType = await _context.LignesElementTypes
                .AnyAsync(let => let.TypeElement.ToUpper() == request.TypeElement.ToUpper());

            if (existingType)
                return BadRequest("An element type with this name already exists.");

            var elementType = new LignesElementType
            {
                TypeElement = request.TypeElement.Trim(),
                Description = request.Description.Trim(),
                TableName = request.TableName.Trim(),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.LignesElementTypes.Add(elementType);

            try
            {
                await _context.SaveChangesAsync();

                var createdDto = new LignesElementTypeDto
                {
                    Id = elementType.Id,
                    TypeElement = elementType.TypeElement,
                    Description = elementType.Description,
                    TableName = elementType.TableName,
                    CreatedAt = elementType.CreatedAt,
                    UpdatedAt = elementType.UpdatedAt
                };

                return CreatedAtAction(nameof(GetLignesElementType), new { id = elementType.Id }, createdDto);
            }
            catch (DbUpdateException ex)
            {
                if (ex.InnerException != null && ex.InnerException.Message.Contains("UNIQUE"))
                    return BadRequest("An element type with this name already exists.");
                
                return StatusCode(500, $"An error occurred while creating the element type: {ex.Message}");
            }
        }

        // PUT: api/LignesElementType/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateLignesElementType(int id, [FromBody] UpdateLignesElementTypeRequest request)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var elementType = await _context.LignesElementTypes.FindAsync(id);
            if (elementType == null)
                return NotFound("Element type not found.");

            // Update TypeElement if provided
            if (!string.IsNullOrWhiteSpace(request.TypeElement))
            {
                var newTypeElement = request.TypeElement.Trim();
                if (newTypeElement != elementType.TypeElement)
                {
                    // Check if new TypeElement already exists
                    var existingType = await _context.LignesElementTypes
                        .AnyAsync(let => let.TypeElement.ToUpper() == newTypeElement.ToUpper() && let.Id != id);

                    if (existingType)
                        return BadRequest("An element type with this name already exists.");

                    elementType.TypeElement = newTypeElement;
                }
            }

            // Update Description if provided
            if (!string.IsNullOrWhiteSpace(request.Description))
                elementType.Description = request.Description.Trim();

            // Update TableName if provided
            if (!string.IsNullOrWhiteSpace(request.TableName))
                elementType.TableName = request.TableName.Trim();

            elementType.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateException ex)
            {
                if (ex.InnerException != null && ex.InnerException.Message.Contains("UNIQUE"))
                    return BadRequest("An element type with this name already exists.");
                
                return StatusCode(500, $"An error occurred while updating the element type: {ex.Message}");
            }
        }

        // DELETE: api/LignesElementType/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLignesElementType(int id)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var elementType = await _context.LignesElementTypes
                .Include(let => let.Lignes)
                .FirstOrDefaultAsync(let => let.Id == id);

            if (elementType == null)
                return NotFound("Element type not found.");

            // Check if there are lines associated
            if (elementType.Lignes.Any())
                return BadRequest("Cannot delete element type. There are lines associated with it.");

            _context.LignesElementTypes.Remove(elementType);

            try
            {
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, $"An error occurred while deleting the element type: {ex.Message}");
            }
        }
    }
} 