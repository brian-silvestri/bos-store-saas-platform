using BosStore.Domain.Common;

namespace BosStore.Domain.Entities;

public class CarouselSlide : BaseEntity
{
    public string StoreConfigId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Subtitle { get; set; } = string.Empty;
    public string Image { get; set; } = string.Empty;
    public string ButtonText { get; set; } = string.Empty;
    public string ButtonLink { get; set; } = string.Empty;
    public bool Active { get; set; } = true;
    public int Order { get; set; } = 0;

    // Navigation properties
    public StoreConfig StoreConfig { get; set; } = null!;
}
