using BosStore.Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BosStore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "SuperAdmin")]
public class SuperAdminController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;

    public SuperAdminController(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    [HttpGet("tenants")]
    public async Task<ActionResult<IEnumerable<object>>> GetAllTenants()
    {
        var tenants = await _unitOfWork.Tenants.GetAllAsync();
        var orders = await _unitOfWork.Orders.GetAllAsync();
        var products = await _unitOfWork.Products.GetAllAsync();
        var users = await _unitOfWork.Users.GetAllAsync();

        var tenantDtos = tenants.Select(t =>
        {
            var tenantOrders = orders.Where(o => o.TenantId == t.Id).ToList();
            var tenantProducts = products.Where(p => p.TenantId == t.Id).ToList();
            var tenantUsers = users.Where(u => u.TenantId == t.Id).ToList();
            var ownerUser = tenantUsers.FirstOrDefault();

            return new
            {
                t.Id,
                t.Name,
                t.Subdomain,
                t.IsActive,
                t.CreatedAt,
                OwnerEmail = ownerUser?.Email ?? "N/A",
                OwnerName = ownerUser?.Name ?? "N/A",
                Metrics = new
                {
                    TotalOrders = tenantOrders.Count,
                    TotalRevenue = tenantOrders.Sum(o => o.Total),
                    TotalProducts = tenantProducts.Count,
                    TotalUsers = tenantUsers.Count
                }
            };
        }).OrderByDescending(t => t.CreatedAt);

        return Ok(tenantDtos);
    }

    [HttpGet("tenants/{id}")]
    public async Task<ActionResult<object>> GetTenantById(string id)
    {
        var tenant = await _unitOfWork.Tenants.GetByIdAsync(id);
        if (tenant == null)
            return NotFound();

        var orders = await _unitOfWork.Orders.FindAsync(o => o.TenantId == id);
        var products = await _unitOfWork.Products.FindAsync(p => p.TenantId == id);
        var users = await _unitOfWork.Users.FindAsync(u => u.TenantId == id);
        var ownerUser = users.FirstOrDefault();

        var tenantDto = new
        {
            tenant.Id,
            tenant.Name,
            tenant.Subdomain,
            tenant.IsActive,
            tenant.CreatedAt,
            tenant.UpdatedAt,
            OwnerEmail = ownerUser?.Email ?? "N/A",
            OwnerName = ownerUser?.Name ?? "N/A",
            Metrics = new
            {
                TotalOrders = orders.Count(),
                TotalRevenue = orders.Sum(o => o.Total),
                TotalProducts = products.Count(),
                TotalUsers = users.Count(),
                RecentOrders = orders.OrderByDescending(o => o.CreatedAt).Take(10).Select(o => new
                {
                    o.Id,
                    o.CustomerName,
                    o.Total,
                    o.Status,
                    o.CreatedAt
                })
            }
        };

        return Ok(tenantDto);
    }

    [HttpPut("tenants/{id}/toggle-status")]
    public async Task<IActionResult> ToggleTenantStatus(string id)
    {
        var tenant = await _unitOfWork.Tenants.GetByIdAsync(id);
        if (tenant == null)
            return NotFound();

        tenant.IsActive = !tenant.IsActive;
        await _unitOfWork.Tenants.UpdateAsync(tenant);
        await _unitOfWork.SaveChangesAsync();

        return Ok(new { tenant.Id, tenant.IsActive });
    }

    [HttpGet("stats")]
    public async Task<ActionResult<object>> GetGlobalStats()
    {
        var tenants = await _unitOfWork.Tenants.GetAllAsync();
        var orders = await _unitOfWork.Orders.GetAllAsync();

        var stats = new
        {
            TotalTenants = tenants.Count(),
            ActiveTenants = tenants.Count(t => t.IsActive),
            InactiveTenants = tenants.Count(t => !t.IsActive),
            TotalOrders = orders.Count(),
            TotalRevenue = orders.Sum(o => o.Total),
            RecentTenants = tenants.OrderByDescending(t => t.CreatedAt).Take(5).Select(t => new
            {
                t.Id,
                t.Name,
                t.Subdomain,
                t.CreatedAt
            })
        };

        return Ok(stats);
    }
}
