namespace BosStore.Domain.Entities;

// Join table for many-to-many relationship
public class PromotionProduct
{
    public string PromotionId { get; set; } = string.Empty;
    public string ProductId { get; set; } = string.Empty;

    public Promotion Promotion { get; set; } = null!;
    public Product Product { get; set; } = null!;
}
