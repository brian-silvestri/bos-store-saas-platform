using BosStore.Application.Common.Interfaces;
using BosStore.Domain.Entities;
using BosStore.Infrastructure.Data;

namespace BosStore.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _context;

    public UnitOfWork(AppDbContext context)
    {
        _context = context;
        Tenants = new Repository<Tenant>(context);
        Users = new Repository<User>(context);
        StoreConfigs = new Repository<StoreConfig>(context);
        Categories = new Repository<Category>(context);
        Products = new Repository<Product>(context);
        Promotions = new Repository<Promotion>(context);
        Orders = new OrderRepository(context);
        OrderItems = new Repository<OrderItem>(context);
        Plans = new Repository<Plan>(context);
        Subscriptions = new Repository<Subscription>(context);
        LicenseCodes = new Repository<LicenseCode>(context);
    }

    public IRepository<Tenant> Tenants { get; }
    public IRepository<User> Users { get; }
    public IRepository<StoreConfig> StoreConfigs { get; }
    public IRepository<Category> Categories { get; }
    public IRepository<Product> Products { get; }
    public IRepository<Promotion> Promotions { get; }
    public IRepository<Order> Orders { get; }
    public IRepository<OrderItem> OrderItems { get; }
    public IRepository<Plan> Plans { get; }
    public IRepository<Subscription> Subscriptions { get; }
    public IRepository<LicenseCode> LicenseCodes { get; }

    public async Task<int> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync();
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}
