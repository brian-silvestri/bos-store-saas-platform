using BosStore.Domain.Common;

namespace BosStore.Domain.Entities;

public class Product : BaseEntity, ITenantEntity
{
    public string TenantId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public decimal? Price { get; set; }
    public string CategoryId { get; set; } = string.Empty;
    public bool IsPromotion { get; set; } = false;
    public string? ImageUrl { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public int Stock { get; set; } = 0;

    // Navigation properties
    public Tenant Tenant { get; set; } = null!;
    public Category Category { get; set; } = null!;
    public ICollection<PromotionProduct> PromotionProducts { get; set; } = new List<PromotionProduct>();
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}
