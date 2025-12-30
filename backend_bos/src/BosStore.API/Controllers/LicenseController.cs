using BosStore.API.Services;
using BosStore.Application.Common.Interfaces;
using BosStore.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BosStore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LicenseController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly LicenseCodeService _licenseService;

    public LicenseController(IUnitOfWork unitOfWork, LicenseCodeService licenseService)
    {
        _unitOfWork = unitOfWork;
        _licenseService = licenseService;
    }

    // ========== SUPER ADMIN ENDPOINTS ==========

    [HttpGet("plans")]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<ActionResult<IEnumerable<Plan>>> GetAllPlans()
    {
        var plans = await _unitOfWork.Plans.GetAllAsync();
        return Ok(plans);
    }

    [HttpPost("plans")]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<ActionResult<Plan>> CreatePlan([FromBody] CreatePlanRequest request)
    {
        var plan = new Plan
        {
            Id = request.Id,
            Name = request.Name,
            Description = request.Description,
            Price = request.Price,
            DurationDays = request.DurationDays,
            MaxUsers = request.MaxUsers,
            Features = request.Features,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Plans.AddAsync(plan);
        await _unitOfWork.SaveChangesAsync();

        return Ok(plan);
    }

    [HttpPost("generate-code")]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<ActionResult<LicenseCodeResponse>> GenerateLicenseCode([FromBody] GenerateLicenseCodeRequest request)
    {
        var plan = await _unitOfWork.Plans.GetByIdAsync(request.PlanId);
        if (plan == null)
            return BadRequest("Plan not found");

        var code = _licenseService.GenerateLicenseCode(plan.Id);

        // Verificar que el código sea único
        var existing = await _unitOfWork.LicenseCodes.GetByIdAsync(code);
        while (existing != null)
        {
            code = _licenseService.GenerateLicenseCode(plan.Id);
            existing = await _unitOfWork.LicenseCodes.GetByIdAsync(code);
        }

        var licenseCode = new LicenseCode
        {
            Code = code,
            PlanId = request.PlanId,
            DurationDays = request.DurationDays ?? plan.DurationDays,
            IsUsed = false,
            ExpiresAt = DateTime.UtcNow.AddDays(request.CodeExpirationDays ?? 90),
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.LicenseCodes.AddAsync(licenseCode);
        await _unitOfWork.SaveChangesAsync();

        return Ok(new LicenseCodeResponse
        {
            Code = licenseCode.Code,
            PlanId = licenseCode.PlanId,
            PlanName = plan.Name,
            DurationDays = licenseCode.DurationDays,
            ExpiresAt = licenseCode.ExpiresAt,
            CreatedAt = licenseCode.CreatedAt
        });
    }

    [HttpGet("codes")]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<ActionResult<IEnumerable<object>>> GetAllLicenseCodes()
    {
        var codes = await _unitOfWork.LicenseCodes.GetAllAsync();

        var result = codes.Select(c => new
        {
            c.Code,
            c.PlanId,
            c.DurationDays,
            c.IsUsed,
            c.UsedByTenantId,
            c.UsedAt,
            c.ExpiresAt,
            c.CreatedAt,
            IsExpired = DateTime.UtcNow > c.ExpiresAt
        });

        return Ok(result);
    }

    [HttpDelete("codes/{code}")]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<ActionResult> RevokeLicenseCode(string code)
    {
        var licenseCode = await _unitOfWork.LicenseCodes.GetByIdAsync(code);
        if (licenseCode == null)
            return NotFound("License code not found");

        if (licenseCode.IsUsed)
            return BadRequest("Cannot revoke a code that has already been used");

        await _unitOfWork.LicenseCodes.DeleteAsync(code);
        await _unitOfWork.SaveChangesAsync();

        return Ok(new { message = "License code revoked successfully" });
    }

    [HttpPost("create-trial/{tenantId}")]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<ActionResult<SubscriptionResponse>> CreateTrialSubscription(string tenantId)
    {
        // Check if tenant exists
        var tenant = await _unitOfWork.Tenants.GetByIdAsync(tenantId);
        if (tenant == null)
            return NotFound("Tenant not found");

        // Check if trial plan exists
        var trialPlan = await _unitOfWork.Plans.GetByIdAsync("trial");
        if (trialPlan == null)
            return BadRequest("Trial plan not found");

        // Check if tenant already has a subscription
        var existingSubscriptions = await _unitOfWork.Subscriptions.FindAsync(s => s.TenantId == tenantId);
        if (existingSubscriptions.Any())
            return BadRequest("Tenant already has a subscription");

        // Create trial subscription
        var subscription = new Subscription
        {
            Id = Guid.NewGuid().ToString(),
            TenantId = tenantId,
            PlanId = "trial",
            Status = "active",
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddDays(14),
            MaxUsers = 1,
            Features = "[\"basic\"]",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Subscriptions.AddAsync(subscription);
        await _unitOfWork.SaveChangesAsync();

        return Ok(new SubscriptionResponse
        {
            Id = subscription.Id,
            PlanId = subscription.PlanId,
            PlanName = trialPlan.Name,
            Status = subscription.Status,
            StartDate = subscription.StartDate,
            EndDate = subscription.EndDate,
            DaysRemaining = (int)(subscription.EndDate - DateTime.UtcNow).TotalDays
        });
    }

    // ========== TENANT ENDPOINTS ==========

    [HttpPost("activate")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<SubscriptionResponse>> ActivateLicense([FromBody] ActivateLicenseRequest request)
    {
        // Get tenant ID from token
        var tenantId = User.Claims.FirstOrDefault(c => c.Type == "TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantId))
            return Unauthorized("Invalid token");

        // Validate license code
        var licenseCode = await _unitOfWork.LicenseCodes.GetByIdAsync(request.LicenseCode);
        if (licenseCode == null)
            return BadRequest("Invalid license code");

        if (licenseCode.IsUsed)
            return BadRequest("This license code has already been used");

        if (DateTime.UtcNow > licenseCode.ExpiresAt)
            return BadRequest("This license code has expired");

        // Get plan
        var plan = await _unitOfWork.Plans.GetByIdAsync(licenseCode.PlanId);
        if (plan == null)
            return BadRequest("Plan not found");

        // Check if tenant already has an active subscription
        var existingSubscriptions = await _unitOfWork.Subscriptions.FindAsync(s => s.TenantId == tenantId && s.Status == "active");
        var activeSubscription = existingSubscriptions.FirstOrDefault();

        if (activeSubscription != null)
        {
            // Extend existing subscription
            activeSubscription.EndDate = activeSubscription.EndDate.AddDays(licenseCode.DurationDays);
            activeSubscription.UpdatedAt = DateTime.UtcNow;
        }
        else
        {
            // Create new subscription
            var subscription = new Subscription
            {
                Id = Guid.NewGuid().ToString(),
                TenantId = tenantId,
                PlanId = licenseCode.PlanId,
                Status = "active",
                LicenseCode = licenseCode.Code,
                StartDate = DateTime.UtcNow,
                EndDate = DateTime.UtcNow.AddDays(licenseCode.DurationDays),
                MaxUsers = plan.MaxUsers,
                Features = plan.Features,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _unitOfWork.Subscriptions.AddAsync(subscription);
            activeSubscription = subscription;
        }

        // Mark license code as used
        licenseCode.IsUsed = true;
        licenseCode.UsedByTenantId = tenantId;
        licenseCode.UsedAt = DateTime.UtcNow;

        await _unitOfWork.SaveChangesAsync();

        return Ok(new SubscriptionResponse
        {
            Id = activeSubscription.Id,
            PlanId = activeSubscription.PlanId,
            PlanName = plan.Name,
            Status = activeSubscription.Status,
            StartDate = activeSubscription.StartDate,
            EndDate = activeSubscription.EndDate,
            DaysRemaining = (int)(activeSubscription.EndDate - DateTime.UtcNow).TotalDays
        });
    }

    [HttpGet("subscription")]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<SubscriptionResponse>> GetMySubscription()
    {
        var tenantId = User.Claims.FirstOrDefault(c => c.Type == "TenantId")?.Value;
        if (string.IsNullOrEmpty(tenantId))
            return Unauthorized("Invalid token");

        var subscriptions = await _unitOfWork.Subscriptions.FindAsync(s => s.TenantId == tenantId);
        var subscription = subscriptions.OrderByDescending(s => s.EndDate).FirstOrDefault();

        if (subscription == null)
            return NotFound("No subscription found");

        var plan = await _unitOfWork.Plans.GetByIdAsync(subscription.PlanId);

        return Ok(new SubscriptionResponse
        {
            Id = subscription.Id,
            PlanId = subscription.PlanId,
            PlanName = plan?.Name ?? "Unknown",
            Status = subscription.Status,
            StartDate = subscription.StartDate,
            EndDate = subscription.EndDate,
            DaysRemaining = (int)(subscription.EndDate - DateTime.UtcNow).TotalDays
        });
    }
}

// DTOs
public record CreatePlanRequest(
    string Id,
    string Name,
    string Description,
    decimal Price,
    int DurationDays,
    int MaxUsers,
    string Features
);

public record GenerateLicenseCodeRequest(
    string PlanId,
    int? DurationDays,
    int? CodeExpirationDays
);

public record LicenseCodeResponse
{
    public string Code { get; set; } = string.Empty;
    public string PlanId { get; set; } = string.Empty;
    public string PlanName { get; set; } = string.Empty;
    public int DurationDays { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; }
}

public record ActivateLicenseRequest(string LicenseCode);

public record SubscriptionResponse
{
    public string Id { get; set; } = string.Empty;
    public string PlanId { get; set; } = string.Empty;
    public string PlanName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int DaysRemaining { get; set; }
}
