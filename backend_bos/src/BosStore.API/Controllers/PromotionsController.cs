using BosStore.Application.Common.Interfaces;
using BosStore.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BosStore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PromotionsController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;

    public PromotionsController(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<Promotion>>> GetAll()
    {
        var promotions = await _unitOfWork.Promotions.GetAllAsync();
        return Ok(promotions);
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<ActionResult<Promotion>> GetById(string id)
    {
        var promotion = await _unitOfWork.Promotions.GetByIdAsync(id);
        if (promotion == null)
            return NotFound();

        return Ok(promotion);
    }

    [HttpGet("active")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<Promotion>>> GetActive()
    {
        var promotions = await _unitOfWork.Promotions.FindAsync(p => p.Active);
        return Ok(promotions);
    }

    [HttpPost]
    public async Task<ActionResult<Promotion>> Create([FromBody] Promotion promotion)
    {
        var created = await _unitOfWork.Promotions.AddAsync(promotion);
        await _unitOfWork.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] Promotion promotion)
    {
        if (id != promotion.Id)
            return BadRequest();

        var existing = await _unitOfWork.Promotions.GetByIdAsync(id);
        if (existing == null)
            return NotFound();

        await _unitOfWork.Promotions.UpdateAsync(promotion);
        await _unitOfWork.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        await _unitOfWork.Promotions.DeleteAsync(id);
        await _unitOfWork.SaveChangesAsync();

        return NoContent();
    }
}
