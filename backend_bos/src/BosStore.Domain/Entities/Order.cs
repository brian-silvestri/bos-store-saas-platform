using BosStore.Domain.Common;

namespace BosStore.Domain.Entities;

public class Order : BaseEntity, ITenantEntity
{
    public string TenantId { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string Status { get; set; } = "pending"; // pending, confirmed, preparing, ready, delivered, canceled
    public string DeliveryMethod { get; set; } = "pickup"; // pickup, delivery
    public string PaymentMethod { get; set; } = "cash"; // transfer, card, cash
    public decimal Total { get; set; }
    public string Currency { get; set; } = "ARS";

    // Address fields (nullable for pickup orders)
    public string? Street { get; set; }
    public string? Number { get; set; }
    public string? Neighborhood { get; set; }
    public string? Floor { get; set; }
    public string? Apartment { get; set; }
    public string? Reference { get; set; }

    // Navigation properties
    public Tenant Tenant { get; set; } = null!;
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}
