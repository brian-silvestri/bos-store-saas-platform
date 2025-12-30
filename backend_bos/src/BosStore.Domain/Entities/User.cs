using BosStore.Domain.Common;

namespace BosStore.Domain.Entities;

public class User : BaseEntity, ITenantEntity
{
    public string TenantId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = "Admin"; // Admin, Owner, etc.
    public string Name { get; set; } = string.Empty;

    // Navigation properties
    public Tenant Tenant { get; set; } = null!;
}
