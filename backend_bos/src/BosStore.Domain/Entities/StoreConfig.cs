using BosStore.Domain.Common;

namespace BosStore.Domain.Entities;

public class StoreConfig : BaseEntity, ITenantEntity
{
    public string TenantId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string WhatsappNumber { get; set; } = string.Empty;
    public string Currency { get; set; } = "ARS"; // ARS or USD
    public string PrimaryColor { get; set; } = "#FF6B35";
    public string SecondaryColor { get; set; } = "#F7931E";
    public string? Address { get; set; }
    public string? ThemeKey { get; set; }
    public string? LogoUrl { get; set; }

    // Redes Sociales (máximo 3)
    public string? SocialMedia1Type { get; set; } // instagram, facebook, twitter, linkedin
    public string? SocialMedia1Url { get; set; }
    public string? SocialMedia2Type { get; set; }
    public string? SocialMedia2Url { get; set; }
    public string? SocialMedia3Type { get; set; }
    public string? SocialMedia3Url { get; set; }

    // Navigation properties
    public Tenant Tenant { get; set; } = null!;
    public ICollection<CarouselSlide> CarouselSlides { get; set; } = new List<CarouselSlide>();
}
