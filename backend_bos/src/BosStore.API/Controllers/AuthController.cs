using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BosStore.Application.Common.Interfaces;
using BosStore.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace BosStore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IConfiguration _configuration;

    public AuthController(IUnitOfWork unitOfWork, IConfiguration configuration)
    {
        _unitOfWork = unitOfWork;
        _configuration = configuration;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        // Verificar si el tenant existe, si no existe crearlo automáticamente
        var tenant = await _unitOfWork.Tenants.GetByIdAsync(request.TenantId);
        if (tenant == null)
        {
            tenant = new Tenant
            {
                Id = request.TenantId,
                Name = request.Name,
                Subdomain = request.TenantId.ToLower(),
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            await _unitOfWork.Tenants.AddAsync(tenant);
        }

        // Verificar si el email ya existe
        var existingUsers = await _unitOfWork.Users.FindAsync(u => u.Email == request.Email && u.TenantId == request.TenantId);
        if (existingUsers.Any())
            return BadRequest("Email already exists");

        // Hash password (en producción usa BCrypt o similar)
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        var user = new User
        {
            TenantId = request.TenantId,
            Email = request.Email,
            PasswordHash = passwordHash,
            Name = request.Name,
            Role = "Admin"
        };

        await _unitOfWork.Users.AddAsync(user);

        // Auto-crear trial subscription de 14 días
        var trialSubscription = new Subscription
        {
            Id = Guid.NewGuid().ToString(),
            TenantId = request.TenantId,
            PlanId = "trial",
            Status = "active",
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddDays(14),
            MaxUsers = 1,
            Features = "[\"basic\"]",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Subscriptions.AddAsync(trialSubscription);
        await _unitOfWork.SaveChangesAsync();

        var token = GenerateJwtToken(user);

        return Ok(new AuthResponse
        {
            Token = token,
            TenantId = user.TenantId,
            Email = user.Email,
            Name = user.Name
        });
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        var users = await _unitOfWork.Users.FindAsync(u => u.Email == request.Email);
        var user = users.FirstOrDefault();

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return Unauthorized("Invalid credentials");

        var token = GenerateJwtToken(user);

        return Ok(new AuthResponse
        {
            Token = token,
            TenantId = user.TenantId,
            Email = user.Email,
            Name = user.Name
        });
    }

    [HttpPost("create-superadmin")]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<ActionResult<AuthResponse>> CreateSuperAdmin([FromBody] CreateSuperAdminRequest request)
    {
        // Verificar que no exista ya un SuperAdmin con ese email
        var existingUsers = await _unitOfWork.Users.FindAsync(u => u.Email == request.Email);
        if (existingUsers.Any())
            return BadRequest("Email already exists");

        // Crear tenant global si no existe
        var globalTenant = await _unitOfWork.Tenants.GetByIdAsync("global");
        if (globalTenant == null)
        {
            globalTenant = new Tenant
            {
                Id = "global",
                Name = "Global Admin",
                Subdomain = "admin",
                IsActive = true
            };
            await _unitOfWork.Tenants.AddAsync(globalTenant);
            await _unitOfWork.SaveChangesAsync();
        }

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        var superAdmin = new User
        {
            Id = Guid.NewGuid().ToString(),
            TenantId = "global",
            Email = request.Email,
            PasswordHash = passwordHash,
            Name = request.Name,
            Role = "SuperAdmin"
        };

        await _unitOfWork.Users.AddAsync(superAdmin);
        await _unitOfWork.SaveChangesAsync();

        var token = GenerateJwtToken(superAdmin);

        return Ok(new AuthResponse
        {
            Token = token,
            TenantId = superAdmin.TenantId,
            Email = superAdmin.Email,
            Name = superAdmin.Name
        });
    }

    private string GenerateJwtToken(User user)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey not configured");
        var issuer = jwtSettings["Issuer"];
        var audience = jwtSettings["Audience"];
        var expirationMinutes = int.Parse(jwtSettings["ExpirationMinutes"] ?? "1440");

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim("TenantId", user.TenantId),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

public record RegisterRequest(string TenantId, string Email, string Password, string Name);
public record LoginRequest(string Email, string Password);
public record CreateSuperAdminRequest(string Email, string Password, string Name);
public record AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public string TenantId { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
}
