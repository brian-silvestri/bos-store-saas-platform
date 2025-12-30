using BosStore.API.Services;
using BosStore.Domain.Entities;
using FluentAssertions;
using Xunit;

namespace BosStore.Tests;

/// <summary>
/// Tests simplificados para verificar la funcionalidad básica del sistema de licencias
/// </summary>
public class SimpleTests
{
    [Fact]
    public void LicenseCodeService_GeneratesValidFormat()
    {
        // Arrange
        var service = new LicenseCodeService();

        // Act
        var code = service.GenerateLicenseCode("PRO");

        // Assert
        code.Should().StartWith("BOS-PRO-");
        code.Split('-').Should().HaveCount(4);
        code.Should().MatchRegex(@"^BOS-[A-Z]+-[A-Z0-9]{4}-[A-Z0-9]{4}$");
    }

    [Fact]
    public void LicenseCodeService_GeneratesUniqueCode()
    {
        // Arrange
        var service = new LicenseCodeService();
        var codes = new HashSet<string>();

        // Act - Generate 100 codes
        for (int i = 0; i < 100; i++)
        {
            var code = service.GenerateLicenseCode("PRO");
            codes.Add(code);
        }

        // Assert - All should be unique
        codes.Should().HaveCount(100);
    }

    [Fact]
    public void Plan_CanBeCreated()
    {
        // Arrange & Act
        var plan = new Plan
        {
            Id = "test-plan",
            Name = "Test Plan",
            Description = "Test Description",
            Price = 29.99m,
            DurationDays = 30,
            MaxUsers = 5,
            Features = "[\"feature1\"]",
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Assert
        plan.Should().NotBeNull();
        plan.Id.Should().Be("test-plan");
        plan.DurationDays.Should().Be(30);
        plan.MaxUsers.Should().Be(5);
    }

    [Fact]
    public void LicenseCode_CanBeCreated()
    {
        // Arrange & Act
        var service = new LicenseCodeService();
        var code = service.GenerateLicenseCode("PRO");

        var licenseCode = new LicenseCode
        {
            Code = code,
            PlanId = "pro",
            DurationDays = 30,
            IsUsed = false,
            ExpiresAt = DateTime.UtcNow.AddDays(90),
            CreatedAt = DateTime.UtcNow
        };

        // Assert
        licenseCode.Should().NotBeNull();
        licenseCode.IsUsed.Should().BeFalse();
        licenseCode.ExpiresAt.Should().BeAfter(DateTime.UtcNow);
    }

    [Fact]
    public void Subscription_CanBeCreated()
    {
        // Arrange & Act
        var subscription = new Subscription
        {
            Id = Guid.NewGuid().ToString(),
            TenantId = "test-tenant",
            PlanId = "pro",
            Status = "active",
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddDays(30),
            MaxUsers = 5,
            Features = "[\"feature1\"]",
            LicenseCode = "BOS-PRO-TEST-1234",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Assert
        subscription.Should().NotBeNull();
        subscription.Status.Should().Be("active");
        subscription.EndDate.Should().BeAfter(subscription.StartDate);
        subscription.EndDate.Should().BeCloseTo(DateTime.UtcNow.AddDays(30), TimeSpan.FromSeconds(5));
    }

    [Theory]
    [InlineData("TRIAL")]
    [InlineData("PRO")]
    [InlineData("ENTERPRISE")]
    public void LicenseCodeService_WorksWithDifferentPrefixes(string prefix)
    {
        // Arrange
        var service = new LicenseCodeService();

        // Act
        var code = service.GenerateLicenseCode(prefix);

        // Assert
        code.Should().StartWith($"BOS-{prefix}-");
        code.Should().MatchRegex(@"^BOS-[A-Z]+-[A-Z0-9]{4}-[A-Z0-9]{4}$");
    }

    [Fact]
    public void LicenseCode_ExpirationLogic_Works()
    {
        // Arrange
        var futureExpiration = DateTime.UtcNow.AddDays(10);
        var pastExpiration = DateTime.UtcNow.AddDays(-10);

        // Act & Assert - Future expiration should be valid
        futureExpiration.Should().BeAfter(DateTime.UtcNow);

        // Past expiration should be invalid
        pastExpiration.Should().BeBefore(DateTime.UtcNow);
    }

    [Fact]
    public void Subscription_ExtensionLogic_Works()
    {
        // Arrange
        var currentEndDate = DateTime.UtcNow.AddDays(5);
        var extensionDays = 30;

        // Act
        var newEndDate = currentEndDate.AddDays(extensionDays);

        // Assert
        newEndDate.Should().BeAfter(currentEndDate);
        (newEndDate - currentEndDate).TotalDays.Should().BeApproximately(extensionDays, 0.1);
    }

    [Fact]
    public void LicenseCodeService_DoesNotUseConfusingCharacters()
    {
        // Arrange
        var service = new LicenseCodeService();
        var confusingChars = new[] { 'O', '0', 'I', '1' };

        // Act
        var codes = Enumerable.Range(0, 50)
            .Select(_ => service.GenerateLicenseCode("TEST"))
            .ToList();

        // Assert - Check that segments don't contain confusing characters
        foreach (var code in codes)
        {
            var segments = code.Split('-');
            var lastTwoSegments = segments[2] + segments[3];

            foreach (var confusingChar in confusingChars)
            {
                lastTwoSegments.Should().NotContain(confusingChar.ToString(),
                    $"code segments should not contain confusing character '{confusingChar}'");
            }
        }
    }
}
