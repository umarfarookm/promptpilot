# Getting Started

This guide walks you through setting up PromptPilot for local development.

## Prerequisites

Make sure you have the following installed:

- **Node.js** 20 or later -- [download](https://nodejs.org/)
- **pnpm** 9 or later -- `npm install -g pnpm`
- **Docker** and **Docker Compose** -- [download](https://www.docker.com/)

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-org/promptpilot.git
cd promptpilot
```

### 2. Install dependencies

```bash
pnpm install
```

This installs dependencies for all packages and services in the monorepo.

### 3. Start the database

```bash
docker-compose up -d
```

This starts a PostgreSQL instance on port 5432 with the default credentials defined in `docker-compose.yml`.

### 4. Run migrations and seed data

```bash
pnpm db:migrate
pnpm db:seed
```

Migrations create the required tables. The seed script populates the database with sample scripts and user data so you can explore the app immediately.

### 5. Start the development server

```bash
pnpm dev
```

This uses Turborepo to start all services concurrently (frontend, backend, and shared package watchers).

### 6. Open the app

Navigate to [http://localhost:3000](http://localhost:3000) in your browser. You should see the PromptPilot dashboard.

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 3000 already in use | Stop the other process or set `PORT=3001` before running `pnpm dev` |
| Database connection refused | Make sure Docker is running and `docker-compose up -d` completed successfully |
| Missing dependencies | Delete `node_modules` and run `pnpm install` again |

## Next Steps

- Read the [Script Format](./script-format.md) docs to learn how to write scripts.
- Check out the [Architecture](./architecture.md) overview to understand the codebase.
- Browse the [examples](../examples/) directory for sample scripts.
