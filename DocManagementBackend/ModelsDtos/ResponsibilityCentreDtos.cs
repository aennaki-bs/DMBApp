namespace DocManagementBackend.Models
{
    public class CreateResponsibilityCentreRequest
    {
        public string Code { get; set; } = string.Empty;
        public string Descr { get; set; } = string.Empty;
    }

    public class UpdateResponsibilityCentreRequest
    {
        public string? Code { get; set; }
        public string? Descr { get; set; }
        public bool? IsActive { get; set; }
    }

    public class ResponsibilityCentreDto
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Descr { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public bool IsActive { get; set; }
        public int UsersCount { get; set; }
        public int DocumentsCount { get; set; }
    }

    public class ResponsibilityCentreSimpleDto
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Descr { get; set; } = string.Empty;
        public bool IsActive { get; set; }
    }
} 