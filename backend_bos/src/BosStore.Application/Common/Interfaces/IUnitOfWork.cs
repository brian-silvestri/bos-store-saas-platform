using BosStore.Domain.Entities;

namespace BosStore.Application.Common.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IRepository<Tenant> Tenants { get; }
    IRepository<User> Users { get; }
    IRepository<StoreConfig> StoreConfigs { get; }
    IRepository<Category> Categories { get; }
    IRepository<Product> Products { get; }
    IRepository<Promotion> Promotions { get; }
    IRepository<Order> Orders { get; }
    IRepository<OrderItem> OrderItems { get; }
    IRepository<Plan> Plans { get; }
    IRepository<Subscription> Subscriptions { get; }
    IRepository<LicenseCode> LicenseCodes { get; }

    Task<int> SaveChangesAsync();
}
