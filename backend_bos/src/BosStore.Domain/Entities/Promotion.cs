using BosStore.Domain.Common;

namespace BosStore.Domain.Entities;

public class Promotion : BaseEntity, ITenantEntity
{
    public string TenantId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = "discount"; // discount, nxm, bundle
    public bool Active { get; set; } = true;
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public decimal? Price { get; set; }
    public decimal? Percentage { get; set; }
    public int? BuyQty { get; set; }
    public int? PayQty { get; set; }

    // Navigation properties
    public Tenant Tenant { get; set; } = null!;
    public ICollection<PromotionProduct> PromotionProducts { get; set; } = new List<PromotionProduct>();
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}
