# 🚀 Guía Completa - BosStore Full Stack (SaaS Multi-Tenant)

## 📋 Resumen del Sistema

Has desarrollado una **plataforma SaaS multi-tenant** para tiendas online con:

### Frontend (Angular 19)
- **Landing Page** con carrousel personalizable
- **Storefront** con productos, categorías y promociones
- **Carrito de compras** y checkout con WhatsApp
- **Tracking de pedidos** para clientes
- **Panel Admin** completo con gestión de tienda
- **Sistema de temas** personalizables

### Backend (.NET 8 + PostgreSQL)
- **API REST** con Clean Architecture
- **Multi-tenancy** con tenant por registro
- **Autenticación JWT** con roles
- **Entity Framework Core** con migraciones
- **PostgreSQL** como base de datos

---

## 🎯 Características del Sistema

### Configuración Personalizable por Tienda

Cada tienda puede personalizar:

✅ **Información Básica**
- Nombre de la tienda
- Dirección física
- Número de WhatsApp
- Logo

✅ **Redes Sociales** (máximo 3)
- Instagram
- Facebook
- Twitter/X
- LinkedIn

✅ **Carrousel** (máximo 4 slides)
- Título
- Subtítulo
- Imagen
- Botón con texto y link
- Orden de visualización

✅ **Temas y Colores**
- Tema predefinido (Classic, Modern, etc.)
- Color primario personalizado
- Color secundario personalizado
- Moneda (ARS/USD)

---

## 🏗️ Arquitectura Multi-Tenant

### ¿Cómo funciona?

1. **Un solo deployment** para todas las tiendas
2. **Una base de datos** compartida con `TenantId`
3. **Filtro automático** por tenant en todas las consultas
4. **JWT con claim de TenantId** para identificar al usuario

### Ejemplo de Flujo

```
Usuario login → JWT con TenantId →
Middleware extrae TenantId →
DbContext filtra por TenantId automáticamente →
Solo ve datos de su tienda
```

---

## 🔧 Instalación y Configuración

### 1. Backend - PostgreSQL

**Crear base de datos:**

```bash
# En PostgreSQL (psql o pgAdmin)
CREATE DATABASE bosstore;
```

**Configurar connection string:**

Editar `backend_bos/src/BosStore.API/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=bosstore;Username=TU_USUARIO;Password=TU_PASSWORD"
  },
  "JwtSettings": {
    "SecretKey": "TU_CLAVE_SECRETA_SUPER_SEGURA_MINIMO_32_CARACTERES",
    "Issuer": "BosStoreAPI",
    "Audience": "BosStoreClient",
    "ExpirationMinutes": 1440
  }
}
```

**Aplicar migraciones:**

```bash
cd C:\Users\brian\PORTFOLIO\bs-fullstack\backend_bos\src\BosStore.Infrastructure

dotnet ef database update --startup-project ../BosStore.API --context AppDbContext
```

**Ejecutar backend:**

```bash
cd ../BosStore.API
dotnet run
```

API disponible en: `https://localhost:5001`
Swagger UI: `https://localhost:5001/swagger`

### 2. Crear Primera Tienda y Usuario

**Opción A: SQL Directo**

```sql
-- 1. Crear tenant
INSERT INTO "Tenants" ("Id", "Name", "Subdomain", "IsActive", "CreatedAt")
VALUES ('tenant-demo', 'Mi Tienda Demo', 'demo', true, NOW());

-- 2. Crear configuración de tienda
INSERT INTO "StoreConfigs" (
  "Id", "TenantId", "Name", "WhatsappNumber", "Currency",
  "PrimaryColor", "SecondaryColor", "Address", "ThemeKey",
  "SocialMedia1Type", "SocialMedia1Url",
  "SocialMedia2Type", "SocialMedia2Url",
  "CreatedAt"
)
VALUES (
  gen_random_uuid()::text,
  'tenant-demo',
  'Mi Tienda Demo',
  '+5491112345678',
  'ARS',
  '#FF6B35',
  '#F7931E',
  'Av. Corrientes 1234, CABA',
  'classic',
  'instagram',
  'https://instagram.com/mitienda',
  'facebook',
  'https://facebook.com/mitienda',
  NOW()
);
```

**Opción B: API Endpoint** (crear primero el endpoint de tenants)

### 3. Registrar Usuario Admin

```http
POST https://localhost:5001/api/auth/register
Content-Type: application/json

{
  "tenantId": "tenant-demo",
  "email": "admin@mitienda.com",
  "password": "Admin123!",
  "name": "Administrador"
}
```

Respuesta:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tenantId": "tenant-demo",
  "email": "admin@mitienda.com",
  "name": "Administrador"
}
```

### 4. Frontend - Angular

**Instalar dependencias:**

```bash
cd C:\Users\brian\PORTFOLIO\bs-fullstack\frontend_bos\bos-web
npm install
```

**Ejecutar frontend:**

```bash
ng serve
```

Aplicación disponible en: `http://localhost:4200`

---

## 🎨 Componente Settings Mejorado

### Propuesta de UI

El componente de Settings debería tener:

```
┌─────────────────────────────────────────┐
│  Settings                               │
├─────────────────────────────────────────┤
│  ┌─────┬─────┬─────┬─────┬─────┐      │
│  │ Info│Theme│Social│Carousel│Advanced│ │  ← Tabs de navegación
│  └─────┴─────┴─────┴─────┴─────┘      │
│                                         │
│  [Contenido del tab actual]             │
│                                         │
│  < Prev    [Guardar Cambios]    Next > │
│  ──────────────────────────────────────│
│  ℹ️ Los cambios se aplicarán en toda   │
│     la tienda (Landing + Store)        │
└─────────────────────────────────────────┘
```

### Tab 1: Información Básica

```typescript
// Campos:
- Nombre de la tienda
- WhatsApp
- Dirección
- Logo (upload)
- Moneda (ARS/USD)
```

### Tab 2: Tema y Colores

```typescript
// Campos:
- Tema predefinido (dropdown con preview)
- Color primario (color picker)
- Color secundario (color picker)
- Preview en tiempo real
```

### Tab 3: Redes Sociales (máximo 3)

```typescript
// Para cada red:
- Tipo (Instagram/Facebook/Twitter/LinkedIn)
- URL
- Botón "Agregar red" (hasta 3)
- Botón "Eliminar" por cada una
```

### Tab 4: Carrousel (máximo 4)

```typescript
// Lista de slides con:
- Orden (drag & drop)
- Preview de imagen
- Título/Subtítulo
- Botón texto/link
- Activo/Inactivo
- Botón "Nuevo slide" (hasta 4)
```

---

## 📡 Integración Frontend ↔ Backend

### 1. Crear Servicio HTTP

```typescript
// src/app/core/services/api.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private apiUrl = 'https://localhost:5001/api';

  constructor(private http: HttpClient) {}

  // Store Config
  getStoreConfig() {
    return this.http.get<StoreConfig>(`${this.apiUrl}/storeconfig`);
  }

  updateStoreConfig(config: StoreConfig) {
    return this.http.put(`${this.apiUrl}/storeconfig`, config);
  }

  // Products
  getProducts() {
    return this.http.get<Product[]>(`${this.apiUrl}/products`);
  }

  createProduct(product: Product) {
    return this.http.post(`${this.apiUrl}/products`, product);
  }

  // Orders
  createOrder(order: Order) {
    return this.http.post<{ id: string }>(`${this.apiUrl}/orders`, order);
  }

  getOrder(id: string) {
    return this.http.get<Order>(`${this.apiUrl}/orders/${id}`);
  }

  updateOrderStatus(id: string, status: string) {
    return this.http.put(`${this.apiUrl}/orders/${id}/status`, { status });
  }
}
```

### 2. Interceptor para JWT

```typescript
// src/app/core/interceptors/auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('authToken');

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};
```

### 3. Actualizar StoreConfigService

```typescript
// Reemplazar el mock con llamadas HTTP reales
export class StoreConfigService {
  constructor(
    private api: ApiService,
    private http: HttpClient
  ) {
    this.loadConfigFromAPI();
  }

  private loadConfigFromAPI() {
    this.api.getStoreConfig().subscribe({
      next: (config) => {
        this.config = config;
        this.applyBranding();
      },
      error: () => {
        // Fallback al mock si falla
        this.loadConfig();
      }
    });
  }

  saveConfig() {
    return this.api.updateStoreConfig(this.config).pipe(
      tap(() => {
        localStorage.setItem(this.storageKey, JSON.stringify(this.config));
        this.applyBranding();
      })
    );
  }
}
```

### 4. Actualizar Settings Component

```typescript
export class AdminSettingsPage {
  private apiService = inject(ApiService);
  private storeService = inject(StoreConfigService);

  currentTab = signal<'info' | 'theme' | 'social' | 'carousel'>('info');
  saving = signal(false);
  savedSuccessfully = signal(false);

  saveChanges() {
    this.saving.set(true);

    this.storeService.saveConfig().subscribe({
      next: () => {
        this.saving.set(false);
        this.savedSuccessfully.set(true);

        // Mostrar mensaje de confirmación
        setTimeout(() => this.savedSuccessfully.set(false), 3000);
      },
      error: (err) => {
        this.saving.set(false);
        console.error('Error saving config:', err);
      }
    });
  }

  nextTab() {
    const tabs = ['info', 'theme', 'social', 'carousel'];
    const currentIndex = tabs.indexOf(this.currentTab());
    if (currentIndex < tabs.length - 1) {
      this.currentTab.set(tabs[currentIndex + 1] as any);
    }
  }

  prevTab() {
    const tabs = ['info', 'theme', 'social', 'carousel'];
    const currentIndex = tabs.indexOf(this.currentTab());
    if (currentIndex > 0) {
      this.currentTab.set(tabs[currentIndex - 1] as any);
    }
  }
}
```

---

## 📊 Modelo de Datos Actualizado

### StoreConfig (Backend)

```csharp
public class StoreConfig
{
    public string Id { get; set; }
    public string TenantId { get; set; }

    // Básico
    public string Name { get; set; }
    public string WhatsappNumber { get; set; }
    public string? Address { get; set; }
    public string? LogoUrl { get; set; }
    public string Currency { get; set; } // ARS, USD

    // Tema
    public string? ThemeKey { get; set; }
    public string PrimaryColor { get; set; }
    public string SecondaryColor { get; set; }

    // Redes Sociales (máximo 3)
    public string? SocialMedia1Type { get; set; }
    public string? SocialMedia1Url { get; set; }
    public string? SocialMedia2Type { get; set; }
    public string? SocialMedia2Url { get; set; }
    public string? SocialMedia3Type { get; set; }
    public string? SocialMedia3Url { get; set; }

    // Navegación
    public ICollection<CarouselSlide> CarouselSlides { get; set; }
}
```

### CarouselSlide

```csharp
public class CarouselSlide
{
    public string Id { get; set; }
    public string StoreConfigId { get; set; }
    public string Title { get; set; }
    public string Subtitle { get; set; }
    public string Image { get; set; }
    public string ButtonText { get; set; }
    public string ButtonLink { get; set; }
    public bool Active { get; set; }
    public int Order { get; set; } // 1-4
}
```

---

## ✅ Checklist Final

### Backend
- [x] Proyecto creado con Clean Architecture
- [x] Multi-tenancy implementado
- [x] Autenticación JWT configurada
- [x] Controllers creados (Products, Orders, StoreConfig, etc.)
- [x] Migraciones creadas
- [ ] Aplicar migraciones a PostgreSQL
- [ ] Crear tenant y usuario de prueba
- [ ] Probar endpoints con Swagger

### Frontend
- [ ] Crear servicio HTTP para API
- [ ] Implementar interceptor JWT
- [ ] Actualizar StoreConfigService para usar API
- [ ] Mejorar componente Settings con tabs
- [ ] Implementar guardado con confirmación
- [ ] Agregar manejo de redes sociales
- [ ] Agregar gestión de carrousel
- [ ] Conectar Orders con backend

---

## 🎉 Próximos Pasos

1. **Aplicar migraciones** a PostgreSQL
2. **Crear tenant de prueba** con SQL o endpoint
3. **Probar autenticación** (register/login)
4. **Refactorizar frontend** para usar API real
5. **Mejorar UI de Settings** con tabs y navegación
6. **Testear flujo completo** end-to-end

¿Quieres que continúe con algún paso específico?
