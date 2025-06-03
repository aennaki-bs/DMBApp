using Microsoft.EntityFrameworkCore;
using DocManagementBackend.Models;

namespace DocManagementBackend.Data
{
    public static class DataSeeder
    {
        public static async Task SeedDataAsync(ApplicationDbContext context)
        {
            // Only seed UniteCodes - remove items and general accounts seeding
            await SeedUniteCodesAsync(context);
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
    }
} 