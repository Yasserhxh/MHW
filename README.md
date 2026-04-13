# Moroccan Household Wallet

Moroccan Household Wallet is a full-stack household finance application designed for people who want one calm place to manage daily money decisions.

It helps users:
- track personal expenses and income
- manage wallets and account balances
- organize categories and monthly budgets
- follow upcoming and overdue reminders
- manage shared household expenses and balances
- remember grocery prices over time
- receive in-app notifications and realtime updates
- manage profile, preferences, and account access

The product is built as a modern web application with a React frontend and a modular monolith ASP.NET Core backend.

---

## Product Presentation

### Short presentation
Moroccan Household Wallet is a practical consumer-finance app for daily household life. Instead of behaving like an enterprise dashboard, it focuses on the questions users actually ask every week:

- How much did I spend?
- How much is left this month?
- What bills are due soon?
- Which wallet or account did I use?
- Who owes what in the household?
- What price did I last pay for this grocery item?

The app combines personal finance tracking, shared expense management, reminders, grocery price memory, and notifications in one experience.

### Why this product exists
Most finance tools are either:
- too personal and ignore shared household life
- too complex and analytics-heavy
- too generic to support recurring bills, grocery price memory, and household settlements together

Moroccan Household Wallet is meant to feel:
- simple
- trustworthy
- practical
- easy to scan in a few seconds

---

## Main Use Cases

### 1. Personal expense tracking
Users can:
- record expenses and income
- assign categories
- assign wallets/accounts
- add notes and payment methods
- review transaction history
- monitor monthly spending

### 2. Wallet and balance management
Users can:
- create wallets such as cash, bank, savings, and shared household wallets
- track current balances
- review wallet-linked activity

### 3. Monthly budget visibility
Users can:
- define monthly budgets
- compare spending against budget
- review top spending categories

### 4. Household and roommate expense sharing
Users can:
- create a household group
- add shared expenses
- split equally for now
- see balances per member
- understand who owes what

### 5. Grocery price memory
Users can:
- create grocery products
- add price entries over time
- mark favorites
- compare recent prices
- review price history for a product

### 6. Reminders and recurring obligations
Users can:
- create one-time reminders
- create recurring reminders
- mark reminders complete
- snooze reminders
- view upcoming and overdue reminders

### 7. Notifications and realtime updates
Users can:
- view unread and read notifications
- mark one as read
- mark all as read
- receive realtime notification updates through SignalR

### 8. Account and preference management
Users can:
- log in and register with email/password
- verify email
- reset password
- manage profile
- manage language/currency/timezone preferences

---

## What Is Implemented

### Frontend
The React frontend is implemented with:
- React
- TypeScript
- Vite
- TanStack Query
- feature-based organization
- authenticated app shell
- responsive dashboard layout
- route guards

Implemented frontend areas:
- auth pages
- onboarding flow
- dashboard
- expenses
- wallets
- categories
- shared expenses
- grocery prices
- reminders
- notifications
- settings
- loading, empty, and error states

Current frontend integration status:
- real backend integration is enabled for auth, transactions, wallets, categories, reminders, notifications, shared expenses, grocery prices, and user settings
- onboarding is still mock-backed because there is no dedicated backend onboarding endpoint yet
- notification preferences are currently stored client-side because there is no backend endpoint for them yet

### Backend
The ASP.NET Core backend is implemented as a modular monolith with:
- .NET 10
- ASP.NET Core Web API
- EF Core
- PostgreSQL
- JWT authentication
- refresh tokens
- SignalR
- FluentValidation
- MediatR-style application pipeline
- Serilog
- ProblemDetails error responses
- rate limiting

Implemented backend modules:
- Identity
- Users
- HouseholdBudget
- SharedExpenses
- GroceryPrices
- Reminders
- Notifications
- ReferenceData
- Administration

---

## Current Feature Coverage

### Identity
Implemented:
- register
- login
- verify email
- forgot password
- reset password
- refresh token rotation
- logout
- logout all sessions
- auth audit logging

Not implemented yet:
- MFA
- social login
- phone or OTP verification

### Users
Implemented:
- profile query/update
- preferences query/update

### HouseholdBudget
Implemented:
- wallets
- categories
- transactions
- monthly budgets
- summaries

### SharedExpenses
Implemented:
- groups
- members
- shared expenses
- balances foundation
- settlements foundation

### GroceryPrices
Implemented:
- products
- price entries
- favorites
- price history

### Reminders
Implemented:
- list/detail/create/update/delete
- complete
- snooze
- recurring frequency support

### Notifications
Implemented:
- database notification records
- unread count
- mark single read
- mark all read
- SignalR notification hub

---

## Repository Structure

```text
src/
  backend/
    MoroccanWallet.slnx
    Host/
      MoroccanWallet.Host/
    Shared/
      MoroccanWallet.Shared.Kernel/
      MoroccanWallet.Shared.Infrastructure/
    Modules/
      Identity/
      Users/
      HouseholdBudget/
      SharedExpenses/
      GroceryPrices/
      Reminders/
      Notifications/
      ReferenceData/
      Administration/

  frontend/
    moroccan-wallet-web/
      src/
        app/
        features/
        shared/

tests/
  MoroccanWallet.Tests.Unit/
  MoroccanWallet.Tests.Integration/
  MoroccanWallet.Tests.Architecture/
```

---

## Architecture Overview

### Backend architecture
The backend is a single deployable modular monolith.

Each business module owns its:
- domain
- application
- infrastructure
- API surface

This keeps the codebase easier to evolve without the operational overhead of microservices.

### Frontend architecture
The frontend uses feature-based organization:
- each feature owns its pages, hooks, API module, and types
- shared HTTP client and error normalization live in shared infrastructure
- TanStack Query manages server state
- a small auth store manages the session

### Realtime
Notifications use:
- SignalR on the backend
- authenticated hub connection on the frontend

---

## Application Flow

### Public flow
1. User registers
2. User verifies email
3. User logs in
4. User completes onboarding if required
5. User enters the authenticated application shell

### Authenticated flow
Once authenticated, the user can:
- open the dashboard
- create and browse transactions
- manage wallets and categories
- create reminders
- manage household shared expenses
- review grocery prices
- receive notifications
- manage profile and preferences

---

## Frontend Routes

### Public routes
- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`
- `/verify-email`
- `/auth/success`
- `/auth/error`

### Authenticated routes
- `/dashboard`
- `/expenses`
- `/expenses/new`
- `/expenses/:id`
- `/wallets`
- `/wallets/:id`
- `/categories`
- `/shared-expenses`
- `/shared-expenses/:id`
- `/shared-expenses/new`
- `/grocery-prices`
- `/grocery-prices/:id`
- `/reminders`
- `/reminders/new`
- `/reminders/:id`
- `/notifications`
- `/settings/profile`
- `/settings/preferences`
- `/settings/security`
- `/settings/notifications`

### Support routes
- `/403`
- `/404`
- `/500`

---

## Backend API Areas

### Auth
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/verify-email`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/logout-all`

### Users
- `GET /api/v1/users/profile`
- `PUT /api/v1/users/profile`
- `GET /api/v1/users/preferences`
- `PUT /api/v1/users/preferences`

### Budget
- `GET /api/v1/wallets`
- `POST /api/v1/wallets`
- `GET /api/v1/wallets/{id}`
- `PUT /api/v1/wallets/{id}`
- `GET /api/v1/categories`
- `POST /api/v1/categories`
- `PUT /api/v1/categories/{id}`
- `GET /api/v1/transactions`
- `POST /api/v1/transactions`
- `GET /api/v1/transactions/{id}`
- `PUT /api/v1/transactions/{id}`
- `DELETE /api/v1/transactions/{id}`
- `GET /api/v1/transactions/summary`
- `GET /api/v1/budgets/monthly`
- `PUT /api/v1/budgets/monthly`

### Reminders
- `GET /api/v1/reminders`
- `POST /api/v1/reminders`
- `GET /api/v1/reminders/{id}`
- `PUT /api/v1/reminders/{id}`
- `POST /api/v1/reminders/{id}/complete`
- `POST /api/v1/reminders/{id}/snooze`

### Notifications
- `GET /api/v1/notifications`
- `GET /api/v1/notifications/unread-count`
- `POST /api/v1/notifications/{id}/read`
- `POST /api/v1/notifications/mark-all-read`
- SignalR hub: `/hubs/notifications`

### Shared expenses
- `GET /api/v1/shared-expenses/groups`
- `POST /api/v1/shared-expenses/groups`
- `GET /api/v1/shared-expenses/groups/{id}`
- `GET /api/v1/shared-expenses`
- `POST /api/v1/shared-expenses`
- `GET /api/v1/shared-expenses/{id}`
- `POST /api/v1/shared-expenses/settlements`

### Grocery prices
- `GET /api/v1/grocery-prices/products`
- `POST /api/v1/grocery-prices/products`
- `GET /api/v1/grocery-prices/products/{id}/history`
- `GET /api/v1/grocery-prices/entries`
- `POST /api/v1/grocery-prices/entries`
- `POST /api/v1/grocery-prices/favorites/{productId}`
- `DELETE /api/v1/grocery-prices/favorites/{productId}`

---

## Local Development

### Requirements
- .NET 10 SDK
- Node.js 20+
- PostgreSQL
- npm

### Backend setup
1. Configure PostgreSQL connection settings.
2. Configure JWT secret through environment variables or user secrets.
3. Apply module migrations.
4. Run the host project.

Example host project:
- [MoroccanWallet.Host.csproj](/C:/Users/YasserBOUAABANE/source/repos/MHW/src/backend/Host/MoroccanWallet.Host/MoroccanWallet.Host.csproj)

Useful backend dev URLs:
- HTTPS API: `https://localhost:7089`
- HTTP API: `http://localhost:5256`
- Scalar API docs: `https://localhost:7089/scalar/v1`

### Frontend setup
From:
- [moroccan-wallet-web](/C:/Users/YasserBOUAABANE/source/repos/MHW/src/frontend/moroccan-wallet-web)

Run:

```bash
npm install
npm run dev
```

Frontend dev URL:
- `http://localhost:5173`

Frontend API URL is configured through:
- [\.env.local](/C:/Users/YasserBOUAABANE/source/repos/MHW/src/frontend/moroccan-wallet-web/.env.local)

Current local default:
- `VITE_API_URL=https://localhost:7089`

---

## Authentication Notes

### Current behavior
- email verification is required before full login succeeds
- refresh tokens are used for session continuation
- protected frontend routes rely on backend-issued JWTs
- backend authorization always remains the source of truth

### Development email behavior
If the backend uses the development email sender instead of SMTP:
- forgot-password and verify-email flows still work logically
- but tokens may be logged instead of delivered to a real inbox

---

## Security Highlights

The backend includes:
- JWT authentication
- refresh token rotation
- replay protection
- rate limiting on auth-sensitive routes
- ProblemDetails responses
- ownership checks for user-owned resources
- secure password hashing
- no hardcoded production secrets
- SignalR auth for notifications

---

## Testing

### Backend
Available test projects:
- unit tests
- integration tests
- architecture tests

### Frontend
Available checks:
- typecheck
- lint
- Vitest
- coverage

Useful frontend commands:

```bash
npm run typecheck
npm run lint
npm run test
npm run test:coverage
npm run build
```

Useful backend commands:

```bash
dotnet build src/backend/MoroccanWallet.slnx
dotnet test tests/MoroccanWallet.Tests.Unit/MoroccanWallet.Tests.Unit.csproj
dotnet test tests/MoroccanWallet.Tests.Integration/MoroccanWallet.Tests.Integration.csproj
dotnet test tests/MoroccanWallet.Tests.Architecture/MoroccanWallet.Tests.Architecture.csproj
```

---

## Known Gaps

These areas are still intentionally incomplete or simplified:
- dedicated onboarding backend endpoints
- notification preference persistence on the backend
- resend verification endpoint
- richer settlement history queries
- MFA
- social login
- advanced analytics/reporting
- frontend route-level code splitting

---

## Roadmap

### Short-term next steps
- add a backend onboarding/bootstrap contract
- persist notification preferences server-side
- improve dashboard aggregation with dedicated dashboard endpoints
- add richer detail/edit UX for more frontend flows
- expand frontend integration coverage

### Future steps
- MFA
- social login providers
- mobile client integration
- more automation around reminders and notifications
- deeper financial insights

---

## Who This Repository Is For

This repository is useful for:
- developers onboarding to the Moroccan Household Wallet codebase
- product reviewers who want to understand the application scope
- QA and testers who need feature and route visibility
- backend and frontend contributors who need module boundaries and setup guidance
- stakeholders who want a compact presentation of the product and its use cases

---

## Summary

Moroccan Household Wallet is a full-stack household finance product focused on practical daily value:
- personal money tracking
- household balance clarity
- reminders and due items
- grocery price memory
- notifications and realtime updates

It is already structured as a production-grade codebase with a working modular backend and a feature-based frontend, and it is designed to keep growing without turning into a noisy enterprise dashboard or an unmaintainable monolith.
