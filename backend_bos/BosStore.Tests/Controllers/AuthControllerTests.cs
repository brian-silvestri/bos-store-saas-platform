using BosStore.API.Controllers;
using BosStore.Application.Common.Interfaces;
using BosStore.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Moq;
using Xunit;
using FluentAssertions;

namespace BosStore.Tests.Controllers;

public class AuthControllerTests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<IConfiguration> _mockConfiguration;
    private readonly AuthController _controller;

    public AuthControllerTests()
    {
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockConfiguration = new Mock<IConfiguration>();

        // Setup JWT configuration
        var jwtSection = new Mock<IConfigurationSection>();
        jwtSection.Setup(x => x["SecretKey"]).Returns("TestSecretKeyMinimum32CharactersLong1234567890");
        jwtSection.Setup(x => x["Issuer"]).Returns("TestIssuer");
        jwtSection.Setup(x => x["Audience"]).Returns("TestAudience");
        jwtSection.Setup(x => x["ExpirationMinutes"]).Returns("60");

        _mockConfiguration.Setup(x => x.GetSection("JwtSettings")).Returns(jwtSection.Object);

        _controller = new AuthController(_mockUnitOfWork.Object, _mockConfiguration.Object);
    }

    [Fact]
    public async Task Login_WithInvalidEmail_ReturnsUnauthorized()
    {
        // Arrange
        var request = new LoginRequest("nonexistent@test.com", "password123");

        var mockRepo = new Mock<IRepository<User>>();
        mockRepo.Setup(r => r.FindAsync(It.IsAny<System.Linq.Expressions.Expression<Func<User, bool>>>()))
            .ReturnsAsync(new List<User>());

        _mockUnitOfWork.Setup(u => u.Users).Returns(mockRepo.Object);

        // Act
        var result = await _controller.Login(request);

        // Assert
        result.Result.Should().BeOfType<UnauthorizedObjectResult>();
    }

    [Fact]
    public async Task Login_WithInvalidPassword_ReturnsUnauthorized()
    {
        // Arrange
        var passwordHash = BCrypt.Net.BCrypt.HashPassword("correctpassword");
        var user = new User
        {
            Id = "1",
            Email = "test@test.com",
            PasswordHash = passwordHash,
            TenantId = "tenant1",
            Name = "Test User",
            Role = "Admin"
        };

        var request = new LoginRequest("test@test.com", "wrongpassword");

        var mockRepo = new Mock<IRepository<User>>();
        mockRepo.Setup(r => r.FindAsync(It.IsAny<System.Linq.Expressions.Expression<Func<User, bool>>>()))
            .ReturnsAsync(new List<User> { user });

        _mockUnitOfWork.Setup(u => u.Users).Returns(mockRepo.Object);

        // Act
        var result = await _controller.Login(request);

        // Assert
        result.Result.Should().BeOfType<UnauthorizedObjectResult>();
    }

    [Fact]
    public async Task Login_WithValidCredentials_ReturnsAuthResponse()
    {
        // Arrange
        var password = "testpassword123";
        var passwordHash = BCrypt.Net.BCrypt.HashPassword(password);
        var user = new User
        {
            Id = "1",
            Email = "test@test.com",
            PasswordHash = passwordHash,
            TenantId = "tenant1",
            Name = "Test User",
            Role = "Admin"
        };

        var request = new LoginRequest("test@test.com", password);

        var mockRepo = new Mock<IRepository<User>>();
        mockRepo.Setup(r => r.FindAsync(It.IsAny<System.Linq.Expressions.Expression<Func<User, bool>>>()))
            .ReturnsAsync(new List<User> { user });

        _mockUnitOfWork.Setup(u => u.Users).Returns(mockRepo.Object);

        // Act
        var result = await _controller.Login(request);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var authResponse = okResult.Value.Should().BeOfType<AuthResponse>().Subject;
        authResponse.Email.Should().Be("test@test.com");
        authResponse.TenantId.Should().Be("tenant1");
        authResponse.Token.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task Register_WithExistingEmail_ReturnsBadRequest()
    {
        // Arrange
        var existingUser = new User
        {
            Id = "1",
            Email = "existing@test.com",
            TenantId = "tenant1"
        };

        var request = new RegisterRequest("tenant1", "existing@test.com", "password123", "Test User");

        var mockUserRepo = new Mock<IRepository<User>>();
        mockUserRepo.Setup(r => r.FindAsync(It.IsAny<System.Linq.Expressions.Expression<Func<User, bool>>>()))
            .ReturnsAsync(new List<User> { existingUser });

        var mockTenantRepo = new Mock<IRepository<Tenant>>();
        mockTenantRepo.Setup(r => r.GetByIdAsync("tenant1"))
            .ReturnsAsync(new Tenant { Id = "tenant1", Name = "Test Tenant" });

        _mockUnitOfWork.Setup(u => u.Users).Returns(mockUserRepo.Object);
        _mockUnitOfWork.Setup(u => u.Tenants).Returns(mockTenantRepo.Object);

        // Act
        var result = await _controller.Register(request);

        // Assert
        result.Result.Should().BeOfType<BadRequestObjectResult>();
    }

    [Fact]
    public async Task Register_WithNewEmail_CreatesUserAndReturnsAuthResponse()
    {
        // Arrange
        var request = new RegisterRequest("tenant1", "newuser@test.com", "password123", "New User");

        var mockUserRepo = new Mock<IRepository<User>>();
        mockUserRepo.Setup(r => r.FindAsync(It.IsAny<System.Linq.Expressions.Expression<Func<User, bool>>>()))
            .ReturnsAsync(new List<User>());
        mockUserRepo.Setup(r => r.AddAsync(It.IsAny<User>()))
            .ReturnsAsync((User u) => u);

        var mockTenantRepo = new Mock<IRepository<Tenant>>();
        mockTenantRepo.Setup(r => r.GetByIdAsync("tenant1"))
            .ReturnsAsync(new Tenant { Id = "tenant1", Name = "Test Tenant", IsActive = true });

        var mockSubscriptionRepo = new Mock<IRepository<Subscription>>();
        mockSubscriptionRepo.Setup(r => r.AddAsync(It.IsAny<Subscription>()))
            .ReturnsAsync((Subscription s) => s);

        _mockUnitOfWork.Setup(u => u.Users).Returns(mockUserRepo.Object);
        _mockUnitOfWork.Setup(u => u.Tenants).Returns(mockTenantRepo.Object);
        _mockUnitOfWork.Setup(u => u.Subscriptions).Returns(mockSubscriptionRepo.Object);
        _mockUnitOfWork.Setup(u => u.SaveChangesAsync()).ReturnsAsync(1);

        // Act
        var result = await _controller.Register(request);

        // Assert
        var okResult = result.Result.Should().BeOfType<OkObjectResult>().Subject;
        var authResponse = okResult.Value.Should().BeOfType<AuthResponse>().Subject;
        authResponse.Email.Should().Be("newuser@test.com");
        authResponse.TenantId.Should().Be("tenant1");

        mockUserRepo.Verify(r => r.AddAsync(It.IsAny<User>()), Times.Once);
        mockSubscriptionRepo.Verify(r => r.AddAsync(It.IsAny<Subscription>()), Times.Once);
    }
}
