using System.Linq.Expressions;
using BosStore.Application.Common.Interfaces;
using BosStore.Domain.Entities;
using BosStore.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace BosStore.Infrastructure.Repositories;

public class OrderRepository : Repository<Order>
{
    public OrderRepository(AppDbContext context) : base(context)
    {
    }

    public override async Task<Order?> GetByIdAsync(string id)
    {
        return await _dbSet
            .Include(o => o.OrderItems)
            .FirstOrDefaultAsync(o => o.Id == id);
    }

    public override async Task<IEnumerable<Order>> GetAllAsync()
    {
        return await _dbSet
            .Include(o => o.OrderItems)
            .ToListAsync();
    }

    public override async Task<IEnumerable<Order>> FindAsync(Expression<Func<Order, bool>> predicate)
    {
        return await _dbSet
            .Include(o => o.OrderItems)
            .Where(predicate)
            .ToListAsync();
    }
}
