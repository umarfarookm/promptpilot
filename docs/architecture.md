# Architecture Overview

PromptPilot is a monorepo managed with **pnpm workspaces** and **Turborepo**. It contains a Next.js frontend, an Express backend, and several shared packages.

## Repository Structure

```
promptpilot/
  packages/
    types/            Shared TypeScript type definitions
    ui/               Reusable React component library
    script-engine/    Parser and runtime for .copilot scripts
  services/
    web/              Next.js frontend (App Router)
    api/              Express REST API
  docs/               Documentation
  examples/           Example scripts
  docker-compose.yml  Local PostgreSQL setup
  turbo.json          Turborepo pipeline config
  pnpm-workspace.yaml Workspace definition
  tsconfig.base.json  Shared TypeScript config
```

## Components

### Frontend -- `services/web`

- **Framework:** Next.js with the App Router
- **Styling:** Tailwind CSS
- **State:** React context and server components where possible
- **Key pages:**
  - Dashboard -- list and manage scripts
  - Editor -- write and edit `.copilot` or markdown scripts
  - Teleprompter -- full-screen scrolling display for presentations
  - Copilot -- live demo mode with terminal integration

### Backend -- `services/api`

- **Framework:** Express
- **Database:** PostgreSQL (accessed via Drizzle ORM)
- **Auth:** Session-based authentication
- **Key responsibilities:**
  - CRUD operations for scripts and projects
  - Script parsing and validation
  - User management
  - WebSocket relay for real-time teleprompter sync

### Shared Packages

| Package | Purpose |
|---------|---------|
| `packages/types` | TypeScript interfaces and enums shared across frontend and backend |
| `packages/ui` | Presentational React components (buttons, cards, modals) used by the web service |
| `packages/script-engine` | Parses `.copilot` files into block arrays, validates syntax, and provides a step-through runtime |

## Data Flow

```
+------------+         +-----------+         +------------+
|            |  HTTP   |           |  SQL    |            |
|  Next.js   +-------->+  Express  +-------->+ PostgreSQL |
|  Frontend  |<--------+  API      |<--------+            |
|            |   JSON  |           |         |            |
+-----+------+         +-----+-----+         +------------+
      |                       |
      |  WebSocket            |  imports
      |                       |
+-----v------+         +-----v-----------+
|            |         |                 |
| Teleprompter|         | script-engine   |
| Display    |         | (parse + run)   |
|            |         |                 |
+------------+         +-----------------+
```

1. The user creates or uploads a script through the **Next.js frontend**.
2. The frontend sends the script to the **Express API**, which validates and stores it in **PostgreSQL**.
3. When the user enters presentation mode, the frontend fetches the parsed script from the API.
4. The **script-engine** package parses the raw text into an ordered block array.
5. The **Teleprompter Display** renders blocks sequentially, scrolling as the speaker progresses.
6. In Demo Copilot mode, `COMMAND` blocks can be forwarded over a **WebSocket** connection to a terminal agent for live execution.

## Build Pipeline

Turborepo orchestrates builds, with the following task graph:

```
packages/types       -> build
packages/ui          -> build (depends on types)
packages/script-engine -> build (depends on types)
services/api         -> build (depends on types, script-engine)
services/web         -> build (depends on types, ui, script-engine)
```

Running `pnpm dev` starts all packages in watch mode. Running `pnpm build` produces production artifacts for deployment.
