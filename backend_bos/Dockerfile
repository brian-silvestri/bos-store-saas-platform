# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution and project files
COPY BosStore.sln ./
COPY src/BosStore.API/BosStore.API.csproj src/BosStore.API/
COPY src/BosStore.Application/BosStore.Application.csproj src/BosStore.Application/
COPY src/BosStore.Domain/BosStore.Domain.csproj src/BosStore.Domain/
COPY src/BosStore.Infrastructure/BosStore.Infrastructure.csproj src/BosStore.Infrastructure/
COPY BosStore.Tests/BosStore.Tests.csproj BosStore.Tests/

# Restore dependencies
RUN dotnet restore

# Copy all source code
COPY . .

# Build and publish
WORKDIR /src/src/BosStore.API
RUN dotnet publish -c Release -o /app/publish --no-restore

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Install curl for healthchecks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy published app
COPY --from=build /app/publish .

# Create uploads directory
RUN mkdir -p /app/uploads && chmod 777 /app/uploads

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Run the application
ENTRYPOINT ["dotnet", "BosStore.API.dll"]
