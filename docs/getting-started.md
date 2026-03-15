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
git clone https://github.com/umarfarookm/promptpilot.git
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

### 5. Set up AI provider

PromptPilot's AI Script Assistant supports three LLM providers. Choose one:

#### Option A: Ollama (default -- free, runs locally)

```bash
# macOS
brew install ollama

# Start the Ollama server
ollama serve

# Pull a model (in a new terminal)
ollama pull llama3.2
```

No extra configuration needed -- Ollama is the default provider.

#### Option B: OpenAI

Add these to `apps/api/.env`:

```env
AI_PROVIDER=openai
AI_API_KEY=sk-your-openai-api-key
# AI_MODEL=gpt-4o-mini   # optional, this is the default
```

#### Option C: Anthropic (Claude)

Add these to `apps/api/.env`:

```env
AI_PROVIDER=anthropic
AI_API_KEY=sk-ant-your-anthropic-api-key
# AI_MODEL=claude-sonnet-4-20250514  # optional, this is the default
```

> See `apps/api/.env.example` for all available configuration options.

### 6. Start the development server

```bash
pnpm dev
```

This uses Turborepo to start all services concurrently (frontend, backend, and shared package watchers).

### 7. Open the app

Navigate to [http://localhost:3000](http://localhost:3000) in your browser. You should see the PromptPilot dashboard.

## AI Provider Reference

| Provider | `AI_PROVIDER` | `AI_API_KEY` | Default Model | Notes |
|----------|---------------|--------------|---------------|-------|
| Ollama | `ollama` | not required | `llama3.2` | Free, local. Requires `ollama serve` running. |
| OpenAI | `openai` | required | `gpt-4o-mini` | Cloud API. Pay-per-token. |
| Anthropic | `anthropic` | required | `claude-sonnet-4-20250514` | Cloud API. Pay-per-token. |

You can override the model with `AI_MODEL` in your `.env` file. For Ollama, the model must be pulled first (`ollama pull <model>`).

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 3000 already in use | Stop the other process or set `PORT=3001` before running `pnpm dev` |
| Database connection refused | Make sure Docker is running and `docker-compose up -d` completed successfully |
| Missing dependencies | Delete `node_modules` and run `pnpm install` again |
| AI Assistant shows red dot | Check that your AI provider is running/configured. For Ollama: `ollama serve` + `ollama pull llama3.2`. For cloud providers: verify `AI_API_KEY` in `apps/api/.env` |
| Ollama times out on first use | The first request is slow while Ollama loads the model into memory. Wait ~30s. Subsequent requests are fast. |

## Next Steps

- Read the [Script Format](./script-format.md) docs to learn how to write scripts.
- Check out the [Architecture](./architecture.md) overview to understand the codebase.
- Browse the [examples](../examples/) directory for sample scripts.
