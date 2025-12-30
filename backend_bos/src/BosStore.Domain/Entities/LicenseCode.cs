namespace BosStore.Domain.Entities;

public class LicenseCode
{
    public string Code { get; set; } = string.Empty; // Primary key: 'BOS-PRO-X7K9-M2QA'
    public string PlanId { get; set; } = string.Empty;
    public int DurationDays { get; set; }
    public bool IsUsed { get; set; } = false;
    public string? UsedByTenantId { get; set; }
    public DateTime? UsedAt { get; set; }
    public DateTime ExpiresAt { get; set; } // El código en sí expira si no se usa
    public DateTime CreatedAt { get; set; }

    // Navigation properties
    public Plan Plan { get; set; } = null!;
    public Tenant? UsedByTenant { get; set; }
}
