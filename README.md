# Production-Ready COD E-Commerce MVP (Morocco)

This repository contains the full source code for a production-ready, Cash-on-Delivery (COD) only e-commerce MVP for a bio-cosmetics brand in Morocco. It includes a Node.js API backend and a React frontend, built with a modern, robust tech stack as per the specification.

## Tech Stack

- **Monorepo**: npm workspaces
- **Backend**: Node.js, Express, TypeScript, Prisma, PostgreSQL, ioredis
- **Frontend**: Vite, React 18.3, TypeScript 5, Tailwind CSS, shadcn/ui
- **Testing**: Playwright for E2E tests
- **Deployment**: Docker, Render, Vercel

## Prerequisites

- Node.js v20 (use of `nvm` is recommended: `nvm use`)
- npm v10+
- Docker and Docker Compose (for local development infrastructure)

## Getting Started

### 1. Environment Setup

First, ensure you are using Node.js v20. If you have `nvm` installed, simply run `nvm use` in the project root.

Copy the example environment file and fill in the required values for your local setup or production deployment.

```bash
cp .env.example .env
```

The default `DATABASE_URL` and `REDIS_URL` are configured to work with the local Docker Compose setup.

### 2. Install Dependencies

Install all dependencies for all workspaces from the root directory.

```bash
npm install
```

### 3. Start Local Database & Redis

In a separate terminal, run the local PostgreSQL and Redis instances using Docker Compose.

```bash
docker-compose up -d
```

### 4. Run Database Migrations

Apply the Prisma schema to your database. This command, run from the root, will execute the migration script in the `api` workspace.

```bash
npx prisma migrate dev
```
*(Note: Prisma CLI commands are best run with `npx` to ensure the correct version is used.)*

### 5. Seed the Database

Populate the database with initial data (sample products, admin user, content blocks).

```bash
npm run seed
```

**Default Admin Credentials:**
- **Email**: `admin@example.com`
- **Password**: `Admin@12345`
- **TOTP Setup**: A secret is pre-seeded. Use an authenticator app with this secret to generate codes for your first login. The secret will be logged to the console when seeding.

### 6. Run the Development Servers

This command will start both the backend API and the frontend web app concurrently.

```bash
npm run dev
```

- **API Server**: `http://localhost:4000`
- **Web App**: `http://localhost:5173`

The application should now be running and accessible in your browser.

## Available Scripts

- `npm run dev`: Starts both API and web development servers.
- `npm run build`: Builds both apps for production.
- `npm run lint`: Lints the entire codebase.
- `npm run format`: Formats the entire codebase with Prettier.
- `npm run test`: Runs all tests (unit, integration, e2e).
- `npm run seed`: Runs the database seed script.
- `npm run migrate:dev`: Creates and applies a new database migration.

## Deployment

### Backend API + Database (Render)

The `api/render.yaml` file provides a blueprint for deploying the backend, PostgreSQL, and Redis on Render.

1.  Create a new "Blueprint" service on Render and connect your Git repository.
2.  Render will automatically detect `render.yaml` and provision the services.
3.  Set the required environment variables in an `api-secrets` environment group in the Render dashboard as defined in `.env.example`.

### Frontend (Vercel)

1.  Create a new project on Vercel and connect your Git repository.
2.  Configure the project settings:
    - **Framework Preset**: `Vite`
    - **Build Command**: `npm run build --workspace=web`
    - **Output Directory**: `web/dist`
    - **Install Command**: `npm install`
3.  Set the `VITE_API_BASE_URL` environment variable to point to your deployed backend URL.
4.  Deploy.
