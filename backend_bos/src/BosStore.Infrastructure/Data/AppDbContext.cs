using BosStore.Domain.Common;
using BosStore.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace BosStore.Infrastructure.Data;

public class AppDbContext : DbContext
{
    private readonly string? _currentTenantId;

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public AppDbContext(DbContextOptions<AppDbContext> options, string? currentTenantId) : base(options)
    {
        _currentTenantId = currentTenantId;
    }

    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<User> Users => Set<User>();
    public DbSet<StoreConfig> StoreConfigs => Set<StoreConfig>();
    public DbSet<CarouselSlide> CarouselSlides => Set<CarouselSlide>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Promotion> Promotions => Set<Promotion>();
    public DbSet<PromotionProduct> PromotionProducts => Set<PromotionProduct>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Plan> Plans => Set<Plan>();
    public DbSet<Subscription> Subscriptions => Set<Subscription>();
    public DbSet<LicenseCode> LicenseCodes => Set<LicenseCode>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure OrderItem foreign keys as optional
        modelBuilder.Entity<OrderItem>()
            .HasOne(oi => oi.Product)
            .WithMany()
            .HasForeignKey(oi => oi.ProductId)
            .IsRequired(false);

        modelBuilder.Entity<OrderItem>()
            .HasOne(oi => oi.Promotion)
            .WithMany()
            .HasForeignKey(oi => oi.PromotionId)
            .IsRequired(false);

        // Configure PromotionProduct many-to-many
        modelBuilder.Entity<PromotionProduct>()
            .HasKey(pp => new { pp.PromotionId, pp.ProductId });

        modelBuilder.Entity<PromotionProduct>()
            .HasOne(pp => pp.Promotion)
            .WithMany(p => p.PromotionProducts)
            .HasForeignKey(pp => pp.PromotionId);

        modelBuilder.Entity<PromotionProduct>()
            .HasOne(pp => pp.Product)
            .WithMany(p => p.PromotionProducts)
            .HasForeignKey(pp => pp.ProductId);

        // Configure indexes for performance
        modelBuilder.Entity<Product>()
            .HasIndex(p => p.TenantId);

        modelBuilder.Entity<Category>()
            .HasIndex(c => c.TenantId);

        modelBuilder.Entity<Promotion>()
            .HasIndex(p => p.TenantId);

        modelBuilder.Entity<Order>()
            .HasIndex(o => o.TenantId);

        modelBuilder.Entity<User>()
            .HasIndex(u => new { u.TenantId, u.Email })
            .IsUnique();

        modelBuilder.Entity<Tenant>()
            .HasIndex(t => t.Subdomain)
            .IsUnique();

        // Configure Plan
        modelBuilder.Entity<Plan>()
            .HasKey(p => p.Id);

        // Configure Subscription
        modelBuilder.Entity<Subscription>()
            .HasOne(s => s.Tenant)
            .WithMany()
            .HasForeignKey(s => s.TenantId);

        modelBuilder.Entity<Subscription>()
            .HasOne(s => s.Plan)
            .WithMany()
            .HasForeignKey(s => s.PlanId);

        modelBuilder.Entity<Subscription>()
            .HasIndex(s => s.TenantId);

        modelBuilder.Entity<Subscription>()
            .HasIndex(s => new { s.TenantId, s.Status });

        // Configure LicenseCode
        modelBuilder.Entity<LicenseCode>()
            .HasKey(lc => lc.Code);

        modelBuilder.Entity<LicenseCode>()
            .HasOne(lc => lc.Plan)
            .WithMany()
            .HasForeignKey(lc => lc.PlanId);

        modelBuilder.Entity<LicenseCode>()
            .HasOne(lc => lc.UsedByTenant)
            .WithMany()
            .HasForeignKey(lc => lc.UsedByTenantId)
            .IsRequired(false);

        modelBuilder.Entity<LicenseCode>()
            .HasIndex(lc => lc.IsUsed);

        // Global query filter for multi-tenancy
        if (!string.IsNullOrEmpty(_currentTenantId))
        {
            modelBuilder.Entity<Product>().HasQueryFilter(e => e.TenantId == _currentTenantId);
            modelBuilder.Entity<Category>().HasQueryFilter(e => e.TenantId == _currentTenantId);
            modelBuilder.Entity<Promotion>().HasQueryFilter(e => e.TenantId == _currentTenantId);
            modelBuilder.Entity<Order>().HasQueryFilter(e => e.TenantId == _currentTenantId);
            modelBuilder.Entity<User>().HasQueryFilter(e => e.TenantId == _currentTenantId);
            modelBuilder.Entity<StoreConfig>().HasQueryFilter(e => e.TenantId == _currentTenantId);
        }
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Auto-set TenantId and timestamps
        foreach (var entry in ChangeTracker.Entries())
        {
            if (entry.Entity is ITenantEntity tenantEntity && entry.State == EntityState.Added)
            {
                if (string.IsNullOrEmpty(tenantEntity.TenantId) && !string.IsNullOrEmpty(_currentTenantId))
                {
                    tenantEntity.TenantId = _currentTenantId;
                }
            }

            if (entry.Entity is BaseEntity baseEntity)
            {
                if (entry.State == EntityState.Modified)
                {
                    baseEntity.UpdatedAt = DateTime.UtcNow;
                }
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}
