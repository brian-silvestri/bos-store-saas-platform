# 🚨 Configuración Final - BosStore Backend

## ⚙️ Problemas Detectados y Soluciones

### 1. Versión de .NET

**Problema**: El proyecto se creó con .NET 10 (tu sistema), pero solicitaste .NET 8.

**Solución**:
```bash
# Editar todos los archivos .csproj y cambiar:
<TargetFramework>net10.0</TargetFramework>
# Por:
<TargetFramework>net8.0</TargetFramework>
```

**Archivos a modificar:**
- `src/BosStore.API/BosStore.API.csproj`
- `src/BosStore.Domain/BosStore.Domain.csproj`
- `src/BosStore.Application/BosStore.Application.csproj`
- `src/BosStore.Infrastructure/BosStore.Infrastructure.csproj`

### 2. Conflicto de Versiones de Entity Framework

**Solución**: Unificar versiones de EF Core

```bash
cd src/BosStore.API
dotnet remove package Microsoft.EntityFrameworkCore
dotnet add package Microsoft.EntityFrameworkCore --version 8.0.11
```

### 3. Conflicto de AutoMapper

**Solución**: Bajar la versión de AutoMapper

```bash
cd src/BosStore.Application
dotnet remove package AutoMapper
dotnet add package AutoMapper --version 12.0.1
```

## 📝 Pasos para Compilar y Ejecutar

### Paso 1: Limpiar proyecto

```bash
cd C:\Users\brian\PORTFOLIO\bs-fullstack\backend_bos
dotnet clean
```

### Paso 2: Restaurar dependencias

```bash
dotnet restore
```

### Paso 3: Compilar

```bash
dotnet build
```

### Paso 4: Crear Migraciones

```bash
cd src/BosStore.Infrastructure
dotnet ef migrations add InitialCreate --startup-project ../BosStore.API --context AppDbContext
```

### Paso 5: Aplicar Migraciones

**IMPORTANTE**: Asegúrate de tener PostgreSQL corriendo y la base de datos creada.

```sql
-- En PostgreSQL
CREATE DATABASE bosstore;
```

Luego ejecuta:

```bash
dotnet ef database update --startup-project ../BosStore.API --context AppDbContext
```

### Paso 6: Ejecutar la API

```bash
cd ../BosStore.API
dotnet run
```

## 🔑 Modelo Multi-Tenant Recomendado

He implementado **multi-tenancy con TenantId por registro**. Esto significa:

### Para crear un nuevo tenant (tienda):

1. **Crear el Tenant** directamente en la base de datos o mediante un endpoint admin:

```sql
INSERT INTO "Tenants" ("Id", "Name", "Subdomain", "IsActive", "CreatedAt")
VALUES ('tenant-1', 'Mi Tienda', 'mitienda', true, NOW());
```

2. **Crear StoreConfig** para ese tenant:

```sql
INSERT INTO "StoreConfigs" ("Id", "TenantId", "Name", "WhatsappNumber", "Currency", "PrimaryColor", "SecondaryColor", "CreatedAt")
VALUES ('config-1', 'tenant-1', 'Mi Tienda', '+5491112345678', 'ARS', '#FF6B35', '#F7931E', NOW());
```

3. **Crear un usuario admin** para ese tenant:

Usa el endpoint POST `/api/auth/register`:

```json
{
  "tenantId": "tenant-1",
  "email": "admin@mitienda.com",
  "password": "Password123!",
  "name": "Admin"
}
```

4. **Login** y obtener JWT:

POST `/api/auth/login`:

```json
{
  "email": "admin@mitienda.com",
  "password": "Password123!"
}
```

Respuesta:
```json
{
  "token": "eyJhbGc...",
  "tenantId": "tenant-1",
  "email": "admin@mitienda.com",
  "name": "Admin"
}
```

### Cómo funciona el filtro automático por Tenant

El `AppDbContext` tiene un **Global Query Filter** que automáticamente filtra todas las consultas por `TenantId`:

```csharp
// En AppDbContext.cs
modelBuilder.Entity<Product>().HasQueryFilter(e => e.TenantId == _currentTenantId);
```

El `TenantMiddleware` extrae el `TenantId` del JWT y lo inyecta en el contexto.

## 📦 Estructura del Proyecto

```
backend_bos/
├── src/
│   ├── BosStore.API/          # Controllers, Middleware, Program.cs
│   │   ├── Controllers/
│   │   │   ├── AuthController.cs      # Login/Register
│   │   │   ├── ProductsController.cs  # CRUD Productos
│   │   │   ├── CategoriesController.cs
│   │   │   ├── PromotionsController.cs
│   │   │   ├── OrdersController.cs    # Tracking de pedidos
│   │   │   └── StoreConfigController.cs
│   │   ├── Middleware/
│   │   │   └── TenantMiddleware.cs    # Extrae TenantId del JWT
│   │   ├── Program.cs                  # Configuración JWT, CORS, EF Core
│   │   └── appsettings.json
│   │
│   ├── BosStore.Domain/       # Entidades de dominio
│   │   ├── Common/
│   │   │   ├── BaseEntity.cs
│   │   │   └── ITenantEntity.cs
│   │   └── Entities/
│   │       ├── Tenant.cs
│   │       ├── User.cs
│   │       ├── StoreConfig.cs
│   │       ├── Category.cs
│   │       ├── Product.cs
│   │       ├── Promotion.cs
│   │       ├── Order.cs
│   │       └── OrderItem.cs
│   │
│   ├── BosStore.Application/  # Interfaces, DTOs
│   │   └── Common/
│   │       └── Interfaces/
│   │           ├── IRepository.cs
│   │           └── IUnitOfWork.cs
│   │
│   └── BosStore.Infrastructure/  # DbContext, Repositorios
│       ├── Data/
│       │   └── AppDbContext.cs
│       ├── Repositories/
│       │   ├── Repository.cs
│       │   └── UnitOfWork.cs
│       └── Services/
│           └── TenantService.cs
```

## 🌐 Endpoints Disponibles

| Endpoint | Método | Auth | Descripción |
|----------|--------|------|-------------|
| /api/auth/register | POST | No | Registrar usuario |
| /api/auth/login | POST | No | Login |
| /api/products | GET | No | Listar productos |
| /api/products/{id} | GET | No | Ver producto |
| /api/products | POST | Sí | Crear producto |
| /api/products/{id} | PUT | Sí | Actualizar producto |
| /api/products/{id} | DELETE | Sí | Eliminar producto |
| /api/categories | GET/POST/PUT/DELETE | Sí | CRUD Categorías |
| /api/promotions | GET/POST/PUT/DELETE | Sí | CRUD Promociones |
| /api/orders | GET | Sí | Listar pedidos (admin) |
| /api/orders/{id} | GET | No | Ver pedido (tracking) |
| /api/orders | POST | No | Crear pedido |
| /api/orders/{id}/status | PUT | Sí | Actualizar estado |
| /api/storeconfig | GET | No | Ver configuración |
| /api/storeconfig | PUT | Sí | Actualizar configuración |

## 🔗 Integración con Frontend Angular

En tu frontend Angular, configura el HttpClient para incluir el JWT:

```typescript
// auth.interceptor.ts
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const token = localStorage.getItem('token');

    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(req);
  }
}
```

## 💡 Recomendaciones de Seguridad

1. **Cambiar el JWT SecretKey** en producción (mínimo 32 caracteres)
2. **Usar HTTPS** en producción
3. **Habilitar Rate Limiting** para prevenir abuse
4. **Validar inputs** con FluentValidation (ya instalado)
5. **Hash de passwords** con BCrypt (ya implementado)

## 🐳 Docker Compose (Opcional)

Para ejecutar PostgreSQL y la API juntos:

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: bosstore
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: yourpassword
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  api:
    build: .
    ports:
      - "5000:80"
    environment:
      ConnectionStrings__DefaultConnection: "Host=postgres;Database=bosstore;Username=postgres;Password=yourpassword"
    depends_on:
      - postgres

volumes:
  postgres_data:
```

## ✅ Checklist Final

- [ ] Cambiar TargetFramework a net8.0 en todos los .csproj
- [ ] Unificar versiones de EF Core y AutoMapper
- [ ] Configurar PostgreSQL y crear database
- [ ] Actualizar connection string en appsettings.json
- [ ] Cambiar JWT SecretKey
- [ ] Ejecutar dotnet build
- [ ] Crear y aplicar migraciones
- [ ] Crear tenant y usuario admin manualmente
- [ ] Probar endpoints con Postman/Swagger
- [ ] Configurar CORS con la URL correcta del frontend
- [ ] Conectar frontend Angular con la API

## 📞 Soporte

Si tienes algún problema, verifica:
1. PostgreSQL está corriendo
2. La base de datos "bosstore" existe
3. El connection string es correcto
4. Las versiones de paquetes NuGet son compatibles
