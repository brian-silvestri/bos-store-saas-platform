using System.Net;
using System.Text.Json;
using BosStore.API.Middleware;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace BosStore.Tests.Middleware;

public class GlobalExceptionHandlerTests
{
    private readonly Mock<ILogger<GlobalExceptionHandler>> _mockLogger;
    private readonly Mock<IHostEnvironment> _mockEnvironment;

    public GlobalExceptionHandlerTests()
    {
        _mockLogger = new Mock<ILogger<GlobalExceptionHandler>>();
        _mockEnvironment = new Mock<IHostEnvironment>();
    }

    [Fact]
    public async Task InvokeAsync_NoException_CallsNextMiddleware()
    {
        // Arrange
        var nextCalled = false;
        RequestDelegate next = (HttpContext hc) =>
        {
            nextCalled = true;
            return Task.CompletedTask;
        };

        var middleware = new GlobalExceptionHandler(next, _mockLogger.Object, _mockEnvironment.Object);
        var context = new DefaultHttpContext();

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        nextCalled.Should().BeTrue();
    }

    [Fact]
    public async Task InvokeAsync_ArgumentNullException_ReturnsBadRequest()
    {
        // Arrange
        RequestDelegate next = (HttpContext hc) => throw new ArgumentNullException("test");

        _mockEnvironment.Setup(e => e.EnvironmentName).Returns("Production");

        var middleware = new GlobalExceptionHandler(next, _mockLogger.Object, _mockEnvironment.Object);
        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        context.Response.StatusCode.Should().Be((int)HttpStatusCode.BadRequest);
        context.Response.ContentType.Should().Be("application/json");
    }

    [Fact]
    public async Task InvokeAsync_UnauthorizedAccessException_ReturnsUnauthorized()
    {
        // Arrange
        RequestDelegate next = (HttpContext hc) => throw new UnauthorizedAccessException("Unauthorized");

        _mockEnvironment.Setup(e => e.EnvironmentName).Returns("Production");

        var middleware = new GlobalExceptionHandler(next, _mockLogger.Object, _mockEnvironment.Object);
        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        context.Response.StatusCode.Should().Be((int)HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task InvokeAsync_KeyNotFoundException_ReturnsNotFound()
    {
        // Arrange
        RequestDelegate next = (HttpContext hc) => throw new KeyNotFoundException("Not found");

        _mockEnvironment.Setup(e => e.EnvironmentName).Returns("Production");

        var middleware = new GlobalExceptionHandler(next, _mockLogger.Object, _mockEnvironment.Object);
        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        context.Response.StatusCode.Should().Be((int)HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task InvokeAsync_GenericException_ReturnsInternalServerError()
    {
        // Arrange
        RequestDelegate next = (HttpContext hc) => throw new Exception("Something went wrong");

        _mockEnvironment.Setup(e => e.EnvironmentName).Returns("Production");

        var middleware = new GlobalExceptionHandler(next, _mockLogger.Object, _mockEnvironment.Object);
        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        context.Response.StatusCode.Should().Be((int)HttpStatusCode.InternalServerError);
    }

    [Fact]
    public async Task InvokeAsync_DevelopmentEnvironment_IncludesStackTrace()
    {
        // Arrange
        var exceptionMessage = "Test exception";
        RequestDelegate next = (HttpContext hc) => throw new Exception(exceptionMessage);

        _mockEnvironment.Setup(e => e.EnvironmentName).Returns("Development");

        var middleware = new GlobalExceptionHandler(next, _mockLogger.Object, _mockEnvironment.Object);
        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        context.Response.Body.Seek(0, SeekOrigin.Begin);
        var responseBody = await new StreamReader(context.Response.Body).ReadToEndAsync();
        var errorResponse = JsonSerializer.Deserialize<ErrorResponse>(responseBody,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        errorResponse.Should().NotBeNull();
        errorResponse!.Details.Should().Be(exceptionMessage);
        errorResponse.StackTrace.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task InvokeAsync_ProductionEnvironment_HidesStackTrace()
    {
        // Arrange
        RequestDelegate next = (HttpContext hc) => throw new Exception("Test exception");

        _mockEnvironment.Setup(e => e.EnvironmentName).Returns("Production");

        var middleware = new GlobalExceptionHandler(next, _mockLogger.Object, _mockEnvironment.Object);
        var context = new DefaultHttpContext();
        context.Response.Body = new MemoryStream();

        // Act
        await middleware.InvokeAsync(context);

        // Assert
        context.Response.Body.Seek(0, SeekOrigin.Begin);
        var responseBody = await new StreamReader(context.Response.Body).ReadToEndAsync();
        var errorResponse = JsonSerializer.Deserialize<ErrorResponse>(responseBody,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        errorResponse.Should().NotBeNull();
        errorResponse!.Details.Should().BeNull();
        errorResponse.StackTrace.Should().BeNull();
    }
}
