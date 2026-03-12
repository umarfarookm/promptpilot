# PromptPilot

**AI-powered teleprompter and demo copilot for speakers, educators, and content creators.**

PromptPilot helps you deliver presentations, tutorials, and live coding sessions smoothly. Write a script, step up to the mic, and let PromptPilot handle the rest -- from auto-scrolling text to executing terminal commands on cue.

## Features

- **Teleprompter** -- Full-screen scrolling display with adjustable speed and font size
- **Script Editor** -- Write and edit scripts with syntax highlighting for the `.copilot` format
- **Demo Copilot** -- Step-by-step guided mode that runs terminal commands during live demos
- **Speech Sync** -- Hands-free scrolling driven by real-time speech recognition
- **AI Script Assistant** -- Generate, rewrite, and polish scripts with AI
- **Script Management** -- Organize scripts into projects, import markdown and plain text

<!-- Screenshot placeholder: replace with an actual screenshot -->
![PromptPilot Screenshot](https://via.placeholder.com/960x540?text=PromptPilot+Screenshot)

## Quick Start

```bash
# Clone the repository
git clone https://github.com/your-org/promptpilot.git
cd promptpilot

# Install dependencies
pnpm install

# Start the database
docker-compose up -d

# Run migrations and seed data
pnpm db:migrate
pnpm db:seed

# Start the development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

See the full [Getting Started](./docs/getting-started.md) guide for prerequisites and troubleshooting.

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js (App Router), React, Tailwind CSS |
| Backend | Express, Node.js |
| Database | PostgreSQL, Drizzle ORM |
| Monorepo | pnpm workspaces, Turborepo |
| Language | TypeScript (end to end) |

## Project Structure

```
promptpilot/
  packages/
    types/            Shared TypeScript types
    ui/               Reusable React components
    script-engine/    .copilot parser and runtime
  services/
    web/              Next.js frontend
    api/              Express API
  docs/               Documentation
  examples/           Example scripts
```

See the [Architecture](./docs/architecture.md) overview for details on data flow and build pipeline.

## Documentation

- [Getting Started](./docs/getting-started.md) -- Setup and installation
- [Script Format](./docs/script-format.md) -- Full `.copilot` format specification
- [Architecture](./docs/architecture.md) -- System design and component overview
- [Roadmap](./ROADMAP.md) -- Planned features and milestones

## Contributing

Contributions are welcome. Please read the [Contributing Guide](./CONTRIBUTING.md) for details on our branch workflow, code style, and pull request process.

## License

This project is licensed under the [MIT License](./LICENSE).
