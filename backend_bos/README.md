# BosStore Backend - Multi-Tenant SaaS API

Backend REST API para sistema de tiendas online multi-tenant construido con .NET 8, PostgreSQL y Entity Framework Core.

## 🏗️ Arquitectura

El proyecto sigue **Clean Architecture** con las siguientes capas:

- **BosStore.Domain**: Entidades de dominio y reglas de negocio
- **BosStore.Application**: Interfaces, DTOs y lógica de aplicación
- **BosStore.Infrastructure**: Implementación de repositorios, DbContext y servicios externos
- **BosStore.API**: API REST con controllers y middleware

## 🔑 Características Principales

### Multi-Tenancy
- **Arquitectura**: Tenant por registro (shared database, tenant discriminator)
- **TenantId** en todas las entidades relevantes
- **Global Query Filter** automático en DbContext
- **Middleware** para extraer TenantId del JWT o headers

### Autenticación y Autorización
- JWT Bearer Authentication
- Claims personalizados (TenantId, Role)
- Endpoints públicos para storefront
- Endpoints protegidos para admin

### Modelos de Dominio
- **Tenant**: Tienda/Inquilino
- **User**: Usuarios del sistema (admins de tiendas)
- **StoreConfig**: Configuración personalizable de cada tienda
- **Category**: Categorías de productos
- **Product**: Productos
- **Promotion**: Promociones (descuento, NxM, bundle)
- **Order**: Pedidos con tracking
- **OrderItem**: Items de pedidos

## 📋 Prerrequisitos

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [PostgreSQL 14+](https://www.postgresql.org/download/)
- [Visual Studio 2022](https://visualstudio.microsoft.com/) o [VS Code](https://code.visualstudio.com/)

## 🚀 Configuración Inicial

### 1. Clonar e instalar dependencias

```bash
cd backend_bos
dotnet restore
```

### 2. Configurar PostgreSQL

Crea una base de datos en PostgreSQL:

```sql
CREATE DATABASE bosstore;
```

### 3. Configurar Connection String

Edita `src/BosStore.API/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=bosstore;Username=TU_USUARIO;Password=TU_PASSWORD"
  },
  "JwtSettings": {
    "SecretKey": "CAMBIA_ESTA_CLAVE_SECRETA_MINIMO_32_CARACTERES_PRODUCTION",
    "Issuer": "BosStoreAPI",
    "Audience": "BosStoreClient",
    "ExpirationMinutes": 1440
  }
}
```

### 4. Crear y aplicar migraciones

```bash
cd src/BosStore.Infrastructure

# Crear la migración inicial
dotnet ef migrations add InitialCreate --startup-project ../BosStore.API --context AppDbContext

# Aplicar la migración a la base de datos
dotnet ef database update --startup-project ../BosStore.API --context AppDbContext
```

### 5. Ejecutar la aplicación

```bash
cd ../BosStore.API
dotnet run
```

La API estará disponible en:
- HTTP: `http://localhost:5000`
- HTTPS: `https://localhost:5001`
- Swagger UI: `https://localhost:5001/swagger`

## 🔐 Sistema Multi-Tenant

### Crear un Tenant (Tienda)

```http
POST /api/tenants
Content-Type: application/json

{
  "name": "Mi Tienda",
  "subdomain": "mitienda",
  "isActive": true
}
```

### Crear un Usuario (Admin de Tienda)

```http
POST /api/auth/register
Content-Type: application/json

{
  "tenantId": "TENANT_ID",
  "email": "admin@mitienda.com",
  "password": "Password123!",
  "name": "Admin"
}
```

### Autenticación

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@mitienda.com",
  "password": "Password123!"
}
```

Respuesta:
```json
{
  "token": "eyJhbGc...",
  "tenantId": "xxx",
  "email": "admin@mitienda.com"
}
```

### Usar el Token

Para endpoints protegidos, incluye el header:

```
Authorization: Bearer eyJhbGc...
```

El middleware automáticamente extrae el `TenantId` del JWT y filtra los datos.

## 📡 Endpoints Principales

### Públicos (Sin Autenticación)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /api/products | Listar productos |
| GET | /api/products/{id} | Obtener producto |
| GET | /api/categories | Listar categorías |
| GET | /api/promotions/active | Promociones activas |
| GET | /api/storeconfig | Configuración de tienda |
| GET | /api/orders/{id} | Trackear pedido |
| POST | /api/orders | Crear pedido |

### Protegidos (Requieren JWT)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /api/products | Crear producto |
| PUT | /api/products/{id} | Actualizar producto |
| DELETE | /api/products/{id} | Eliminar producto |
| GET | /api/orders | Listar todos los pedidos |
| PUT | /api/orders/{id}/status | Actualizar estado de pedido |
| PUT | /api/storeconfig | Actualizar configuración |

## 🎨 Ejemplo de Uso desde Frontend

### 1. Obtener configuración de tienda (pública)

```typescript
// Sin header de tenant, usa el dominio o configuración default
fetch('https://api.bosstore.com/api/storeconfig')
  .then(res => res.json())
  .then(config => console.log(config));
```

### 2. Crear pedido (público)

```typescript
fetch('https://api.bosstore.com/api/orders', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Tenant-Id': 'tenant-id-from-subdomain' // Opcional para testing
  },
  body: JSON.stringify({
    customerName: 'Juan Pérez',
    customerPhone: '+5491112345678',
    deliveryMethod: 'delivery',
    paymentMethod: 'cash',
    total: 1500,
    currency: 'ARS',
    street: 'Av. Corrientes',
    number: '1234',
    orderItems: [
      { productId: 'prod-123', quantity: 2, unitPrice: 500, lineTotal: 1000 }
    ]
  })
});
```

### 3. Admin: Actualizar estado de pedido (protegido)

```typescript
const token = 'JWT_TOKEN_FROM_LOGIN';

fetch('https://api.bosstore.com/api/orders/ORD-123/status', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ status: 'preparing' })
});
```

## 🔧 Comandos Útiles

### Crear nueva migración

```bash
cd src/BosStore.Infrastructure
dotnet ef migrations add NombreMigracion --startup-project ../BosStore.API
```

### Revertir última migración

```bash
dotnet ef migrations remove --startup-project ../BosStore.API
```

### Ver SQL generado

```bash
dotnet ef migrations script --startup-project ../BosStore.API
```

### Resetear base de datos

```bash
dotnet ef database drop --startup-project ../BosStore.API
dotnet ef database update --startup-project ../BosStore.API
```

## 🏭 Despliegue en Producción

### Variables de Entorno

Crea `appsettings.Production.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "PRODUCTION_CONNECTION_STRING"
  },
  "JwtSettings": {
    "SecretKey": "USE_STRONG_SECRET_FROM_ENV_VARS",
    "Issuer": "BosStoreAPI",
    "Audience": "BosStoreClient",
    "ExpirationMinutes": 1440
  }
}
```

### Docker (Opcional)

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["src/BosStore.API/BosStore.API.csproj", "BosStore.API/"]
COPY ["src/BosStore.Application/BosStore.Application.csproj", "BosStore.Application/"]
COPY ["src/BosStore.Domain/BosStore.Domain.csproj", "BosStore.Domain/"]
COPY ["src/BosStore.Infrastructure/BosStore.Infrastructure.csproj", "BosStore.Infrastructure/"]
RUN dotnet restore "BosStore.API/BosStore.API.csproj"
COPY src/ .
WORKDIR "/src/BosStore.API"
RUN dotnet build -c Release -o /app/build

FROM build AS publish
RUN dotnet publish -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "BosStore.API.dll"]
```

## 📚 Recursos Adicionales

- [Documentación .NET 8](https://learn.microsoft.com/en-us/dotnet/core/whats-new/dotnet-8)
- [Entity Framework Core](https://learn.microsoft.com/en-us/ef/core/)
- [JWT Authentication](https://jwt.io/)
- [Multi-Tenancy Patterns](https://learn.microsoft.com/en-us/azure/architecture/guide/multitenant/overview)

## 🤝 Contribuciones

Este es un proyecto privado. Para cambios, contactar al equipo de desarrollo.

## 📄 Licencia

Propietario: BosStore © 2025
