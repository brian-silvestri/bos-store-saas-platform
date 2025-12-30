namespace BosStore.Domain.Entities;

public class Subscription
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string TenantId { get; set; } = string.Empty;
    public string PlanId { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty; // 'active', 'expired', 'cancelled', 'suspended'
    public string? LicenseCode { get; set; } // Código usado para activar (nullable)
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int MaxUsers { get; set; }
    public string Features { get; set; } = string.Empty; // JSON array
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public Tenant Tenant { get; set; } = null!;
    public Plan Plan { get; set; } = null!;
}
