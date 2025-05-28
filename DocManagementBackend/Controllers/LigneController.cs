using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DocManagementBackend.Data;
using DocManagementBackend.Models;
using DocManagementBackend.Mappings;
using DocManagementBackend.Services;
using System.Security.Claims;

namespace DocManagementBackend.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class LignesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserAuthorizationService _authService;

        public LignesController(
            ApplicationDbContext context,
            UserAuthorizationService authService) 
        { 
            _context = context;
            _authService = authService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<LigneDto>>> GetLignes()
        {
            var authResult = await _authService.AuthorizeUserAsync(User);
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var lignes = await _context.Lignes
                .Include(l => l.Document!).ThenInclude(d => d.DocumentType)
                .Include(l => l.Document!).ThenInclude(d => d.CreatedBy).ThenInclude(u => u.Role)
                .Include(l => l.Type)
                .Include(l => l.Item).ThenInclude(i => i!.UniteCodeNavigation)
                .Include(l => l.GeneralAccounts)
                .Select(LigneMappings.ToLigneDto).ToListAsync();
            return Ok(lignes);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<LigneDto>> GetLigne(int id)
        {
            var authResult = await _authService.AuthorizeUserAsync(User);
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var ligneDto = await _context.Lignes
                .Include(l => l.Document!).ThenInclude(d => d.DocumentType)
                .Include(l => l.Document!).ThenInclude(d => d.CreatedBy).ThenInclude(u => u.Role)
                .Include(l => l.Type)
                .Include(l => l.Item).ThenInclude(i => i!.UniteCodeNavigation)
                .Include(l => l.GeneralAccounts)
                .Where(l => l.Id == id).Select(LigneMappings.ToLigneDto).FirstOrDefaultAsync();
            if (ligneDto == null)
                return NotFound("Ligne not found.");
            return Ok(ligneDto);
        }

        [HttpGet("by-document/{documentId}")]
        public async Task<ActionResult<IEnumerable<LigneDto>>> GetLignesByDocumentId(int documentId)
        {
            var authResult = await _authService.AuthorizeUserAsync(User);
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var lignes = await _context.Lignes
                .Where(l => l.DocumentId == documentId)
                .Include(l => l.Document!).ThenInclude(d => d.DocumentType)
                .Include(l => l.Document!).ThenInclude(d => d.CreatedBy).ThenInclude(u => u.Role)
                .Include(l => l.Type)
                .Include(l => l.Item).ThenInclude(i => i!.UniteCodeNavigation)
                .Include(l => l.GeneralAccounts)
                .Select(LigneMappings.ToLigneDto).ToListAsync();
            return Ok(lignes);
        }

        [HttpPost]
        public async Task<ActionResult<LigneDto>> CreateLigne([FromBody] CreateLigneRequest request)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            // Validate required fields
            if (string.IsNullOrWhiteSpace(request.Title))
                return BadRequest("Title is required.");

            if (string.IsNullOrWhiteSpace(request.Article))
                return BadRequest("Article is required.");

            if (request.Quantity <= 0)
                return BadRequest("Quantity must be greater than 0.");

            if (request.PriceHT < 0)
                return BadRequest("Price HT cannot be negative.");

            // Validate document exists
            var document = await _context.Documents.FindAsync(request.DocumentId);
            if (document == null)
                return BadRequest("Invalid DocumentId. Document not found.");

            // Validate element type and references
            if (request.TypeId.HasValue)
            {
                var elementType = await _context.LignesElementTypes.FindAsync(request.TypeId.Value);
                if (elementType == null)
                    return BadRequest("Invalid TypeId. Element type not found.");

                // Validate element references based on type
                switch (elementType.TypeElement)
                {
                    case "Item":
                        if (string.IsNullOrWhiteSpace(request.ItemCode))
                            return BadRequest("ItemCode is required for Item element type.");
                        
                        var itemExists = await _context.Items.AnyAsync(i => i.Code == request.ItemCode);
                        if (!itemExists)
                            return BadRequest("Invalid ItemCode. Item not found.");
                        break;

                    case "General Accounts":
                        if (string.IsNullOrWhiteSpace(request.GeneralAccountsCode))
                            return BadRequest("GeneralAccountsCode is required for General Accounts element type.");
                        
                        var accountExists = await _context.GeneralAccounts.AnyAsync(ga => ga.Code == request.GeneralAccountsCode);
                        if (!accountExists)
                            return BadRequest("Invalid GeneralAccountsCode. General account not found.");
                        break;

                    default:
                        return BadRequest($"Unsupported element type: {elementType.TypeElement}");
                }
            }

            // Create the ligne entity
            var ligne = new Ligne
            {
                DocumentId = request.DocumentId,
                LigneKey = string.IsNullOrWhiteSpace(request.LigneKey) 
                    ? $"{document.DocumentKey}-L{document.Lignes.Count + 1:000}" 
                    : request.LigneKey,
                Title = request.Title.Trim(),
                Article = request.Article.Trim(),
                TypeId = request.TypeId,
                ItemCode = string.IsNullOrWhiteSpace(request.ItemCode) ? null : request.ItemCode.Trim(),
                GeneralAccountsCode = string.IsNullOrWhiteSpace(request.GeneralAccountsCode) ? null : request.GeneralAccountsCode.Trim(),
                Quantity = request.Quantity,
                PriceHT = request.PriceHT,
                DiscountPercentage = request.DiscountPercentage,
                DiscountAmount = request.DiscountAmount,
                VatPercentage = request.VatPercentage,
                Prix = (float)request.PriceHT, // Legacy field
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            // Validate the ligne
            if (!ligne.IsValid())
                return BadRequest("Invalid ligne data. Please check quantity, prices, and percentages.");

            _context.Lignes.Add(ligne);

            try
            {
                await _context.SaveChangesAsync();

                // Return the created ligne with all includes
                var ligneDto = await _context.Lignes
                    .Include(l => l.Document!).ThenInclude(d => d.DocumentType)
                    .Include(l => l.Document!).ThenInclude(d => d.CreatedBy).ThenInclude(u => u.Role)
                    .Include(l => l.Type)
                    .Include(l => l.Item).ThenInclude(i => i!.UniteCodeNavigation)
                    .Include(l => l.GeneralAccounts)
                    .Where(l => l.Id == ligne.Id)
                    .Select(LigneMappings.ToLigneDto)
                    .FirstOrDefaultAsync();

                return CreatedAtAction(nameof(GetLigne), new { id = ligne.Id }, ligneDto);
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, $"An error occurred while creating the ligne: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateLigne(int id, [FromBody] UpdateLigneRequest request)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var ligne = await _context.Lignes.FindAsync(id);
            if (ligne == null)
                return NotFound("Ligne not found.");

            // Update fields if provided
            if (!string.IsNullOrWhiteSpace(request.LigneKey))
                ligne.LigneKey = request.LigneKey.Trim();

            if (!string.IsNullOrWhiteSpace(request.Title))
                ligne.Title = request.Title.Trim();

            if (!string.IsNullOrWhiteSpace(request.Article))
                ligne.Article = request.Article.Trim();

            // Update element type and references
            if (request.TypeId.HasValue)
            {
                var elementType = await _context.LignesElementTypes.FindAsync(request.TypeId.Value);
                if (elementType == null)
                    return BadRequest("Invalid TypeId. Element type not found.");

                ligne.TypeId = request.TypeId.Value;

                // Validate and update element references based on type
                switch (elementType.TypeElement)
                {
                    case "Item":
                        if (!string.IsNullOrWhiteSpace(request.ItemCode))
                        {
                            var itemExists = await _context.Items.AnyAsync(i => i.Code == request.ItemCode);
                            if (!itemExists)
                                return BadRequest("Invalid ItemCode. Item not found.");
                            ligne.ItemCode = request.ItemCode.Trim();
                        }
                        ligne.GeneralAccountsCode = null; // Clear other reference
                        break;

                    case "General Accounts":
                        if (!string.IsNullOrWhiteSpace(request.GeneralAccountsCode))
                        {
                            var accountExists = await _context.GeneralAccounts.AnyAsync(ga => ga.Code == request.GeneralAccountsCode);
                            if (!accountExists)
                                return BadRequest("Invalid GeneralAccountsCode. General account not found.");
                            ligne.GeneralAccountsCode = request.GeneralAccountsCode.Trim();
                        }
                        ligne.ItemCode = null; // Clear other reference
                        break;

                    default:
                        return BadRequest($"Unsupported element type: {elementType.TypeElement}");
                }
            }

            // Update pricing fields
            if (request.Quantity.HasValue)
            {
                if (request.Quantity.Value <= 0)
                    return BadRequest("Quantity must be greater than 0.");
                ligne.Quantity = request.Quantity.Value;
            }

            if (request.PriceHT.HasValue)
            {
                if (request.PriceHT.Value < 0)
                    return BadRequest("Price HT cannot be negative.");
                ligne.PriceHT = request.PriceHT.Value;
                ligne.Prix = (float)request.PriceHT.Value; // Update legacy field
            }

            if (request.DiscountPercentage.HasValue)
            {
                if (request.DiscountPercentage.Value < 0 || request.DiscountPercentage.Value > 1)
                    return BadRequest("Discount percentage must be between 0 and 1.");
                ligne.DiscountPercentage = request.DiscountPercentage.Value;
            }

            if (request.DiscountAmount.HasValue)
            {
                if (request.DiscountAmount.Value < 0)
                    return BadRequest("Discount amount cannot be negative.");
                ligne.DiscountAmount = request.DiscountAmount.Value;
            }

            if (request.VatPercentage.HasValue)
            {
                if (request.VatPercentage.Value < 0 || request.VatPercentage.Value > 1)
                    return BadRequest("VAT percentage must be between 0 and 1.");
                ligne.VatPercentage = request.VatPercentage.Value;
            }

            // Validate the updated ligne
            if (!ligne.IsValid())
                return BadRequest("Invalid ligne data. Please check quantity, prices, and percentages.");

            ligne.UpdatedAt = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, $"An error occurred while updating the ligne: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLigne(int id)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var ligne = await _context.Lignes
                .Include(l => l.SousLignes)
                .FirstOrDefaultAsync(l => l.Id == id);

            if (ligne == null)
                return NotFound("Ligne not found.");

            // Check if there are sous-lignes associated
            if (ligne.SousLignes.Any())
                return BadRequest("Cannot delete ligne. There are sous-lignes associated with it.");

            _context.Lignes.Remove(ligne);

            try
            {
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateException ex)
            {
                return StatusCode(500, $"An error occurred while deleting the ligne: {ex.Message}");
            }
        }
    }
}
