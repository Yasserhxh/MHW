# Moroccan Household Wallet — Project Instructions

## What this project is

A production-grade full-stack application for managing personal daily expenses, shared household expenses, grocery price tracking, reminders, and notifications.

## Tech stack

### Backend
- .NET 8 (net8.0 TFM) — **only .NET 10 SDK is installed**, this is fine
- ASP.NET Core Web API
- Modular Monolith architecture
- EF Core 8 + Npgsql (PostgreSQL)
- MediatR 12 (CQRS pattern)
- FluentValidation 11
- Serilog
- Swagger / OpenAPI (Swashbuckle)
- JWT access tokens (15 min) + rotating refresh tokens (30 days)
- SignalR for real-time notifications
- AspNetCoreRateLimit for rate limiting
- BCrypt.Net-Next (work factor 12) for password hashing
- MailKit for SMTP email

### Frontend
- React + TypeScript
- Vite
- Zustand (auth store)
- React Query (@tanstack/react-query)
- React Router v6
- Axios (with 401 auto-refresh interceptor)
- @microsoft/signalr

### Infrastructure
- PostgreSQL 16
- Docker + Docker Compose

## Repository structure

```
MHW/
├── src/
│   ├── backend/
│   │   ├── MoroccanWallet.slnx          ← solution file (.slnx not .sln)
│   │   ├── Host/MoroccanWallet.Host/
│   │   ├── Shared/
│   │   │   ├── MoroccanWallet.Shared.Kernel/
│   │   │   └── MoroccanWallet.Shared.Infrastructure/
│   │   └── Modules/
│   │       ├── Identity/
│   │       ├── Users/
│   │       ├── HouseholdBudget/
│   │       ├── SharedExpenses/
│   │       ├── GroceryPrices/
│   │       ├── Reminders/
│   │       ├── Notifications/
│   │       ├── ReferenceData/
│   │       └── Administration/
│   └── frontend/
│       └── moroccan-wallet-web/
├── tests/
│   ├── MoroccanWallet.Tests.Unit/
│   ├── MoroccanWallet.Tests.Integration/
│   └── MoroccanWallet.Tests.Architecture/
├── docker-compose.yml
├── docker-compose.override.yml
└── CLAUDE.md
```

## Module internal structure

Each module is one project with internal folders:

```
Modules/Identity/MoroccanWallet.Modules.Identity/
├── Domain/
│   ├── Entities/
│   ├── Errors/
│   └── Events/
├── Application/
│   ├── Commands/
│   ├── Queries/
│   └── Services/       ← interfaces only
├── Infrastructure/
│   ├── Persistence/
│   │   ├── Configurations/
│   │   └── Migrations/
│   └── Services/       ← implementations
└── Api/                ← controllers
```

## Architecture rules

- **One DbContext per module** — modules never reach into each other's DbContext or tables directly
- **No cross-module entity references** — use IDs (Guid) to reference entities in other modules
- **Cross-module communication** via MediatR integration events (`IIntegrationEvent`) or explicit service interfaces
- **No fat controllers** — controllers dispatch to MediatR, nothing else
- **Result<T> pattern** — all command/query handlers return `Result` or `Result<T>`, never throw for business errors
- **No giant generic repositories** — use DbContext directly in handlers (this is intentional)

## Coding conventions

- Use `sealed` on classes that are not designed for inheritance (commands, handlers, entities)
- Use `primary constructors` where appropriate (.NET 8)
- Use collection expressions `[]` instead of `new List<T>()`
- All timestamps are `DateTime.UtcNow` (never local time)
- Use `record` for commands, queries, DTOs, and domain events
- Use `private set` / `private init` on entity properties — never public setters
- EF column names are `snake_case` — always configure explicitly via `HasColumnName()`
- Table names are `snake_case` plural — always configure explicitly via `ToTable()`
- Indexes always named explicitly with `HasDatabaseName()`
- Never use `var` when the type is not obvious from the right-hand side

## Security rules

- Never log passwords, tokens, or secrets
- Refresh tokens stored as SHA-256 hash in DB — never store raw tokens
- BCrypt work factor 12 minimum
- Auth endpoints (login, register, forgot-password) are rate-limited
- Always return HTTP 200 from forgot-password regardless of whether the email exists (anti-enumeration)
- JWT validation includes issuer, audience, lifetime, and signing key

## How to build

```bash
cd src/backend
dotnet build MoroccanWallet.slnx
```

## How to run migrations

```bash
cd src/backend
dotnet ef migrations add <MigrationName> \
  --project Modules/Identity/MoroccanWallet.Modules.Identity \
  --startup-project Host/MoroccanWallet.Host \
  --context IdentityDbContext \
  --output-dir Infrastructure/Persistence/Migrations

dotnet ef database update \
  --project Modules/Identity/MoroccanWallet.Modules.Identity \
  --startup-project Host/MoroccanWallet.Host \
  --context IdentityDbContext
```

## How to run locally

```bash
# Start Postgres
docker compose up postgres -d

# Run API (Swagger at http://localhost:5000)
cd src/backend
dotnet run --project Host/MoroccanWallet.Host

# Run frontend
cd src/frontend/moroccan-wallet-web
npm run dev   # → http://localhost:5173
```

## Current implementation status

| Phase | Status | Description |
|-------|--------|-------------|
| 1 | Done | Architecture, schema, API contracts, React structure |
| 2 | Done | Backend scaffold, Identity module, Notifications hub, React auth flows |
| 3 | Pending | Integration tests for Identity |
| 4 | Pending | Users + HouseholdBudget modules |
| 5 | Pending | Reminders + Notifications processing |
| 6 | Pending | SharedExpenses + GroceryPrices |
| 7 | Pending | Polish, seed data, observability, Docker prod setup |

## What NOT to implement yet

- MFA / 2FA
- Google / Microsoft / Apple sign-in
- Phone / WhatsApp verification
- Flutter mobile app
- Push notifications (mobile)

The architecture is designed so these can be added later without rewrites.

## Preferences

- Prefer editing existing files over creating new ones
- Do not add docstrings or comments to code you didn't change
- Do not add error handling for scenarios that cannot happen
- Do not add abstractions for one-time use
- Security-sensitive decisions must be explained briefly with the tradeoff
- When scaffolding new modules, follow the exact same structure as the Identity module
