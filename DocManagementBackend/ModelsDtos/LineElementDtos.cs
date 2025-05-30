namespace DocManagementBackend.Models
{
    // LignesElementType DTOs
    public class LignesElementTypeDto
    {
        public int Id { get; set; }
        public string TypeElement { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string TableName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }

    public class CreateLignesElementTypeRequest
    {
        public string TypeElement { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string TableName { get; set; } = string.Empty;
    }

    public class UpdateLignesElementTypeRequest
    {
        public string? TypeElement { get; set; }
        public string? Description { get; set; }
        public string? TableName { get; set; }
    }

    // Item DTOs
    public class ItemDto
    {
        public string Code { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? Unite { get; set; }
        public UniteCodeDto? UniteCodeNavigation { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int LignesCount { get; set; }
    }

    public class CreateItemRequest
    {
        public string Code { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? Unite { get; set; }
    }

    public class UpdateItemRequest
    {
        public string? Description { get; set; }
        public string? Unite { get; set; }
    }

    // UniteCode DTOs
    public class UniteCodeDto
    {
        public string Code { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int ItemsCount { get; set; }
    }

    public class CreateUniteCodeRequest
    {
        public string Code { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class UpdateUniteCodeRequest
    {
        public string? Description { get; set; }
    }

    // GeneralAccounts DTOs
    public class GeneralAccountsDto
    {
        public string Code { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int LignesCount { get; set; }
    }

    public class CreateGeneralAccountsRequest
    {
        public string Code { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class UpdateGeneralAccountsRequest
    {
        public string? Description { get; set; }
    }

    // Enhanced Ligne request DTOs
    public class CreateLigneRequest
    {
        public int DocumentId { get; set; }
        public string LigneKey { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Article { get; set; } = string.Empty;
        
        // Type and element references
        public int? TypeId { get; set; }
        public string? ItemCode { get; set; }
        public string? GeneralAccountsCode { get; set; }
        
        // Pricing fields
        public decimal Quantity { get; set; } = 1;
        public decimal PriceHT { get; set; } = 0;
        public decimal DiscountPercentage { get; set; } = 0;
        public decimal? DiscountAmount { get; set; }
        public decimal VatPercentage { get; set; } = 0;
    }

    public class UpdateLigneRequest
    {
        public string? LigneKey { get; set; }
        public string? Title { get; set; }
        public string? Article { get; set; }
        
        // Type and element references
        public int? TypeId { get; set; }
        public string? ItemCode { get; set; }
        public string? GeneralAccountsCode { get; set; }
        
        // Pricing fields
        public decimal? Quantity { get; set; }
        public decimal? PriceHT { get; set; }
        public decimal? DiscountPercentage { get; set; }
        public decimal? DiscountAmount { get; set; }
        public decimal? VatPercentage { get; set; }
    }

    // Simple DTOs for dropdowns
    public class LignesElementTypeSimpleDto
    {
        public int Id { get; set; }
        public string TypeElement { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class ItemSimpleDto
    {
        public string Code { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string? Unite { get; set; }
    }

    public class UniteCodeSimpleDto
    {
        public string Code { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class GeneralAccountsSimpleDto
    {
        public string Code { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }
} 