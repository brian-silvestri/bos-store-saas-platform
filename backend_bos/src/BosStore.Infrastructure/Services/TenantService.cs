using BosStore.Application.Common.Interfaces;

namespace BosStore.Infrastructure.Services;

public interface ITenantService
{
    string? GetCurrentTenantId();
    void SetTenantId(string tenantId);
}

public class TenantService : ITenantService
{
    private string? _currentTenantId;

    public string? GetCurrentTenantId() => _currentTenantId;

    public void SetTenantId(string tenantId)
    {
        _currentTenantId = tenantId;
    }
}
