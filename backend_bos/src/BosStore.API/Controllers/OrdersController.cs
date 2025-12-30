using BosStore.API.DTOs;
using BosStore.API.Hubs;
using BosStore.Application.Common.Interfaces;
using BosStore.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace BosStore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IHubContext<OrderHub> _hubContext;

    public OrdersController(IUnitOfWork unitOfWork, IHubContext<OrderHub> hubContext)
    {
        _unitOfWork = unitOfWork;
        _hubContext = hubContext;
    }

    [HttpGet]
    [Authorize]
    public async Task<ActionResult<IEnumerable<object>>> GetAll()
    {
        var orders = await _unitOfWork.Orders.GetAllAsync();

        // Map to DTOs to avoid circular reference issues
        var orderDtos = orders.Select(o => new
        {
            o.Id,
            o.TenantId,
            o.CustomerName,
            o.CustomerPhone,
            o.Status,
            o.DeliveryMethod,
            o.PaymentMethod,
            o.Total,
            o.Currency,
            o.Street,
            o.Number,
            o.Neighborhood,
            o.Floor,
            o.Apartment,
            o.Reference,
            o.CreatedAt,
            OrderItems = o.OrderItems.Select(item => new
            {
                item.Id,
                item.Type,
                item.ProductId,
                item.PromotionId,
                item.Quantity,
                item.UnitPrice,
                item.LineTotal
            }).ToList()
        });

        return Ok(orderDtos);
    }

    [HttpGet("{id}")]
    [AllowAnonymous] // Para que el cliente pueda trackear su pedido
    public async Task<ActionResult<object>> GetById(string id)
    {
        var order = await _unitOfWork.Orders.GetByIdAsync(id);
        if (order == null)
            return NotFound();

        // Map to DTO to avoid circular reference issues
        var orderDto = new
        {
            order.Id,
            order.TenantId,
            order.CustomerName,
            order.CustomerPhone,
            order.Status,
            order.DeliveryMethod,
            order.PaymentMethod,
            order.Total,
            order.Currency,
            order.Street,
            order.Number,
            order.Neighborhood,
            order.Floor,
            order.Apartment,
            order.Reference,
            order.CreatedAt,
            OrderItems = order.OrderItems.Select(item => new
            {
                item.Id,
                item.Type,
                item.ProductId,
                item.PromotionId,
                item.Quantity,
                item.UnitPrice,
                item.LineTotal
            }).ToList()
        };

        return Ok(orderDto);
    }

    [HttpPost]
    [AllowAnonymous] // Permitir crear pedidos sin auth (desde el storefront)
    public async Task<ActionResult<Order>> Create([FromBody] CreateOrderRequest request)
    {
        var order = new Order
        {
            Id = request.Id ?? Guid.NewGuid().ToString(),
            TenantId = request.TenantId,
            CustomerName = request.CustomerName,
            CustomerPhone = request.CustomerPhone,
            Status = request.Status,
            DeliveryMethod = request.DeliveryMethod,
            PaymentMethod = request.PaymentMethod,
            Total = request.Total,
            Currency = request.Currency,
            Street = request.Street,
            Number = request.Number,
            Neighborhood = request.Neighborhood,
            Floor = request.Floor,
            Apartment = request.Apartment,
            Reference = request.Reference,
            OrderItems = request.OrderItems.Select(item => new OrderItem
            {
                Id = Guid.NewGuid().ToString(),
                Type = item.Type,
                ProductId = item.ProductId,
                PromotionId = item.PromotionId,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice,
                LineTotal = item.LineTotal
            }).ToList()
        };

        var created = await _unitOfWork.Orders.AddAsync(order);
        await _unitOfWork.SaveChangesAsync();

        // Create a DTO for SignalR to avoid circular reference issues
        var orderDto = new
        {
            created.Id,
            created.TenantId,
            created.CustomerName,
            created.CustomerPhone,
            created.Status,
            created.DeliveryMethod,
            created.PaymentMethod,
            created.Total,
            created.Currency,
            created.Street,
            created.Number,
            created.Neighborhood,
            created.Floor,
            created.Apartment,
            created.Reference,
            created.CreatedAt,
            OrderItems = created.OrderItems.Select(item => new
            {
                item.Id,
                item.Type,
                item.ProductId,
                item.PromotionId,
                item.Quantity,
                item.UnitPrice,
                item.LineTotal
            }).ToList()
        };

        // Notify clients via SignalR
        await _hubContext.Clients.Group($"order_{created.Id}").SendAsync("OrderCreated", orderDto);
        await _hubContext.Clients.Group($"tenant_{created.TenantId}").SendAsync("OrderCreated", orderDto);

        return CreatedAtAction(nameof(GetById), new { id = created.Id }, orderDto);
    }

    [HttpPut("{id}/status")]
    [Authorize]
    public async Task<IActionResult> UpdateStatus(string id, [FromBody] UpdateStatusRequest request)
    {
        var order = await _unitOfWork.Orders.GetByIdAsync(id);
        if (order == null)
            return NotFound();

        order.Status = request.Status;
        await _unitOfWork.Orders.UpdateAsync(order);
        await _unitOfWork.SaveChangesAsync();

        // Notify clients via SignalR about status change
        await _hubContext.Clients.Group($"order_{order.Id}").SendAsync("OrderStatusChanged", new { orderId = order.Id, status = order.Status });
        await _hubContext.Clients.Group($"tenant_{order.TenantId}").SendAsync("OrderStatusChanged", new { orderId = order.Id, status = order.Status });

        return NoContent();
    }

    [HttpGet("status/{status}")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<Order>>> GetByStatus(string status)
    {
        var orders = await _unitOfWork.Orders.FindAsync(o => o.Status == status);
        return Ok(orders);
    }
}

public record UpdateStatusRequest(string Status);
