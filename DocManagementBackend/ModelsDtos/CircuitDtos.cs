namespace DocManagementBackend.Models
{
    public class CreateCircuitDto
    {
        public string Title { get; set; } = string.Empty;
        public string Descriptif { get; set; } = string.Empty;
        public bool HasOrderedFlow { get; set; } = false;
        public bool AllowBacktrack { get; set; } = false;
        public bool IsActive { get; set; } = false;
    }

    public class CircuitDto
    {
        public int Id { get; set; }
        public string CircuitKey { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Descriptif { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public bool HasOrderedFlow { get; set; }
        public bool AllowBacktrack { get; set; }
        public List<StepDto> Steps { get; set; } = new();
    }

    public class CreateStepDto
    {
        public string Title { get; set; } = string.Empty;
        public string Descriptif { get; set; } = string.Empty;
        public int OrderIndex { get; set; } = 0;
        public int? ResponsibleRoleId { get; set; }
    }
    public class UpdateStepDto
    {
        public string Title { get; set; } = string.Empty;
        public string Descriptif { get; set; } = string.Empty;
        public int OrderIndex { get; set; } = 0;
        public int? ResponsibleRoleId { get; set; }
    }

    public class StepDto
    {
        public int Id { get; set; }
        public string StepKey { get; set; } = string.Empty;
        public int CircuitId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Descriptif { get; set; } = string.Empty;
        public int OrderIndex { get; set; }
        public int? ResponsibleRoleId { get; set; }
        public bool IsFinalStep { get; set; }
    }

    public class StepOrderUpdateDto
    {
        public int StepId { get; set; }
        public int OrderIndex { get; set; }
    }
}