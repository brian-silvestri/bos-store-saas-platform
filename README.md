# BOS Store - SaaS Multi-Tenant E-Commerce Platform

> A modern, scalable SaaS platform for creating and managing multi-tenant online stores with real-time order tracking and comprehensive admin tools.

[![.NET](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet)](https://dotnet.microsoft.com/)
[![Angular](https://img.shields.io/badge/Angular-20.2-DD0031?logo=angular)](https://angular.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-316192?logo=postgresql)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org/)

## Features

### Multi-Tenancy Architecture
- **Isolated tenant data** with automatic query filtering
- **Custom branding** per tenant (colors, logos, fonts)
- **Subdomain-based** store access
- **Trial subscriptions** (14 days) with automatic provisioning

### E-Commerce Capabilities
- Product catalog with categories and pricing
- Shopping cart with promotions and discounts
- Order management with real-time status updates via SignalR
- WhatsApp integration for order notifications
- File upload support for product images

### Admin Dashboard
- Complete CRUD operations for products
- Order tracking and status management
- Promotion and discount management
- Store configuration (branding, theme)
- License code generation and validation
- Subscription management

### Security & Performance
- JWT-based authentication with role-based authorization
- BCrypt password hashing
- Global exception handling
- Rate limiting protection
- User Secrets for sensitive configuration
- Clean Architecture for maintainability

## Architecture

### Backend Structure

```
backend_bos/
├── BosStore.API/              # API Layer (Controllers, Middleware)
│   ├── Controllers/           # REST API endpoints
│   ├── Middleware/            # Custom middleware (Tenant, Exception)
│   ├── Hubs/                  # SignalR hubs for real-time
│   └── Services/              # Application services
├── BosStore.Application/      # Application Layer (Use Cases, Interfaces)
│   └── Common/Interfaces/     # Repository and service contracts
├── BosStore.Domain/           # Domain Layer (Entities, Business Logic)
│   └── Entities/              # Domain models (Product, Order, User, etc.)
└── BosStore.Infrastructure/   # Infrastructure Layer (Data Access, External Services)
    ├── Data/                  # EF Core DbContext
    ├── Repositories/          # Repository implementations
    └── Services/              # External service integrations
```

**Patterns Used:**
- Clean Architecture (4 layers)
- Repository Pattern + Unit of Work
- Dependency Injection
- Multi-tenancy with Query Filters

### Frontend Structure

```
frontend_bos/bos-web/
├── src/app/
│   ├── core/                  # Singleton services, guards, interceptors
│   │   ├── services/          # API, Auth, Cart services
│   │   ├── guards/            # Route guards
│   │   ├── interceptors/      # HTTP interceptors
│   │   └── models/            # TypeScript interfaces
│   ├── features/              # Feature modules
│   │   ├── storefront/        # Public store pages
│   │   ├── admin/             # Tenant admin panel
│   │   └── super-admin/       # Platform admin
│   └── shared/                # Reusable components
```

**Technologies:**
- Angular 20.2 with Standalone Components
- Signals for reactive state management
- RxJS for async operations
- Tailwind CSS for styling
- TypeScript strict mode

## Getting Started

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [Node.js 18+](https://nodejs.org/)
- [PostgreSQL 14+](https://www.postgresql.org/download/)
- [Angular CLI](https://angular.io/cli) (`npm install -g @angular/cli`)

### Backend Setup

1. **Clone the repository**
   ```bash
   cd backend_bos/src/BosStore.API
   ```

2. **Configure User Secrets** (See [SECRETS_SETUP.md](backend_bos/SECRETS_SETUP.md))
   ```bash
   dotnet user-secrets init
   dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=bosstore;Username=postgres;Password=YOUR_PASSWORD"
   dotnet user-secrets set "JwtSettings:SecretKey" "YOUR_SECRET_KEY_MINIMUM_32_CHARACTERS"
   ```

3. **Install dependencies**
   ```bash
   dotnet restore
   ```

4. **Run migrations**
   ```bash
   dotnet ef database update
   ```

5. **Run the API**
   ```bash
   dotnet run
   ```

API will be available at `http://localhost:5179`

### Frontend Setup

1. **Navigate to frontend**
   ```bash
   cd frontend_bos/bos-web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment** (Optional)
   - Development: Uses `http://localhost:5179` by default
   - Production: Update `src/environments/environment.prod.ts`

4. **Run the app**
   ```bash
   ng serve
   ```

Frontend will be available at `http://localhost:4200`

### Creating Your First Tenant

1. Register a new tenant via API or frontend
2. Access your store at the configured subdomain
3. Configure branding in admin panel
4. Add products and start selling!

## API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:5179/swagger

### Key Endpoints

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/api/auth/register` | POST | Register new tenant | Public |
| `/api/auth/login` | POST | Login | Public |
| `/api/storefront/{slug}` | GET | Get store by subdomain | Public |
| `/api/orders` | POST | Create order | Public |
| `/api/admin/products` | GET/POST/PUT/DELETE | Manage products | Admin |
| `/api/admin/orders` | GET | View orders | Admin |
| `/api/superadmin/tenants` | GET | List all tenants | SuperAdmin |

## Testing

### Backend Tests
```bash
cd backend_bos/tests/BosStore.Tests
dotnet test
```

### Frontend Tests
```bash
cd frontend_bos/bos-web
ng test
```

## Security Best Practices

- Never commit `appsettings.json` with secrets
- Use User Secrets for local development
- Use environment variables in production
- Rotate JWT secret keys regularly
- Keep dependencies updated
- Review CORS policies before deployment

## Deployment

### Backend
- Configure production connection string
- Set JWT secret in environment variables
- Enable HTTPS
- Configure CORS for production domains
- Run migrations in production DB

### Frontend
- Build for production: `ng build --configuration production`
- Configure API URL in `environment.prod.ts`
- Deploy to static hosting (Vercel, Netlify, etc.)

## Tech Stack

**Backend:**
- ASP.NET Core 8.0 Web API
- Entity Framework Core 8.0
- PostgreSQL 14+
- SignalR (Real-time)
- JWT Authentication
- BCrypt (Password hashing)
- Swagger/OpenAPI

**Frontend:**
- Angular 20.2
- TypeScript 5.9
- Tailwind CSS 3.4
- RxJS 7.8
- Angular Signals

## Project Status

- [x] Multi-tenant architecture
- [x] Authentication & Authorization
- [x] Product management
- [x] Order processing
- [x] Real-time updates
- [x] Admin dashboard
- [ ] Payment integration
- [ ] Email notifications
- [ ] Analytics dashboard
- [ ] Mobile app

## Contributing

This is a portfolio project. Feedback and suggestions are welcome!

## License

MIT License - See [LICENSE](LICENSE) file for details.

## Contact

Brian Silvestri - [GitHub](https://github.com/brian-silvestri)

---

**Built with** ❤️ **using Clean Architecture principles**
