#  Guía Completa - BosStore Full Stack (SaaS Multi-Tenant)

##  Resumen del Sistema

Desarrollo de una **plataforma SaaS multi-tenant** para tiendas online con:

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

##  Características del Sistema

### Configuración Personalizable por Tienda

Cada tienda puede personalizar:

**Información Básica**
- Nombre de la tienda
- Dirección física
- Número de WhatsApp
- Logo

 **Redes Sociales** (máximo 3)
- Instagram
- Facebook
- Twitter/X
- LinkedIn

 **Carrousel** (máximo 4 slides)
- Título
- Subtítulo
- Imagen
- Botón con texto y link
- Orden de visualización

 **Temas y Colores**
- Tema predefinido (Classic, Modern, etc.)
- Color primario personalizado
- Color secundario personalizado
- Moneda (ARS/USD)

---

##  Arquitectura Multi-Tenant

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

##  Instalación y Configuración

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
