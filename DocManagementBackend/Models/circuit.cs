using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
// using System.Text.Json.Serialization;

namespace DocManagementBackend.Models {
    public class Circuit
    {
        [Key]
        public int Id { get; set; }

        public string CircuitKey { get; set; } = string.Empty;

        [Required]
        public string Title { get; set; } = string.Empty;

        public string Descriptif { get; set; } = string.Empty;

        public bool IsActive { get; set; } = true;

        public int CrdCounter { get; set; } = 0;

        public bool HasOrderedFlow { get; set; } = true;

        public ICollection<CircuitDetail> CircuitDetails { get; set; } = new List<CircuitDetail>();
    }

    public class CircuitDetail
    {
        [Key]
        public int Id { get; set; }

        public string CircuitDetailKey { get; set; } = string.Empty;

        [Required]
        public int CircuitId { get; set; }

        [ForeignKey("CircuitId")]
        public Circuit? Circuit { get; set; }

        [Required]
        public string Title { get; set; } = string.Empty;

        public string Descriptif { get; set; } = string.Empty;

        public int OrderIndex { get; set; } = 0;

        public int? ResponsibleRoleId { get; set; }
        [ForeignKey("ResponsibleRoleId")]
        public Role? ResponsibleRole { get; set; }
    }
}