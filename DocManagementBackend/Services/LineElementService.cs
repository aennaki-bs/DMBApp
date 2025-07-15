using Microsoft.EntityFrameworkCore;
using DocManagementBackend.Data;
using DocManagementBackend.Models;

namespace DocManagementBackend.Services
{
    public class LineElementService
    {
        private readonly ApplicationDbContext _context;

        public LineElementService(ApplicationDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Validates a LignesElementType for consistency
        /// </summary>
        public async Task<bool> ValidateElementTypeAsync(LignesElementType elementType)
        {
            if (elementType == null)
                return false;

            // Check basic validation
            if (!elementType.IsValid())
                return false;

            // Check code uniqueness
            var codeExists = await _context.LignesElementTypes
                .AnyAsync(let => let.Code == elementType.Code && let.Id != elementType.Id);

            if (codeExists)
                return false;
            return true;
        }

        /// <summary>
        /// Gets all line element types with their related data
        /// </summary>
        public async Task<List<LignesElementType>> GetAllElementTypesAsync()
        {
            return await _context.LignesElementTypes
                .Include(let => let.Item).ThenInclude(i => i!.UniteCodeNavigation)
                .Include(let => let.GeneralAccount)
                .OrderBy(let => let.Code)
                .ToListAsync();
        }

        /// <summary>
        /// Gets line element types by type (Item or General Accounts)
        /// </summary>
        public async Task<List<LignesElementType>> GetElementTypesByTypeAsync(string typeElement)
        {
            if (!Enum.TryParse<ElementType>(typeElement, true, out var enumValue))
            {
                return new List<LignesElementType>(); // Return empty list for invalid type
            }
            
            return await _context.LignesElementTypes
                .Include(let => let.Item).ThenInclude(i => i!.UniteCodeNavigation)
                .Include(let => let.GeneralAccount)
                .Where(let => let.TypeElement == enumValue)
                .OrderBy(let => let.Code)
                .ToListAsync();
        }

        /// <summary>
        /// Deletes a line element type if it's not being used
        /// </summary>
        public async Task<bool> DeleteElementTypeAsync(int elementTypeId)
        {
            var elementType = await _context.LignesElementTypes
                .Include(let => let.Lignes)
                .FirstOrDefaultAsync(let => let.Id == elementTypeId);

            if (elementType == null)
                return false;

            // Check if it's being used by any lines
            if (elementType.Lignes.Any())
                return false;

            _context.LignesElementTypes.Remove(elementType);
            await _context.SaveChangesAsync();
            return true;
        }

        /// <summary>
        /// Checks if an element type is currently being used by any lines
        /// </summary>
        public async Task<bool> IsElementTypeInUseAsync(int elementTypeId)
        {
            return await _context.Lignes
                .AnyAsync(l => l.LignesElementTypeId == elementTypeId);
        }

        /// <summary>
        /// Validates if an element type can be safely updated (doesn't break existing lines)
        /// </summary>
        public async Task<(bool CanUpdate, string? ErrorMessage)> CanUpdateElementTypeAsync(int elementTypeId, LignesElementType updatedElementType)
        {
            var isInUse = await IsElementTypeInUseAsync(elementTypeId);
            
            if (!isInUse)
            {
                // If not in use, allow any update
                return (true, null);
            }

            var existingElementType = await _context.LignesElementTypes.FindAsync(elementTypeId);
            if (existingElementType == null)
            {
                return (false, "Element type not found");
            }

            // If in use, only allow safe updates (description, table name)
            // Prevent changes to critical fields that would break line references
            if (existingElementType.Code != updatedElementType.Code)
            {
                return (false, "Cannot change the code of an element type that is being used by lines");
            }

            if (existingElementType.TypeElement != updatedElementType.TypeElement)
            {
                return (false, "Cannot change the type element of an element type that is being used by lines");
            }

            // Only description and table name changes are allowed when in use
            return (true, null);
        }
    }
} 