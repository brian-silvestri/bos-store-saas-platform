using BosStore.Domain.Common;

namespace BosStore.Domain.Entities;

public class OrderItem : BaseEntity
{
    public string OrderId { get; set; } = string.Empty;
    public string Type { get; set; } = "product"; // product or promotion
    public string? ProductId { get; set; }
    public string? PromotionId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal LineTotal { get; set; }

    // Navigation properties
    public Order Order { get; set; } = null!;
    public Product? Product { get; set; }
    public Promotion? Promotion { get; set; }
}
