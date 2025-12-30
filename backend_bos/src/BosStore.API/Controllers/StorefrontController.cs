using BosStore.Application.Common.Interfaces;
using BosStore.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BosStore.API.Controllers;

[ApiController]
[Route("api/storefront")]
public class StorefrontController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;

    public StorefrontController(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    // GET /api/storefront/{slug}
    [HttpGet("{slug}")]
    public async Task<ActionResult<StorefrontResponse>> GetStoreBySlug(string slug)
    {
        // Find tenant by subdomain/slug
        var tenants = await _unitOfWork.Tenants.FindAsync(t => t.Subdomain == slug);
        var tenant = tenants.FirstOrDefault();

        if (tenant == null || !tenant.IsActive)
            return NotFound(new { message = "Store not found" });

        // Get store config for this tenant
        var storeConfigs = await _unitOfWork.StoreConfigs.FindAsync(s => s.TenantId == tenant.Id);
        var storeConfig = storeConfigs.FirstOrDefault();

        if (storeConfig == null)
            return NotFound(new { message = "Store configuration not found" });

        // Get active products for this tenant
        var products = await _unitOfWork.Products.FindAsync(p =>
            p.TenantId == tenant.Id && p.IsActive);

        // Get active categories for this tenant
        var categories = await _unitOfWork.Categories.FindAsync(c =>
            c.TenantId == tenant.Id && c.IsActive);

        // Get active promotions for this tenant
        var promotions = await _unitOfWork.Promotions.FindAsync(p =>
            p.TenantId == tenant.Id && p.Active);

        return Ok(new StorefrontResponse
        {
            TenantId = tenant.Id,
            TenantName = tenant.Name,
            Slug = tenant.Subdomain,
            Store = new StoreInfo
            {
                Name = storeConfig.Name,
                LogoUrl = storeConfig.LogoUrl,
                PrimaryColor = storeConfig.PrimaryColor,
                SecondaryColor = storeConfig.SecondaryColor,
                ThemeKey = storeConfig.ThemeKey,
                Currency = storeConfig.Currency,
                Address = storeConfig.Address,
                WhatsappNumber = storeConfig.WhatsappNumber,
                SocialMedia = new List<SocialMediaLink>
                {
                    new SocialMediaLink
                    {
                        Type = storeConfig.SocialMedia1Type,
                        Url = storeConfig.SocialMedia1Url
                    },
                    new SocialMediaLink
                    {
                        Type = storeConfig.SocialMedia2Type,
                        Url = storeConfig.SocialMedia2Url
                    },
                    new SocialMediaLink
                    {
                        Type = storeConfig.SocialMedia3Type,
                        Url = storeConfig.SocialMedia3Url
                    }
                }.Where(s => !string.IsNullOrEmpty(s.Type)).ToList()
            },
            Products = products.Select(p => new ProductInfo
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Price = p.Price ?? 0,
                ImageUrl = p.ImageUrl,
                CategoryId = p.CategoryId,
                IsPromotion = p.IsPromotion,
                Stock = p.Stock
            }).ToList(),
            Categories = categories.Select(c => new CategoryInfo
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description
            }).ToList(),
            Promotions = promotions.Select(p => new PromotionInfo
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                DiscountPercentage = p.Percentage ?? 0,
                ImageUrl = p.ImageUrl,
                StartDate = p.CreatedAt,
                EndDate = p.UpdatedAt ?? DateTime.UtcNow.AddDays(30)
            }).ToList()
        });
    }

    // GET /api/storefront/{slug}/products
    [HttpGet("{slug}/products")]
    public async Task<ActionResult<IEnumerable<ProductInfo>>> GetStoreProducts(string slug)
    {
        var tenants = await _unitOfWork.Tenants.FindAsync(t => t.Subdomain == slug);
        var tenant = tenants.FirstOrDefault();

        if (tenant == null || !tenant.IsActive)
            return NotFound(new { message = "Store not found" });

        var products = await _unitOfWork.Products.FindAsync(p =>
            p.TenantId == tenant.Id && p.IsActive);

        return Ok(products.Select(p => new ProductInfo
        {
            Id = p.Id,
            Name = p.Name,
            Description = p.Description,
            Price = p.Price ?? 0,
            ImageUrl = p.ImageUrl,
            CategoryId = p.CategoryId,
            IsPromotion = p.IsPromotion,
            Stock = p.Stock
        }));
    }

    // GET /api/storefront/{slug}/product/{productId}
    [HttpGet("{slug}/product/{productId}")]
    public async Task<ActionResult<ProductInfo>> GetStoreProduct(string slug, string productId)
    {
        var tenants = await _unitOfWork.Tenants.FindAsync(t => t.Subdomain == slug);
        var tenant = tenants.FirstOrDefault();

        if (tenant == null || !tenant.IsActive)
            return NotFound(new { message = "Store not found" });

        var product = await _unitOfWork.Products.GetByIdAsync(productId);

        if (product == null || product.TenantId != tenant.Id || !product.IsActive)
            return NotFound(new { message = "Product not found" });

        return Ok(new ProductInfo
        {
            Id = product.Id,
            Name = product.Name,
            Description = product.Description,
            Price = product.Price ?? 0,
            ImageUrl = product.ImageUrl,
            CategoryId = product.CategoryId,
            IsPromotion = product.IsPromotion,
            Stock = product.Stock
        });
    }

    // POST /api/storefront/{slug}/order
    [HttpPost("{slug}/order")]
    public async Task<ActionResult<OrderResponse>> CreateOrder(string slug, [FromBody] StorefrontOrderRequest request)
    {
        var tenants = await _unitOfWork.Tenants.FindAsync(t => t.Subdomain == slug);
        var tenant = tenants.FirstOrDefault();

        if (tenant == null || !tenant.IsActive)
            return NotFound(new { message = "Store not found" });

        // Validate that all products belong to this tenant
        foreach (var item in request.Items)
        {
            var product = await _unitOfWork.Products.GetByIdAsync(item.ProductId);
            if (product == null || product.TenantId != tenant.Id)
                return BadRequest(new { message = $"Invalid product: {item.ProductId}" });
        }

        // Create order
        var order = new Order
        {
            Id = $"ORD-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}",
            TenantId = tenant.Id,
            CustomerName = request.CustomerName,
            CustomerPhone = request.CustomerPhone,
            DeliveryMethod = request.DeliveryMethod,
            PaymentMethod = request.PaymentMethod,
            Street = request.Street,
            Number = request.Number,
            Floor = request.Floor,
            Apartment = request.Apartment,
            Neighborhood = request.Neighborhood,
            Reference = request.Reference,
            Total = decimal.Parse(request.Total),
            Currency = request.Currency,
            Status = "pending",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Orders.AddAsync(order);

        // Add order items
        foreach (var item in request.Items)
        {
            var orderItem = new OrderItem
            {
                Id = Guid.NewGuid().ToString(),
                OrderId = order.Id,
                ProductId = item.Type == "product" ? item.ProductId : null,
                PromotionId = item.Type == "promotion" ? item.ProductId : null,
                Type = item.Type,
                Quantity = item.Quantity,
                UnitPrice = decimal.Parse(item.UnitPrice),
                LineTotal = decimal.Parse(item.LineTotal),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _unitOfWork.OrderItems.AddAsync(orderItem);
        }

        await _unitOfWork.SaveChangesAsync();

        return Ok(new OrderResponse
        {
            OrderId = order.Id,
            Status = order.Status,
            Total = order.Total.ToString(),
            Currency = order.Currency
        });
    }
}

// DTOs
public record StorefrontResponse
{
    public string TenantId { get; set; } = string.Empty;
    public string TenantName { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public StoreInfo Store { get; set; } = new();
    public List<ProductInfo> Products { get; set; } = new();
    public List<CategoryInfo> Categories { get; set; } = new();
    public List<PromotionInfo> Promotions { get; set; } = new();
}

public record StoreInfo
{
    public string Name { get; set; } = string.Empty;
    public string LogoUrl { get; set; } = string.Empty;
    public string PrimaryColor { get; set; } = string.Empty;
    public string SecondaryColor { get; set; } = string.Empty;
    public string ThemeKey { get; set; } = string.Empty;
    public string Currency { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string WhatsappNumber { get; set; } = string.Empty;
    public List<SocialMediaLink> SocialMedia { get; set; } = new();
}

public record SocialMediaLink
{
    public string Type { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
}

public record ProductInfo
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string CategoryId { get; set; } = string.Empty;
    public bool IsPromotion { get; set; }
    public int Stock { get; set; }
}

public record CategoryInfo
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public record PromotionInfo
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal DiscountPercentage { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
}

public record StorefrontOrderRequest
{
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerPhone { get; set; } = string.Empty;
    public string DeliveryMethod { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = string.Empty;
    public string Street { get; set; } = string.Empty;
    public string Number { get; set; } = string.Empty;
    public string Floor { get; set; } = string.Empty;
    public string Apartment { get; set; } = string.Empty;
    public string Neighborhood { get; set; } = string.Empty;
    public string Reference { get; set; } = string.Empty;
    public string Total { get; set; } = string.Empty;
    public string Currency { get; set; } = string.Empty;
    public List<StorefrontOrderItemRequest> Items { get; set; } = new();
}

public record StorefrontOrderItemRequest
{
    public string ProductId { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public string UnitPrice { get; set; } = string.Empty;
    public string LineTotal { get; set; } = string.Empty;
}

public record OrderResponse
{
    public string OrderId { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Total { get; set; } = string.Empty;
    public string Currency { get; set; } = string.Empty;
}
