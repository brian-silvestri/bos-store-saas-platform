# BOS Store - Frontend

Modern Angular frontend for the BOS Store multi-tenant SaaS e-commerce platform.

## Tech Stack

- **Framework**: Angular 20.2
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Angular Signals
- **HTTP Client**: Angular HttpClient
- **Real-time**: SignalR
- **Build Tool**: Angular CLI

## Features

- Multi-tenant store management
- Product catalog with categories
- Shopping cart and checkout
- Order management
- Subscription plans
- Real-time order updates (SignalR)
- Responsive design (Tailwind CSS)
- Role-based access control

## Prerequisites

- Node.js 18+ or 20+
- npm 9+

## Development Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm start
   ```

   The app will run at `http://localhost:4200/`

3. **Configure backend URL:**

   Update `src/environments/environment.ts` with your backend API URL:
   ```typescript
   export const environment = {
     production: false,
     apiUrl: 'http://localhost:5000/api'
   };
   ```

## Available Scripts

```bash
# Development
npm start              # Start dev server
npm run build          # Build for production
npm run watch          # Build with watch mode

# Code Quality
npm run lint           # Run ESLint
npm run format         # Format code with Prettier

# Testing
npm test               # Run unit tests
npm run test:coverage  # Run tests with coverage
```

## Project Structure

```
src/
├── app/
│   ├── components/       # Reusable UI components
│   ├── pages/            # Page components
│   ├── services/         # API services
│   ├── models/           # TypeScript interfaces
│   ├── guards/           # Route guards
│   ├── interceptors/     # HTTP interceptors
│   └── app.routes.ts     # Application routes
├── assets/               # Static assets
├── environments/         # Environment configs
└── styles.css            # Global styles
```

## Building for Production

```bash
npm run build
```

Build artifacts will be stored in `dist/bos-web/browser/`.

## Docker Deployment

Build and run with Docker:

```bash
# Build image
docker build -t bosstore-frontend .

# Run container
docker run -p 80:80 bosstore-frontend
```

Or use docker-compose from the project root.

## License

MIT
