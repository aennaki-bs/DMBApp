using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DocManagementBackend.Data;
using DocManagementBackend.Models;
using DocManagementBackend.Services;
using System.Security.Claims;

namespace DocManagementBackend.Controllers
{
    [Authorize]
    [Route("api/Series")]
    [ApiController]
    public class SeriesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserAuthorizationService _authService;

        public SeriesController(
            ApplicationDbContext context,
            UserAuthorizationService authService)
        {
            _context = context;
            _authService = authService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<SubTypeDto>>> GetSubTypes()
        {
            var authResult = await _authService.AuthorizeUserAsync(User);
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var subTypes = await _context.SubTypes
                .Include(st => st.DocumentType)
                .Select(st => new SubTypeDto
                {
                    Id = st.Id,
                    SubTypeKey = st.SubTypeKey,
                    Name = st.Name,
                    Description = st.Description,
                    StartDate = st.StartDate,
                    EndDate = st.EndDate,
                    DocumentTypeId = st.DocumentTypeId,
                    IsActive = st.IsActive,
                    DocumentType = new DocumentTypeDto
                    {
                        TypeKey = st.DocumentType!.TypeKey,
                        TypeName = st.DocumentType.TypeName,
                        TypeAttr = st.DocumentType.TypeAttr
                    }
                })
                .ToListAsync();

            return Ok(subTypes);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<SubTypeDto>> GetSubType(int id)
        {
            var authResult = await _authService.AuthorizeUserAsync(User);
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var subType = await _context.SubTypes
                .Include(st => st.DocumentType)
                .Where(st => st.Id == id)
                .Select(st => new SubTypeDto
                {
                    Id = st.Id,
                    SubTypeKey = st.SubTypeKey,
                    Name = st.Name,
                    Description = st.Description,
                    StartDate = st.StartDate,
                    EndDate = st.EndDate,
                    DocumentTypeId = st.DocumentTypeId,
                    IsActive = st.IsActive,
                    DocumentType = new DocumentTypeDto
                    {
                        TypeKey = st.DocumentType!.TypeKey,
                        TypeName = st.DocumentType.TypeName,
                        TypeAttr = st.DocumentType.TypeAttr
                    }
                })
                .FirstOrDefaultAsync();

            if (subType == null)
                return NotFound("SubType not found.");

            return Ok(subType);
        }

        [HttpGet("by-document-type/{docTypeId}")]
        public async Task<ActionResult<IEnumerable<SubTypeDto>>> GetSubTypesByDocType(int docTypeId)
        {
            var authResult = await _authService.AuthorizeUserAsync(User);
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var subTypes = await _context.SubTypes
                .Include(st => st.DocumentType)
                .Where(st => st.DocumentTypeId == docTypeId)
                .Select(st => new SubTypeDto
                {
                    Id = st.Id,
                    SubTypeKey = st.SubTypeKey,
                    Name = st.Name,
                    Description = st.Description,
                    StartDate = st.StartDate,
                    EndDate = st.EndDate,
                    DocumentTypeId = st.DocumentTypeId,
                    IsActive = st.IsActive,
                    DocumentType = new DocumentTypeDto
                    {
                        TypeKey = st.DocumentType!.TypeKey,
                        TypeName = st.DocumentType.TypeName,
                        TypeAttr = st.DocumentType.TypeAttr
                    }
                })
                .ToListAsync();

            return Ok(subTypes);
        }

        [HttpGet("for-date/{docTypeId}/{date}")]
        public async Task<ActionResult<IEnumerable<SubTypeDto>>> GetSubTypesForDate(int docTypeId, DateTime date)
        {
            var authResult = await _authService.AuthorizeUserAsync(User);
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var subTypes = await _context.SubTypes
                .Include(st => st.DocumentType)
                .Where(st => st.DocumentTypeId == docTypeId &&
                             st.IsActive &&
                             st.StartDate <= date &&
                             st.EndDate >= date)
                .Select(st => new SubTypeDto
                {
                    Id = st.Id,
                    SubTypeKey = st.SubTypeKey,
                    Name = st.Name,
                    Description = st.Description,
                    StartDate = st.StartDate,
                    EndDate = st.EndDate,
                    DocumentTypeId = st.DocumentTypeId,
                    IsActive = st.IsActive,
                    DocumentType = new DocumentTypeDto
                    {
                        TypeKey = st.DocumentType!.TypeKey,
                        TypeName = st.DocumentType.TypeName,
                        TypeAttr = st.DocumentType.TypeAttr
                    }
                })
                .ToListAsync();

            return Ok(subTypes);
        }

        [HttpPost]
        public async Task<ActionResult<SubTypeDto>> CreateSubType([FromBody] CreateSubTypeDto createSubTypeDto)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var userId = authResult.UserId;

            // Check if DocumentType exists
            var documentType = await _context.DocumentTypes.FindAsync(createSubTypeDto.DocumentTypeId);
            if (documentType == null)
                return BadRequest("Invalid DocumentType.");

            // Validate date range
            if (createSubTypeDto.StartDate >= createSubTypeDto.EndDate)
                return BadRequest("Start date must be before end date.");

            // Check for overlapping periods with the same name for this document type
            var overlappingSubTypeWithSameName = await _context.SubTypes
                .Where(st => st.DocumentTypeId == createSubTypeDto.DocumentTypeId &&
                             st.Name.ToLower() == createSubTypeDto.Name.ToLower() &&
                             ((st.StartDate <= createSubTypeDto.StartDate && st.EndDate >= createSubTypeDto.StartDate) ||
                              (st.StartDate <= createSubTypeDto.EndDate && st.EndDate >= createSubTypeDto.EndDate) ||
                              (st.StartDate >= createSubTypeDto.StartDate && st.EndDate <= createSubTypeDto.EndDate)))
                .FirstOrDefaultAsync();

            if (overlappingSubTypeWithSameName != null)
                return BadRequest($"A subtype with name '{createSubTypeDto.Name}' already exists for this document type within the specified date range.");

            // Check for any overlapping periods for this document type, regardless of name
            var overlappingSubType = await _context.SubTypes
                .Where(st => st.DocumentTypeId == createSubTypeDto.DocumentTypeId &&
                             ((st.StartDate <= createSubTypeDto.StartDate && st.EndDate >= createSubTypeDto.StartDate) ||
                              (st.StartDate <= createSubTypeDto.EndDate && st.EndDate >= createSubTypeDto.EndDate) ||
                              (st.StartDate >= createSubTypeDto.StartDate && st.EndDate <= createSubTypeDto.EndDate)))
                .FirstOrDefaultAsync();

            if (overlappingSubType != null)
                return BadRequest($"A subtype already exists for this document type within the date range {createSubTypeDto.StartDate:yyyy-MM-dd} to {createSubTypeDto.EndDate:yyyy-MM-dd}. " +
                                  $"It overlaps with '{overlappingSubType.Name}' ({overlappingSubType.StartDate:yyyy-MM-dd} to {overlappingSubType.EndDate:yyyy-MM-dd}).");

            // Generate the SubTypeKey
            // Format example: {TypeKey}{FirstLettersOfName}{YearEnd} = "FAAB25"
            string subTypeKey;
            if (createSubTypeDto.SubTypeKey != null) {
                subTypeKey = createSubTypeDto.SubTypeKey;
            } else {
                string namePrefix = ""; //string.Join("", createSubTypeDto.Name.Take(2)).ToUpper();
                string yearSuffix = createSubTypeDto.EndDate.ToString("yy"); // 2-digit year
                subTypeKey = $"{documentType.TypeKey}{namePrefix}{yearSuffix}";
            }

            // Check if this key already exists, if so, make it unique
            bool keyExists = await _context.SubTypes.AnyAsync(st => st.SubTypeKey == subTypeKey);
            if (keyExists)
            {
                // Add a numeric suffix until we find a unique key
                int counter = 1;
                string newKey;
                do
                {
                    newKey = $"{subTypeKey}-{counter}";
                    keyExists = await _context.SubTypes.AnyAsync(st => st.SubTypeKey == newKey);
                    counter++;
                } while (keyExists && counter < 100);

                subTypeKey = newKey;
            }

            var subType = new SubType
            {
                Name = createSubTypeDto.Name,
                Description = createSubTypeDto.Description,
                StartDate = createSubTypeDto.StartDate,
                EndDate = createSubTypeDto.EndDate,
                DocumentTypeId = createSubTypeDto.DocumentTypeId,
                IsActive = createSubTypeDto.IsActive,
                SubTypeKey = subTypeKey
            };

            _context.SubTypes.Add(subType);
            await _context.SaveChangesAsync();

            var subTypeDto = new SubTypeDto
            {
                Id = subType.Id,
                SubTypeKey = subType.SubTypeKey,
                Name = subType.Name,
                Description = subType.Description,
                StartDate = subType.StartDate,
                EndDate = subType.EndDate,
                DocumentTypeId = subType.DocumentTypeId,
                IsActive = subType.IsActive,
                DocumentType = new DocumentTypeDto
                {
                    TypeKey = documentType.TypeKey,
                    TypeName = documentType.TypeName,
                    TypeAttr = documentType.TypeAttr
                }
            };

            return CreatedAtAction(nameof(GetSubType), new { id = subType.Id }, subTypeDto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSubType(int id, [FromBody] UpdateSubTypeDto updateSubTypeDto)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var userId = authResult.UserId;

            var subType = await _context.SubTypes.FindAsync(id);
            if (subType == null)
                return NotFound("SubType not found.");

            // Check if we need to update dates and validate
            DateTime startDate = updateSubTypeDto.StartDate ?? subType.StartDate;
            DateTime endDate = updateSubTypeDto.EndDate ?? subType.EndDate;

            if (startDate >= endDate)
                return BadRequest("Start date must be before end date.");

            // Check for name update and potential overlaps
            string name = updateSubTypeDto.Name ?? subType.Name;

            if (updateSubTypeDto.Name != null || updateSubTypeDto.StartDate.HasValue || updateSubTypeDto.EndDate.HasValue)
            {
                // Check for overlapping periods with the same name for this document type
                var overlappingSubTypeWithSameName = await _context.SubTypes
                    .Where(st => st.Id != id &&
                                 st.DocumentTypeId == subType.DocumentTypeId &&
                                 st.Name.ToLower() == name.ToLower() &&
                                 ((st.StartDate <= startDate && st.EndDate >= startDate) ||
                                  (st.StartDate <= endDate && st.EndDate >= endDate) ||
                                  (st.StartDate >= startDate && st.EndDate <= endDate)))
                    .FirstOrDefaultAsync();

                if (overlappingSubTypeWithSameName != null)
                    return BadRequest($"A subtype with name '{name}' already exists for this document type within the specified date range.");
                
                // Check for any overlapping periods for this document type, regardless of name
                var overlappingSubType = await _context.SubTypes
                    .Where(st => st.Id != id &&
                                 st.DocumentTypeId == subType.DocumentTypeId &&
                                 ((st.StartDate <= startDate && st.EndDate >= startDate) ||
                                  (st.StartDate <= endDate && st.EndDate >= endDate) ||
                                  (st.StartDate >= startDate && st.EndDate <= endDate)))
                    .FirstOrDefaultAsync();

                if (overlappingSubType != null)
                    return BadRequest($"A subtype already exists for this document type within the date range {startDate:yyyy-MM-dd} to {endDate:yyyy-MM-dd}. " +
                                     $"It overlaps with '{overlappingSubType.Name}' ({overlappingSubType.StartDate:yyyy-MM-dd} to {overlappingSubType.EndDate:yyyy-MM-dd}).");
            }

            // Update the SubType
            if (updateSubTypeDto.Name != null)
                subType.Name = updateSubTypeDto.Name;

            if (updateSubTypeDto.Description != null)
                subType.Description = updateSubTypeDto.Description;

            if (updateSubTypeDto.StartDate.HasValue)
                subType.StartDate = updateSubTypeDto.StartDate.Value;

            if (updateSubTypeDto.EndDate.HasValue)
                subType.EndDate = updateSubTypeDto.EndDate.Value;

            if (updateSubTypeDto.IsActive.HasValue)
                subType.IsActive = updateSubTypeDto.IsActive.Value;

            // Handle SubTypeKey update
            if (updateSubTypeDto.SubTypeKey != null)
            {
                // Check if the new SubTypeKey is unique
                bool keyExists = await _context.SubTypes.AnyAsync(st => st.SubTypeKey == updateSubTypeDto.SubTypeKey && st.Id != id);
                if (keyExists)
                    return BadRequest($"SubType key '{updateSubTypeDto.SubTypeKey}' already exists.");
                
                subType.SubTypeKey = updateSubTypeDto.SubTypeKey;
            }
            else if (updateSubTypeDto.Name != null || updateSubTypeDto.EndDate.HasValue)
            {
                // If the name or dates changed but no explicit SubTypeKey provided, auto-generate it
                var documentType = await _context.DocumentTypes.FindAsync(subType.DocumentTypeId);
                if (documentType != null)
                {
                    string namePrefix = string.Join("", subType.Name.Take(2)).ToUpper();
                    string yearSuffix = subType.EndDate.ToString("yy"); // 2-digit year
                    string newSubTypeKey = $"{documentType.TypeKey}{namePrefix}{yearSuffix}";

                    // Check if this key already exists, if so, make it unique
                    bool keyExists = await _context.SubTypes.AnyAsync(st => st.SubTypeKey == newSubTypeKey && st.Id != id);
                    if (keyExists)
                    {
                        // Add a numeric suffix until we find a unique key
                        int counter = 1;
                        string tempKey;
                        do
                        {
                            tempKey = $"{newSubTypeKey}{counter}";
                            keyExists = await _context.SubTypes.AnyAsync(st => st.SubTypeKey == tempKey && st.Id != id);
                            counter++;
                        } while (keyExists && counter < 100);

                        newSubTypeKey = tempKey;
                    }

                    subType.SubTypeKey = newSubTypeKey;
                }
                else
                {
                    return BadRequest("Document type not found.");
                }
            }

            try
            {
                await _context.SaveChangesAsync();
                return Ok("SubType updated successfully");
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _context.SubTypes.AnyAsync(st => st.Id == id))
                    return NotFound("SubType not found");
                throw;
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSubType(int id)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var userId = authResult.UserId;

            var subType = await _context.SubTypes.FindAsync(id);
            if (subType == null)
                return NotFound("SubType not found.");

            // Check if this subtype is used by any documents
            bool isUsed = await _context.Documents.AnyAsync(d => d.SubTypeId == id);
            if (isUsed)
                return BadRequest("Cannot delete this subtype because it is used by one or more documents.");

            _context.SubTypes.Remove(subType);
            await _context.SaveChangesAsync();

            return Ok("SubType deleted successfully.");
        }
    }
}