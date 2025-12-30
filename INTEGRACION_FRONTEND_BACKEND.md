# 🔗 Integración Frontend ↔ Backend - BosStore SaaS

## ✅ Cambios Implementados

### 1. Servicio API HTTP ([api.service.ts](frontend_bos/bos-web/src/app/core/services/api.service.ts))

Creado servicio centralizado para todas las llamadas HTTP al backend:

```typescript
@Injectable({ providedIn: 'root' })
export class ApiService {
  private apiUrl = 'https://localhost:5001/api';

  // Autenticación
  login(request: LoginRequest): Observable<AuthResponse>
  register(request: RegisterRequest): Observable<AuthResponse>

  // Configuración de Tienda
  getStoreConfig(): Observable<StoreConfig>
  updateStoreConfig(config: StoreConfig): Observable<void>

  // Productos
  getProducts(): Observable<Product[]>
  createProduct(product: Product): Observable<Product>
  updateProduct(id: string, product: Product): Observable<void>
  deleteProduct(id: string): Observable<void>

  // Pedidos
  getOrders(): Observable<Order[]>
  getOrder(id: string): Observable<Order>
  createOrder(order: Order): Observable<OrderCreateResponse>
  updateOrderStatus(id: string, status: string): Observable<void>

  // Categorías y Promociones
  getCategories(): Observable<any[]>
  getPromotions(): Observable<any[]>
}
```

### 2. Interceptor JWT ([auth.interceptor.ts](frontend_bos/bos-web/src/app/core/interceptors/auth.interceptor.ts))

Interceptor funcional que agrega automáticamente el token JWT a todas las peticiones:

```typescript
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

### 3. StoreConfigService Actualizado ([store-config.service.ts](frontend_bos/bos-web/src/app/core/services/store-config.service.ts))

**Carga inicial desde API:**

```typescript
private loadConfigFromAPI() {
  this.apiService.getStoreConfig().subscribe({
    next: (config) => {
      this.config = { ...this.config, ...config }
      localStorage.setItem(this.storageKey, JSON.stringify(this.config))
      this.applyBranding()
    },
    error: (error) => {
      // Fallback a localStorage si falla la API
      this.loadConfig()
      this.applyBranding()
    }
  })
}
```

**Guardado con API:**

```typescript
saveConfig(): Observable<void> {
  return this.apiService.updateStoreConfig(this.config).pipe(
    tap(() => {
      localStorage.setItem(this.storageKey, JSON.stringify(this.config))
      this.applyBranding()
    }),
    catchError((error) => {
      // Fallback a solo localStorage si falla
      localStorage.setItem(this.storageKey, JSON.stringify(this.config))
      this.applyBranding()
      throw error
    })
  )
}
```

### 4. Settings Component ([admin-settings.page.ts](frontend_bos/bos-web/src/app/features/admin/pages/admin-settings.page.ts))

Actualizado para usar Observable:

```typescript
async saveChanges() {
  const ok = await this.confirm.confirm(
    '¿Guardar todos los cambios? Los cambios se aplicarán en toda la tienda'
  )
  if (!ok) return

  this.saving.set(true)
  this.updateSocialMediaInConfig()
  this.store.applyBranding()

  this.store.saveConfig().subscribe({
    next: () => {
      this.saving.set(false)
      this.savedSuccessfully.set(true)
      setTimeout(() => this.savedSuccessfully.set(false), 3000)
    },
    error: (err) => {
      this.saving.set(false)
      console.error('Error guardando configuración:', err)
      alert('Error al guardar los cambios. Por favor, intenta nuevamente.')
    }
  })
}
```

### 5. App Config ([app.config.ts](frontend_bos/bos-web/src/app/app.config.ts))

Configurado HttpClient con interceptor:

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor])
    )
  ]
};
```

---

## 🚀 Cómo Probar la Integración

### Paso 1: Ejecutar Backend

```bash
cd C:\Users\brian\PORTFOLIO\bs-fullstack\backend_bos\src\BosStore.API
dotnet run
```

Backend disponible en: `https://localhost:5001`

### Paso 2: Crear Tenant y Usuario (Primera vez)

**Opción A - SQL Directo:**

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

**Opción B - API con Swagger:**

1. Ir a `https://localhost:5001/swagger`
2. Usar endpoint `POST /api/auth/register`:

```json
{
  "tenantId": "tenant-demo",
  "email": "admin@mitienda.com",
  "password": "Admin123!",
  "name": "Administrador"
}
```

3. Copiar el `token` de la respuesta

### Paso 3: Configurar Token en Frontend

En el navegador (DevTools Console):

```javascript
localStorage.setItem('authToken', 'TU_TOKEN_JWT_AQUI');
```

### Paso 4: Ejecutar Frontend

```bash
cd C:\Users\brian\PORTFOLIO\bs-fullstack\frontend_bos\bos-web
ng serve
```

Frontend disponible en: `http://localhost:4200`

### Paso 5: Probar Settings

1. Ir a `http://localhost:4200/admin/settings`
2. Modificar cualquier configuración:
   - **Tab Información**: Nombre, dirección, WhatsApp
   - **Tab Tema**: Cambiar tema y colores
   - **Tab Redes**: Agregar/editar redes sociales
   - **Tab Carrousel**: Reordenar slides
3. Hacer clic en "💾 Guardar Cambios"
4. Verificar en el navegador:
   - Network tab: Ver la petición `PUT /api/storeconfig`
   - Console: No debería haber errores
5. Verificar en base de datos:
   ```sql
   SELECT * FROM "StoreConfigs" WHERE "TenantId" = 'tenant-demo';
   ```

---

## 🔍 Debugging

### Ver peticiones HTTP

Abrir DevTools → Network → Filter: `localhost:5001`

**Petición exitosa:**
```
Request URL: https://localhost:5001/api/storeconfig
Request Method: PUT
Status Code: 200 OK
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Errores Comunes

#### 1. CORS Error

```
Access to XMLHttpRequest at 'https://localhost:5001/api/storeconfig' from origin 'http://localhost:4200' has been blocked
```

**Solución:** Verificar que CORS esté configurado en [Program.cs](backend_bos/src/BosStore.API/Program.cs):

```csharp
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// ...

app.UseCors();
```

#### 2. 401 Unauthorized

```
Status Code: 401 Unauthorized
```

**Solución:** El token no está presente o expiró. Hacer login nuevamente:

```javascript
// En DevTools Console
localStorage.removeItem('authToken');
// Ir a /login o usar Swagger para obtener nuevo token
```

#### 3. 404 Not Found en PUT /api/storeconfig

```
Status Code: 404 Not Found
```

**Solución:** El tenant no tiene StoreConfig. Verificar en DB:

```sql
SELECT * FROM "StoreConfigs" WHERE "TenantId" = 'tenant-demo';
```

Si está vacío, insertar registro SQL (ver Paso 2).

#### 4. Backend no responde

**Verificar que el backend esté ejecutándose:**

```bash
curl https://localhost:5001/swagger/index.html
```

O ir al navegador: `https://localhost:5001/swagger`

---

## 📊 Flujo de Datos Completo

```
┌─────────────────────────────────────────────────────────────┐
│  USUARIO                                                    │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ 1. Modifica Settings
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND - AdminSettingsPage                               │
│  - Actualiza config.socialMedia1/2/3                        │
│  - Llama store.saveConfig()                                 │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ 2. Observable<void>
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  StoreConfigService                                         │
│  - Llama apiService.updateStoreConfig(config)               │
│  - Guarda en localStorage como backup                       │
│  - Aplica branding (CSS variables)                          │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ 3. HTTP PUT /api/storeconfig
                  │    Authorization: Bearer <token>
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  BACKEND - API                                              │
│  1. authInterceptor agrega header Authorization            │
│  2. TenantMiddleware extrae TenantId del JWT               │
│  3. StoreConfigController.Update()                         │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ 4. Repository pattern
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  POSTGRESQL - BosStore DB                                   │
│  UPDATE "StoreConfigs"                                      │
│  SET "Name" = 'X', "SocialMedia1Type" = 'Y', ...            │
│  WHERE "TenantId" = 'tenant-demo'                           │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ 5. 200 OK
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  FRONTEND                                                   │
│  - Muestra mensaje "✓ Cambios guardados correctamente"     │
│  - Los cambios se reflejan en Landing y Store              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 Próximos Pasos Recomendados

1. **Crear componente de Login** para autenticación real (en lugar de manual)
2. **Implementar AuthService** para manejar login/logout/token refresh
3. **Conectar Orders** con backend (crear pedido → persistir en DB)
4. **Conectar Products** con backend (gestión de productos)
5. **Agregar manejo de errores global** con interceptor
6. **Implementar carga de imágenes** (logo y carousel) a servidor o S3

---

## 🎯 Estado Actual

✅ **Backend:** Funcionando con Clean Architecture + Multi-tenancy
✅ **Frontend:** Settings conectado con API real
✅ **API Service:** Todos los endpoints principales creados
✅ **Auth Interceptor:** JWT automático en todas las peticiones
✅ **StoreConfig:** Persistencia bidireccional (load + save)
✅ **Fallback:** Sistema funciona offline con localStorage

🔄 **Pendiente:**
- Componente de Login/Registro
- Conectar Orders, Products, Categories
- Upload de imágenes al servidor
- Tests end-to-end

---

**¡La integración Frontend-Backend está completa y lista para probar!** 🚀
