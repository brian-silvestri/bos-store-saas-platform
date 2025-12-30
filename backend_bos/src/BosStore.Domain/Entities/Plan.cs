namespace BosStore.Domain.Entities;

public class Plan
{
    public string Id { get; set; } = string.Empty; // 'trial', 'pro', 'enterprise'
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int DurationDays { get; set; }
    public int MaxUsers { get; set; }
    public string Features { get; set; } = string.Empty; // JSON array de features
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
