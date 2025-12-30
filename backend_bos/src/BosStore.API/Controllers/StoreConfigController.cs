using BosStore.Application.Common.Interfaces;
using BosStore.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BosStore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StoreConfigController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;

    public StoreConfigController(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<StoreConfig>> Get()
    {
        var configs = await _unitOfWork.StoreConfigs.GetAllAsync();
        var config = configs.FirstOrDefault();

        if (config == null)
            return NotFound();

        return Ok(config);
    }

    [HttpPut]
    [Authorize]
    public async Task<IActionResult> Update([FromBody] StoreConfig storeConfig)
    {
        await _unitOfWork.StoreConfigs.UpdateAsync(storeConfig);
        await _unitOfWork.SaveChangesAsync();

        return NoContent();
    }
}
