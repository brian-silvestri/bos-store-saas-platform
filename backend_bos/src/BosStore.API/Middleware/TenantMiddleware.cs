using System.Security.Claims;
using BosStore.Infrastructure.Services;

namespace BosStore.API.Middleware;

public class TenantMiddleware
{
    private readonly RequestDelegate _next;

    public TenantMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, ITenantService tenantService)
    {
        // Try to get tenant from JWT claims
        var tenantId = context.User.FindFirst("TenantId")?.Value;

        // Fallback: get from header (útil para desarrollo/testing)
        if (string.IsNullOrEmpty(tenantId))
        {
            tenantId = context.Request.Headers["X-Tenant-Id"].FirstOrDefault();
        }

        if (!string.IsNullOrEmpty(tenantId))
        {
            tenantService.SetTenantId(tenantId);
        }

        await _next(context);
    }
}
