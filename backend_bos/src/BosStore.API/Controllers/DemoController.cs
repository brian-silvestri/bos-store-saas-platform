using BosStore.Application.Common.Interfaces;
using BosStore.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace BosStore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DemoController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;

    public DemoController(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    [HttpPost("seed")]
    public async Task<IActionResult> SeedDemoData()
    {
        const string tenantId = "tenant-demo";

        // Verificar si ya tiene productos
        var existingProducts = await _unitOfWork.Products.FindAsync(p => p.TenantId == tenantId);
        if (existingProducts.Any())
        {
            return Ok(new { message = "Demo data already exists" });
        }

        // Crear categorías
        var pizzasCategory = new Category
        {
            Id = Guid.NewGuid().ToString(),
            TenantId = tenantId,
            Name = "Pizzas",
            Description = "Pizzas caseras artesanales",
            Order = 1,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var bebidasCategory = new Category
        {
            Id = Guid.NewGuid().ToString(),
            TenantId = tenantId,
            Name = "Bebidas",
            Description = "Bebidas frías",
            Order = 2,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var combosCategory = new Category
        {
            Id = Guid.NewGuid().ToString(),
            TenantId = tenantId,
            Name = "Combos",
            Description = "Combos especiales",
            Order = 3,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Categories.AddAsync(pizzasCategory);
        await _unitOfWork.Categories.AddAsync(bebidasCategory);
        await _unitOfWork.Categories.AddAsync(combosCategory);

        // Crear productos
        var products = new List<Product>
        {
            new Product
            {
                Id = Guid.NewGuid().ToString(),
                TenantId = tenantId,
                CategoryId = pizzasCategory.Id,
                Name = "Pizza Muzzarella",
                Description = "Pizza clásica con muzzarella de primera calidad",
                Price = 4500,
                ImageUrl = "",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Product
            {
                Id = Guid.NewGuid().ToString(),
                TenantId = tenantId,
                CategoryId = pizzasCategory.Id,
                Name = "Pizza Napolitana",
                Description = "Muzzarella, tomate, ajo y albahaca",
                Price = 5200,
                ImageUrl = "",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Product
            {
                Id = Guid.NewGuid().ToString(),
                TenantId = tenantId,
                CategoryId = pizzasCategory.Id,
                Name = "Pizza Calabresa",
                Description = "Muzzarella, longaniza calabresa y aceitunas",
                Price = 5800,
                ImageUrl = "",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Product
            {
                Id = Guid.NewGuid().ToString(),
                TenantId = tenantId,
                CategoryId = pizzasCategory.Id,
                Name = "Pizza Cuatro Quesos",
                Description = "Muzzarella, roquefort, provolone y parmesano",
                Price = 6200,
                ImageUrl = "",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Product
            {
                Id = Guid.NewGuid().ToString(),
                TenantId = tenantId,
                CategoryId = bebidasCategory.Id,
                Name = "Coca Cola 1.5L",
                Description = "Coca Cola 1.5 litros",
                Price = 1200,
                ImageUrl = "",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Product
            {
                Id = Guid.NewGuid().ToString(),
                TenantId = tenantId,
                CategoryId = bebidasCategory.Id,
                Name = "Sprite 1.5L",
                Description = "Sprite 1.5 litros",
                Price = 1200,
                ImageUrl = "",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Product
            {
                Id = Guid.NewGuid().ToString(),
                TenantId = tenantId,
                CategoryId = bebidasCategory.Id,
                Name = "Agua Mineral 1L",
                Description = "Agua mineral sin gas",
                Price = 800,
                ImageUrl = "",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            },
            new Product
            {
                Id = Guid.NewGuid().ToString(),
                TenantId = tenantId,
                CategoryId = combosCategory.Id,
                Name = "Combo Para 2",
                Description = "2 pizzas muzza + 2 bebidas 1.5L",
                Price = 10500,
                ImageUrl = "",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            }
        };

        foreach (var product in products)
        {
            await _unitOfWork.Products.AddAsync(product);
        }

        await _unitOfWork.SaveChangesAsync();

        return Ok(new
        {
            message = "Demo data seeded successfully",
            categories = 3,
            products = products.Count
        });
    }
}
