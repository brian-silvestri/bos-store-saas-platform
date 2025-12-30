using BosStore.Domain.Common;

namespace BosStore.Domain.Entities;

public class Tenant : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string Subdomain { get; set; } = string.Empty; // Para multi-tenancy por subdomain si lo necesitas
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public ICollection<StoreConfig> StoreConfigs { get; set; } = new List<StoreConfig>();
    public ICollection<User> Users { get; set; } = new List<User>();
    public ICollection<Category> Categories { get; set; } = new List<Category>();
    public ICollection<Product> Products { get; set; } = new List<Product>();
    public ICollection<Promotion> Promotions { get; set; } = new List<Promotion>();
    public ICollection<Order> Orders { get; set; } = new List<Order>();
}
