# Bio Cosmetics E-Commerce MVP (COD-Only)

This repository contains the full source code for a production-ready, Cash-on-Delivery (COD) only e-commerce MVP for a bio cosmetics brand in Morocco. It includes a Node.js API backend and a React frontend, built with a modern, robust tech stack.

## Features

- **Bilingual**: Supports Arabic (ar-MA, RTL) and French (fr-MA, LTR).
- **COD Checkout**: A streamlined, single-page checkout process designed for Cash on Delivery.
- **OTP Verification**: Phone number verification via OTP to confirm orders.
- **Admin Panel**: A comprehensive back-office for managing orders, products, and content.
- **SEO Optimized**: SSR-friendly, with JSON-LD schemas, and proper i18n meta tags.
- **Performance-Focused**: Built with Vite, React, and TanStack Query for a fast user experience.
- **Production-Ready**: Includes Dockerfile, Render configuration, and CI/CD setup for linting and testing.

## Tech Stack

- **Monorepo**: pnpm workspaces
- **Frontend**: Vite, React, TypeScript, Tailwind CSS, shadcn/ui, TanStack Router, TanStack Query, i18next
- **Backend**: Node.js, Express, TypeScript, Prisma, PostgreSQL, Redis, Zod
- **Authentication**: JWT for admin, TOTP for 2FA
- **Storage**: S3-compatible object storage for images (e.g., Cloudflare R2, MinIO)
- **Testing**: Playwright for E2E tests
- **Linting/Formatting**: ESLint, Prettier

## Project Structure

```
/
├── api/             # Backend Express.js app
├── web/             # Frontend Vite + React app
├── shared/          # Shared types and validation schemas (Zod)
├── .env.example     # Environment variable template
├── package.json     # Root package manager with workspace scripts
└── README.md
```

## Prerequisites

- Node.js (v18 or later)
- pnpm (v8 or later)
- Docker and Docker Compose (for local development)

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd <repository-name>
```

### 2. Set up environment variables

Copy the example environment file and fill in the required values.

```bash
cp .env.example .env
```

You will need credentials for a PostgreSQL database, Redis, and an S3-compatible storage bucket. For local development, you can use the provided `docker-compose.yml` which sets up Postgres and Redis automatically. The `.env` file is pre-configured to work with the Docker setup.

### 3. Install dependencies

This project uses `pnpm` workspaces. Install dependencies from the root directory.

```bash
pnpm install
```

### 4. Start Local Development Services

Run the local PostgreSQL and Redis instances using Docker Compose.

```bash
docker-compose up -d
```

### 5. Run database migrations

Apply the Prisma schema to your database. This will create all the necessary tables.

```bash
pnpm --filter api run migrate:dev
```

### 6. Seed the database

Populate the database with initial data (sample products, admin user, content blocks).

```bash
pnpm seed
```

**Default Admin Credentials:**
- **Email**: `admin@example.com`
- **Password**: `password123`

You will be prompted to set up TOTP on your first login.

### 7. Run the development servers

This command will start both the backend API and the frontend web app concurrently.

```bash
pnpm dev
```

- **API Server**: `http://localhost:4000`
- **Web App**: `http://localhost:5173`

You can now access the application in your browser.

## Scripts

The following scripts are available in the root `package.json`:

- `pnpm dev`: Starts both API and web development servers.
- `pnpm dev:api`: Starts only the API server.
- `pnpm dev:web`: Starts only the web server.
- `pnpm build`: Builds both apps for production.
- `pnpm build:api`: Builds only the API.
- `pnpm build:web`: Builds only the web app.
- `pnpm start`: Starts the built production apps.
- `pnpm lint`: Lints the entire codebase.
- `pnpm test`: Runs all tests (including Playwright E2E tests).
- `pnpm test:e2e`: Runs only the Playwright tests.
- `pnpm seed`: Runs the database seed script.

## Testing

The project includes unit tests and Playwright E2E tests.

To run all tests:
```bash
pnpm test
```

To run only the E2E tests:
```bash
# First, ensure the dev server is running
pnpm dev &

# Then, run the tests
pnpm test:e2e
```

## Deployment

### Backend API (Render)

The `api/render.yaml` file provides a blueprint for deploying the backend, PostgreSQL, and Redis on Render.

1.  Create a new "Blueprint" service on Render.
2.  Connect your Git repository.
3.  Render will automatically detect `render.yaml` and provision the services.
4.  Set the required environment variables in the Render dashboard.

### Frontend (Vercel/Netlify)

1.  Create a new project on Vercel or Netlify.
2.  Connect your Git repository.
3.  Configure the project settings:
    - **Build Command**: `pnpm --filter web build`
    - **Output Directory**: `web/dist`
    - **Install Command**: `pnpm install`
    - **Root Directory**: `/`
4.  Set the environment variable `VITE_API_BASE_URL` to point to your deployed backend URL.
5.  Deploy.
