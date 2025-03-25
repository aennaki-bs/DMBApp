namespace DocManagementBackend.Models
{
    public class CircuitDto
    {
        public string CircuitId { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Descriptif { get; set; } = string.Empty;
        public bool IsActive { get; set; } = true;
    }

    public class CircuitDetailDto
    {
        public string CircuitDetailId { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Descriptif { get; set; } = string.Empty;
        // public bool IsActive { get; set; } = true;
    }
}