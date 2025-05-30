using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace DocManagementBackend.Models {
    public class Ligne
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public int DocumentId { get; set; }
        [ForeignKey("DocumentId")]
        [JsonIgnore]
        public Document? Document { get; set; }
        public string LigneKey { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Article { get; set; } = string.Empty;
        [Obsolete("Use PriceHT instead")]
        public float Prix { get; set; }
        public int SousLigneCounter { get; set; } = 0;
        public int? TypeId { get; set; }
        [ForeignKey("TypeId")]
        public LignesElementType? Type { get; set; }
        [MaxLength(50)]
        public string? ItemCode { get; set; }
        [ForeignKey("ItemCode")]
        public Item? Item { get; set; }
        [MaxLength(50)]
        public string? GeneralAccountsCode { get; set; }
        [ForeignKey("GeneralAccountsCode")]
        public GeneralAccounts? GeneralAccounts { get; set; }
        [Column(TypeName = "decimal(18,4)")]
        public decimal Quantity { get; set; } = 1;
        [Column(TypeName = "decimal(18,4)")]
        public decimal PriceHT { get; set; } = 0;
        [Column(TypeName = "decimal(5,4)")]
        public decimal DiscountPercentage { get; set; } = 0;
        [Column(TypeName = "decimal(18,4)")]
        public decimal? DiscountAmount { get; set; }
        [Column(TypeName = "decimal(5,4)")]
        public decimal VatPercentage { get; set; } = 0;
        [NotMapped]
        public decimal AmountHT
        {
            get
            {
                if (DiscountAmount.HasValue)
                {
                    return PriceHT * Quantity - DiscountAmount.Value;
                }
                else
                {
                    return PriceHT * Quantity * (1 - DiscountPercentage);
                }
            }
        }
        [NotMapped]
        public decimal AmountVAT
        {
            get
            {
                return AmountHT * VatPercentage;
            }
        }
        [NotMapped]
        public decimal AmountTTC
        {
            get
            {
                return AmountHT + AmountVAT;
            }
        }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        [JsonIgnore]
        public ICollection<SousLigne> SousLignes { get; set; } = new List<SousLigne>();
        public void UpdateCalculatedFields()
        {
            // This method can be called before saving to update any stored calculated values
            // if you decide to store them in the database instead of computing them
        }
        public bool IsValid()
        {
            if (Quantity <= 0) return false;
            if (PriceHT < 0) return false;
            if (DiscountPercentage < 0 || DiscountPercentage > 1) return false;
            if (VatPercentage < 0 || VatPercentage > 1) return false;
            if (DiscountAmount.HasValue && DiscountAmount.Value < 0) return false;
            return true;
        }
    }

    public class SousLigne
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public int LigneId { get; set; }
        [ForeignKey("LigneId")]
        [JsonIgnore]
        public Ligne? Ligne { get; set; }
        public string SousLigneKey { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Attribute { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}