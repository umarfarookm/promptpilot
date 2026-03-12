# Contributing to PromptPilot

Thank you for your interest in contributing. This guide covers the workflow and conventions we follow.

## Getting Started

1. **Fork** the repository on GitHub.
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/<your-username>/promptpilot.git
   cd promptpilot
   ```
3. **Install dependencies** and start the dev environment by following the [Getting Started](./docs/getting-started.md) guide.

## Branch Workflow

1. Create a branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. Make your changes in small, focused commits.
3. Push your branch to your fork:
   ```bash
   git push origin feat/your-feature-name
   ```
4. Open a **Pull Request** against `main` on the upstream repository.

### Branch Naming

| Prefix | Use for |
|--------|---------|
| `feat/` | New features |
| `fix/` | Bug fixes |
| `docs/` | Documentation changes |
| `refactor/` | Code refactoring without behavior changes |
| `test/` | Adding or updating tests |
| `chore/` | Tooling, CI, dependency updates |

## Code Style

- **TypeScript** is used across the entire codebase.
- Run `pnpm lint` to check for linting errors.
- Run `pnpm format` to auto-format with Prettier.
- Follow existing patterns in the file you are editing.
- Use descriptive variable and function names.
- Prefer named exports over default exports.

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests for a specific package
pnpm --filter @promptpilot/script-engine test

# Run tests in watch mode
pnpm test -- --watch
```

All tests must pass before a pull request will be reviewed.

## Pull Request Guidelines

- Keep PRs small and focused on a single change.
- Write a clear title and description explaining what the PR does and why.
- Reference any related issues (e.g., `Closes #42`).
- Make sure CI checks pass.
- Be responsive to review feedback.

## Reporting Issues

- Use GitHub Issues to report bugs or request features.
- Include steps to reproduce for bugs.
- Search existing issues before opening a new one.

## Code of Conduct

Be respectful and constructive. We are building this together.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
