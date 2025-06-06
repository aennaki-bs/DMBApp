using Microsoft.EntityFrameworkCore;
using DocManagementBackend.Models;

namespace DocManagementBackend.Data
{
    public static class DataSeeder
    {
        public static async Task SeedDataAsync(ApplicationDbContext context)
        {
            // Seed UniteCodes and default LignesElementTypes for the new dynamic system
            await SeedUniteCodesAsync(context);
            await SeedLignesElementTypesAsync(context);
        }

        private static async Task SeedUniteCodesAsync(ApplicationDbContext context)
        {
            var existingCodes = await context.UniteCodes.Select(uc => uc.Code).ToListAsync();
            var codesToSeed = new[]
            {
                new { Code = "PCS", Description = "Pieces" },
                new { Code = "KG", Description = "Kilogram" },
                new { Code = "M", Description = "Meter" },
                new { Code = "M2", Description = "Square Meter" },
                new { Code = "M3", Description = "Cubic Meter" },
                new { Code = "L", Description = "Liter" },
                new { Code = "HR", Description = "Hour" },
                new { Code = "DAY", Description = "Day" },
                new { Code = "MONTH", Description = "Month" },
                new { Code = "PACK", Description = "Package" }
            };

            var now = DateTime.UtcNow;
            var newCodes = codesToSeed
                .Where(code => !existingCodes.Contains(code.Code))
                .Select(code => new UniteCode
                {
                    Code = code.Code,
                    Description = code.Description,
                    CreatedAt = now,
                    UpdatedAt = now
                })
                .ToList();

            if (newCodes.Any())
            {
                context.UniteCodes.AddRange(newCodes);
                await context.SaveChangesAsync();
            }
        }

        private static async Task SeedLignesElementTypesAsync(ApplicationDbContext context)
        {
            var existingCodes = await context.LignesElementTypes.Select(let => let.Code).ToListAsync();
            var elementTypesToSeed = new[]
            {
                new { 
                    Code = "ITEM", 
                    TypeElement = ElementType.Item, 
                    Description = "Default element type for items", 
                    TableName = "Items" 
                },
                new { 
                    Code = "GENERAL_ACCOUNT", 
                    TypeElement = ElementType.GeneralAccounts, 
                    Description = "Default element type for general accounts", 
                    TableName = "GeneralAccounts" 
                }
            };

            var now = DateTime.UtcNow;
            var newElementTypes = elementTypesToSeed
                .Where(elementType => !existingCodes.Contains(elementType.Code))
                .Select(elementType => new LignesElementType
                {
                    Code = elementType.Code,
                    TypeElement = elementType.TypeElement,
                    Description = elementType.Description,
                    TableName = elementType.TableName,
                    ItemCode = null, // These are generic types, not tied to specific items/accounts
                    AccountCode = null,
                    CreatedAt = now,
                    UpdatedAt = now
                })
                .ToList();

            if (newElementTypes.Any())
            {
                context.LignesElementTypes.AddRange(newElementTypes);
                await context.SaveChangesAsync();
            }
        }
    }
} 