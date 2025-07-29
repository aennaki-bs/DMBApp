# Data Layer Documentation

## Overview
The Data layer contains the core database access and configuration components for the Document Management System. This layer uses Entity Framework Core for database operations and includes database context configuration, entity relationships, and data seeding functionality.

## Table of Contents
1. [ApplicationDbContext](#applicationdbcontext)
2. [DataSeeder](#dataseeder)  
3. [Entity Configuration](#entity-configuration)
4. [Database Relationships](#database-relationships)
5. [Migration Strategy](#migration-strategy)
6. [Performance Considerations](#performance-considerations)

---

## ApplicationDbContext

### Overview
**File**: `ApplicationDbContext.cs`
**Purpose**: Main Entity Framework Core DbContext that manages all database entities and their configurations.

### Entity Sets (DbSets)

#### Core Entities
```csharp
public DbSet<User> Users { get; set; }
public DbSet<Role> Roles { get; set; }
public DbSet<Document> Documents { get; set; }
public DbSet<DocumentType> DocumentTypes { get; set; }
public DbSet<SubType> SubTypes { get; set; }
public DbSet<ResponsibilityCentre> ResponsibilityCentres { get; set; }
```

#### Document Line System
```csharp
public DbSet<Ligne> Lignes { get; set; }
public DbSet<SousLigne> SousLignes { get; set; }
public DbSet<LignesElementType> LignesElementTypes { get; set; }
```

#### Reference Data
```csharp
public DbSet<Item> Items { get; set; }
public DbSet<GeneralAccounts> GeneralAccounts { get; set; }
public DbSet<Customer> Customers { get; set; }
public DbSet<Vendor> Vendors { get; set; }
public DbSet<Location> Locations { get; set; }
public DbSet<UnitOfMeasure> UnitOfMeasures { get; set; }
public DbSet<ItemUnitOfMeasure> ItemUnitOfMeasures { get; set; }
```

#### Workflow System
```csharp
public DbSet<Circuit> Circuits { get; set; }
public DbSet<Status> Status { get; set; }
public DbSet<Step> Steps { get; set; }
public DbSet<DocumentStatus> DocumentStatus { get; set; }
public DbSet<DocumentCircuitHistory> DocumentCircuitHistory { get; set; }
public DbSet<DocumentStepHistory> DocumentStepHistory { get; set; }
```

#### Approval System
```csharp
public DbSet<Approvator> Approvators { get; set; }
public DbSet<ApprovatorsGroup> ApprovatorsGroups { get; set; }
public DbSet<ApprovatorsGroupUser> ApprovatorsGroupUsers { get; set; }
public DbSet<ApprovatorsGroupRule> ApprovatorsGroupRules { get; set; }
public DbSet<ApprovalWriting> ApprovalWritings { get; set; }
public DbSet<ApprovalResponse> ApprovalResponses { get; set; }
public DbSet<StepApprovalAssignment> StepApprovalAssignments { get; set; }
```

#### Support Systems  
```csharp
public DbSet<LogHistory> LogHistories { get; set; }
public DbSet<ErpArchivalError> ErpArchivalErrors { get; set; }
public DbSet<ApiSyncConfiguration> ApiSyncConfigurations { get; set; }
public DbSet<TypeCounter> TypeCounter { get; set; }
```

### Key Entity Configurations

#### Unique Constraints
```csharp
// ResponsibilityCentre unique constraint on Code
modelBuilder.Entity<ResponsibilityCentre>()
    .HasIndex(rc => rc.Code)
    .IsUnique();

// ERP Document Code unique index
modelBuilder.Entity<Document>()
    .HasIndex(d => d.ERPDocumentCode)
    .IsUnique()
    .HasFilter("[ERPDocumentCode] IS NOT NULL");
```

#### Complex Relationships

##### User-ResponsibilityCentre Relationship
```csharp
modelBuilder.Entity<User>()
    .HasOne(u => u.ResponsibilityCentre)
    .WithMany(rc => rc.Users)
    .HasForeignKey(u => u.ResponsibilityCentreId)
    .OnDelete(DeleteBehavior.Restrict)
    .IsRequired(false);
```

##### Document User Relationships
```csharp
// CreatedBy relationship
modelBuilder.Entity<Document>()
    .HasOne(d => d.CreatedBy)
    .WithMany()
    .HasForeignKey(d => d.CreatedByUserId)
    .OnDelete(DeleteBehavior.Restrict)
    .IsRequired();

// UpdatedBy relationship
modelBuilder.Entity<Document>()
    .HasOne(d => d.UpdatedBy)
    .WithMany()
    .HasForeignKey(d => d.UpdatedByUserId) 
    .OnDelete(DeleteBehavior.Restrict)
    .IsRequired(false);
```

##### Dynamic Customer/Vendor Relationships
```csharp
// Customer relationship (conditional based on TierType)
modelBuilder.Entity<Document>()
    .HasOne(d => d.Customer)
    .WithMany(c => c.Documents)
    .HasForeignKey(d => d.CustomerOrVendor)
    .OnDelete(DeleteBehavior.Restrict)
    .IsRequired(false);

// Vendor relationship (conditional based on TierType)  
modelBuilder.Entity<Document>()
    .HasOne(d => d.Vendor)
    .WithMany(v => v.Documents)
    .HasForeignKey(d => d.CustomerOrVendor)
    .OnDelete(DeleteBehavior.Restrict)
    .IsRequired(false);
```

##### Approval System Relationships
```csharp
// ApprovalWriting to Step relationship
modelBuilder.Entity<ApprovalWriting>()
    .HasOne(aw => aw.Step)
    .WithMany()
    .HasForeignKey(aw => aw.StepId)
    .OnDelete(DeleteBehavior.Restrict);

// ApprovalWriting to Document relationship
modelBuilder.Entity<ApprovalWriting>()
    .HasOne(aw => aw.Document)
    .WithMany()
    .HasForeignKey(aw => aw.DocumentId)
    .OnDelete(DeleteBehavior.Cascade);
```

#### Delete Behavior Patterns

| Relationship Type | Delete Behavior | Reason |
|------------------|----------------|---------|
| User References | `Restrict` | Preserve audit trail, prevent orphaned records |
| Document-Line | `Cascade` | Lines should be deleted with parent document |
| Reference Data | `Restrict` | Maintain referential integrity |
| Workflow History | `Restrict` | Preserve historical data |
| Approval Responses | `Cascade` | Clean up when approval is deleted |

### Performance Configurations

#### Indexing Strategy
```csharp
// Frequently queried fields
modelBuilder.Entity<Document>()
    .HasIndex(d => d.Status);
    
modelBuilder.Entity<Document>()
    .HasIndex(d => d.CircuitId);
    
modelBuilder.Entity<Document>()
    .HasIndex(d => d.TypeId);

// Composite indexes for common queries
modelBuilder.Entity<Document>()
    .HasIndex(d => new { d.ResponsibilityCentreId, d.Status });
```

#### Query Optimization
```csharp
// Configure decimal precision for financial fields
modelBuilder.Entity<Ligne>()
    .Property(l => l.PriceHT)
    .HasColumnType("decimal(18,4)");

modelBuilder.Entity<Ligne>()
    .Property(l => l.Quantity)
    .HasColumnType("decimal(18,4)");
```

### Connection Configuration

#### Database Provider Configuration
```csharp
public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

// Configured in Program.cs:
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString, b => 
        b.MigrationsAssembly("DocManagementBackend")));
```

#### Connection String Pattern
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=DMV;Integrated Security=true;TrustServerCertificate=true;"
  }
}
```

---

## DataSeeder

### Overview
**File**: `DataSeeder.cs`
**Purpose**: Provides database initialization and seeding of essential data for system operation.

### Seeding Strategy

#### Main Seeding Method
```csharp
public static async Task SeedDataAsync(ApplicationDbContext context)
{
    // Seed default LignesElementTypes for the dynamic system
    await SeedLignesElementTypesAsync(context);
    
    // Seed DocumentTypes with TypeNumber
    await SeedDocumentTypesAsync(context);
}
```

### Document Types Seeding

#### Customer Document Types (0-9)
```csharp
new { TypeNumber = 0, TypeName = "sales Quote", TypeKey = "SQ", TypeAttr = "Quote", TierType = TierType.Customer },
new { TypeNumber = 1, TypeName = "sales Order", TypeKey = "SO", TypeAttr = "Order", TierType = TierType.Customer },
new { TypeNumber = 2, TypeName = "sales Invoice", TypeKey = "SI", TypeAttr = "Invoice", TierType = TierType.Customer },
new { TypeNumber = 3, TypeName = "sales Credit Memo", TypeKey = "SCM", TypeAttr = "Credit Memo", TierType = TierType.Customer },
new { TypeNumber = 4, TypeName = "sales Blanket Order", TypeKey = "CBO", TypeAttr = "Blanket Order", TierType = TierType.Customer },
new { TypeNumber = 5, TypeName = "sales Return Order", TypeKey = "CRO", TypeAttr = "Return Order", TierType = TierType.Customer }
```

#### Vendor Document Types (10-19)
```csharp
new { TypeNumber = 10, TypeName = "Purchase Quote", TypeKey = "PQ", TypeAttr = "Quote", TierType = TierType.Vendor },
new { TypeNumber = 11, TypeName = "Purchase Order", TypeKey = "PO", TypeAttr = "Order", TierType = TierType.Vendor },
new { TypeNumber = 12, TypeName = "Purchase Invoice", TypeKey = "PI", TypeAttr = "Invoice", TierType = TierType.Vendor },
new { TypeNumber = 13, TypeName = "Purchase Credit Memo", TypeKey = "PCM", TypeAttr = "Credit Memo", TierType = TierType.Vendor },
new { TypeNumber = 14, TypeName = "Purchase Blanket Order", TypeKey = "PBO", TypeAttr = "Blanket Order", TierType = TierType.Vendor },
new { TypeNumber = 15, TypeName = "Purchase Return Order", TypeKey = "VRO", TypeAttr = "Return Order", TierType = TierType.Vendor }
```

### Line Element Types Seeding

#### Default Element Types
```csharp
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
```

### Seeding Logic Features

#### Duplicate Prevention
```csharp
// Check for existing data before seeding
var existingTypeNumbers = await context.DocumentTypes.Select(dt => dt.TypeNumber).ToListAsync();
var existingCodes = await context.LignesElementTypes.Select(let => let.Code).ToListAsync();

// Only seed new items
var newDocumentTypes = documentTypesToSeed
    .Where(docType => !existingTypeNumbers.Contains(docType.TypeNumber))
    .Select(docType => new DocumentType { /* ... */ })
    .ToList();
```

#### Transactional Seeding
```csharp
if (newDocumentTypes.Any())
{
    context.DocumentTypes.AddRange(newDocumentTypes);
    await context.SaveChangesAsync();
}
```

### Usage Pattern

#### Startup Integration  
```csharp
// In Program.cs
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await DataSeeder.SeedDataAsync(context);
}
```

---

## Entity Configuration

### Configuration Patterns

#### Standard Entity Configuration
```csharp
// Primary key
[Key]
public int Id { get; set; }

// Required fields
[Required]
public string Name { get; set; } = string.Empty;

// Maximum length constraints
[MaxLength(50)]
public string Code { get; set; } = string.Empty;

// Foreign key relationships
public int CreatedByUserId { get; set; }
[ForeignKey("CreatedByUserId")]
public User CreatedBy { get; set; }
```

#### Audit Fields Pattern
```csharp
public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
public int CreatedByUserId { get; set; }
public int? UpdatedByUserId { get; set; }
```

#### Soft Delete Pattern
```csharp
public bool IsDeleted { get; set; } = false;

// Query filter (applied in OnModelCreating)
modelBuilder.Entity<Document>()
    .HasQueryFilter(d => !d.IsDeleted);
```

### Dynamic Foreign Key System

#### Customer/Vendor Dynamic Reference
```csharp
// Document entity
[MaxLength(50)]
public string? CustomerOrVendor { get; set; }

// Navigation properties resolved based on DocumentType.TierType
[ForeignKey("CustomerOrVendor")]
public Customer? Customer { get; set; }

[ForeignKey("CustomerOrVendor")]  
public Vendor? Vendor { get; set; }
```

#### Element Type Dynamic Reference
```csharp
// Ligne entity
public int? Type { get; set; } // FK to LignesElementType
[MaxLength(50)]
public string? ElementId { get; set; } // Dynamic FK to Item/GeneralAccount

// Resolved based on LignesElementType.TypeElement
```

---

## Database Relationships

### Relationship Hierarchy

```
ResponsibilityCentre
├── Users (1:Many)
└── Documents (1:Many)

User
├── Documents (CreatedBy - 1:Many)
├── Documents (UpdatedBy - 1:Many)
├── LogHistories (1:Many)
└── ApprovalResponses (1:Many)

Document
├── Lignes (1:Many)
├── DocumentCircuitHistory (1:Many)
├── DocumentStepHistory (1:Many)
├── ApprovalWritings (1:Many)
└── DocumentStatus (1:Many)

Circuit
├── Steps (1:Many)
├── Statuses (1:Many)
└── Documents (1:Many)

Step
├── ApprovalWritings (1:Many)
├── Approvator (1:1 optional)
└── ApprovatorsGroup (1:1 optional)
```

### Complex Relationships

#### Approval System Relationships
```
ApprovalWriting
├── Document (Many:1)
├── Step (Many:1) 
├── Approvator (Many:1 optional)
├── ApprovatorsGroup (Many:1 optional)
└── ApprovalResponses (1:Many)

ApprovatorsGroup
├── ApprovatorsGroupUsers (1:Many)
├── ApprovatorsGroupRules (1:Many)
└── ApprovalWritings (1:Many)
```

#### Line System Relationships
```
Document
└── Lignes (1:Many)
    ├── SousLignes (1:Many)
    ├── LignesElementType (Many:1)
    ├── Item (Many:1 via ElementId)
    ├── GeneralAccount (Many:1 via ElementId)
    ├── Location (Many:1)
    └── UnitOfMeasure (Many:1)
```

---

## Migration Strategy

### Migration Commands
```bash
# Add new migration
dotnet ef migrations add MigrationName

# Update database
dotnet ef database update

# Rollback to specific migration
dotnet ef database update PreviousMigrationName

# Generate migration script
dotnet ef migrations script
```

### Migration Best Practices

#### Data Migration Pattern
```csharp
// In migration Up() method
migrationBuilder.Sql(@"
    UPDATE Documents 
    SET ERPDocumentCode = NULL 
    WHERE ERPDocumentCode = ''
");

// In migration Down() method  
migrationBuilder.Sql(@"
    -- Rollback script
    UPDATE Documents 
    SET ERPDocumentCode = '' 
    WHERE ERPDocumentCode IS NULL
");
```

#### Index Management
```csharp
// Add index
migrationBuilder.CreateIndex(
    name: "IX_Documents_ERPDocumentCode",
    table: "Documents",
    column: "ERPDocumentCode",
    unique: true,
    filter: "[ERPDocumentCode] IS NOT NULL");

// Drop index
migrationBuilder.DropIndex(
    name: "IX_Documents_ERPDocumentCode",
    table: "Documents");
```

### Recent Migration: Action System Removal

#### Migration: `RemoveActionsSystem`
- **Date**: July 2025
- **Purpose**: Remove Action, StepAction, and ActionStatusEffect entities
- **Impact**: Simplified workflow processing

```csharp
// Tables removed
migrationBuilder.DropTable("ActionStatusEffects");
migrationBuilder.DropTable("StepActions");
migrationBuilder.DropTable("Actions");

// Columns removed
migrationBuilder.DropColumn("ActionId", "DocumentCircuitHistory");
```

---

## Performance Considerations

### Query Optimization

#### Include Strategies
```csharp
// Explicit loading for related data
var documents = await context.Documents
    .Include(d => d.CreatedBy).ThenInclude(u => u.Role)
    .Include(d => d.DocumentType)
    .Include(d => d.SubType)
    .Include(d => d.CurrentStatus)
    .Include(d => d.Circuit)
    .Include(d => d.Lignes)
    .Where(d => !d.IsDeleted)
    .ToListAsync();
```

#### Projection for Performance
```csharp
// Use projection for large result sets
var documentSummaries = await context.Documents
    .Where(d => d.Status == 1)
    .Select(d => new DocumentSummaryDto
    {
        Id = d.Id,
        Title = d.Title,
        DocumentKey = d.DocumentKey,
        CreatedAt = d.CreatedAt
    })
    .ToListAsync();
```

### Caching Strategy

#### Entity-Level Caching
```csharp
// Cache frequently accessed reference data
private static readonly MemoryCache _cache = new MemoryCache(new MemoryCacheOptions());

public async Task<List<DocumentType>> GetCachedDocumentTypesAsync()
{
    return await _cache.GetOrCreateAsync("DocumentTypes", async entry =>
    {
        entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(1);
        return await context.DocumentTypes.ToListAsync();
    });
}
```

#### Query Result Caching
```csharp
// Cache expensive aggregate queries
public async Task<DashboardStats> GetCachedDashboardStatsAsync(int userId)
{
    return await _cache.GetOrCreateAsync($"DashboardStats_{userId}", async entry =>
    {
        entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(15);
        
        return new DashboardStats
        {
            TotalDocuments = await context.Documents.CountAsync(),
            PendingApprovals = await GetPendingApprovalsCountAsync(userId),
            ActiveCircuits = await context.Circuits.Where(c => c.IsActive).CountAsync()
        };
    });
}
```

### Database Optimization

#### Connection Pooling
```csharp
// In Program.cs
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString, sqlOptions =>
    {
        sqlOptions.EnableRetryOnFailure(
            maxRetryCount: 3,
            maxRetryDelay: TimeSpan.FromSeconds(5),
            errorNumbersToAdd: null);
    }));
```

#### Query Splitting
```csharp
// For complex queries with multiple collections
var documents = await context.Documents
    .AsSplitQuery()
    .Include(d => d.Lignes).ThenInclude(l => l.SousLignes)
    .Include(d => d.DocumentCircuitHistory)
    .Include(d => d.ApprovalWritings)
    .ToListAsync();
```

### Monitoring and Diagnostics

#### Query Logging
```json
{
  "Logging": {
    "LogLevel": {
      "Microsoft.EntityFrameworkCore.Database.Command": "Information"
    }
  }
}
```

#### Performance Tracking
```csharp
// Custom logging for slow queries
public class QueryPerformanceInterceptor : DbCommandInterceptor
{
    public override ValueTask<InterceptionResult<DbDataReader>> ReaderExecutingAsync(
        DbCommand command,
        CommandEventData eventData,
        InterceptionResult<DbDataReader> result,
        CancellationToken cancellationToken = default)
    {
        var stopwatch = Stopwatch.StartNew();
        // Track execution time and log slow queries
        return base.ReaderExecutingAsync(command, eventData, result, cancellationToken);
    }
}
```

---

## Best Practices

### Entity Design
1. **Use meaningful names** for entities and properties
2. **Apply appropriate constraints** (Required, MaxLength, etc.)
3. **Include audit fields** for all business entities
4. **Use enums** for constrained value sets
5. **Implement soft delete** for important business data

### Relationship Design
1. **Use Restrict delete behavior** for audit trail preservation
2. **Use Cascade delete** only for true parent-child relationships
3. **Index foreign keys** that are frequently queried
4. **Consider navigation property performance** impact

### Migration Management
1. **Review migration scripts** before applying to production
2. **Include data migration** when changing existing data structure
3. **Test rollback scenarios** for critical migrations
4. **Backup database** before applying major migrations

### Performance Guidelines
1. **Use projection** for read-only scenarios
2. **Implement caching** for frequently accessed data
3. **Monitor query performance** in production
4. **Use split queries** for complex includes
5. **Implement proper indexing** strategy

This documentation provides a comprehensive guide to the Data layer architecture and implementation patterns used throughout the Document Management System. 