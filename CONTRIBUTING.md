# Contributing to right-issue (Lotmetrik)

Thank you for your interest in contributing! Please follow the guidelines below.

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```sh
   git clone https://github.com/YOUR_USERNAME/right-issue.git
   cd right-issue
   ```
3. **Install dependencies:**
   ```sh
   npm install
   ```
4. **Set up environment:**
   ```sh
   cp .env.example .env
   # Fill in your own Supabase credentials
   ```
5. **Start the dev server:**
   ```sh
   npm run dev
   ```

## Branch Naming

| Type     | Pattern              | Example                       |
|----------|----------------------|-------------------------------|
| Feature  | `feat/<short-name>`  | `feat/warrant-calculator`     |
| Bug fix  | `fix/<short-name>`   | `fix/terp-rounding-error`     |
| Docs     | `docs/<short-name>`  | `docs/readme-update`          |
| Chore    | `chore/<short-name>` | `chore/dependency-upgrade`    |

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>

[optional body]
```

Examples:
- `feat(calculator): add warrant dilution mode`
- `fix(terp): correct rounding for fractional lots`
- `docs: update quick-start instructions`

## Pull Request Checklist

Before submitting a PR, ensure:

- [ ] Code lints cleanly: `npm run lint`
- [ ] All tests pass: `npm test`
- [ ] Build succeeds: `npm run build`
- [ ] New features have accompanying tests
- [ ] No hardcoded credentials or personal data
- [ ] `.env` is **not** committed — use `.env.example` for new variables
- [ ] PR description explains *what* and *why*

## Reporting Issues

Please use [GitHub Issues](https://github.com/alfindigital/right-issue/issues) and include:
- Steps to reproduce
- Expected vs. actual behaviour
- Browser/OS if UI-related

## Code Style

- TypeScript strict mode — no `any` without justification
- Tailwind CSS for styling (avoid inline styles)
- shadcn/ui for UI primitives
- React hooks for state (no class components)

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
