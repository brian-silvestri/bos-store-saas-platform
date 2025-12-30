namespace BosStore.API.DTOs;

public record CreateOrderRequest
{
    public string? Id { get; init; }
    public string TenantId { get; init; } = string.Empty;
    public string CustomerName { get; init; } = string.Empty;
    public string CustomerPhone { get; init; } = string.Empty;
    public string? CustomerEmail { get; init; }
    public string Status { get; init; } = "pending";
    public string DeliveryMethod { get; init; } = "pickup";
    public string PaymentMethod { get; init; } = "cash";
    public decimal Total { get; init; }
    public string Currency { get; init; } = "ARS";
    public string? Street { get; init; }
    public string? Number { get; init; }
    public string? Neighborhood { get; init; }
    public string? Floor { get; init; }
    public string? Apartment { get; init; }
    public string? Reference { get; init; }
    public List<CreateOrderItemRequest> OrderItems { get; init; } = new();
}

public record CreateOrderItemRequest
{
    public string Type { get; init; } = string.Empty;
    public string? ProductId { get; init; }
    public string? PromotionId { get; init; }
    public int Quantity { get; init; }
    public decimal UnitPrice { get; init; }
    public decimal LineTotal { get; init; }
}
