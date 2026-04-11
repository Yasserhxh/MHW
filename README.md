# MHW == Moroccan Household Wallet

Moroccan Household Wallet is a production-grade full-stack application for managing:

- personal daily expenses
- shared household / roommate expenses
- grocery price memory
- reminders for bills and recurring payments
- in-app notifications
- email notifications

This repository starts with the **backend-first foundation** using a **modular monolith** architecture in **.NET 8**, with **PostgreSQL**, **SignalR**, and a future-ready design for React and Flutter clients.

---

## Current Scope

### Included in current phase
- Backend modular monolith scaffold
- PostgreSQL integration
- EF Core migration foundation
- JWT authentication foundation
- Refresh token foundation
- Email abstraction
- SignalR notification foundation
- Background worker foundation for reminders
- Swagger / OpenAPI
- Structured logging
- Docker Compose for local development

### Not yet implemented
- MFA
- Phone verification
- WhatsApp OTP
- Google / Microsoft / Apple sign-in
- Full frontend implementation
- Full business modules implementation

---

## Tech Stack

### Backend
- .NET 8
- ASP.NET Core Web API
- Modular Monolith architecture
- EF Core
- PostgreSQL
- SignalR
- FluentValidation
- MediatR-style application layer
- Serilog
- Swagger / OpenAPI

### Frontend
- React + TypeScript
- Flutter mobile app
- These will be added after backend foundation is stable

### Infrastructure
- Docker
- Docker Compose
- Email provider abstraction
- Background processing for reminders

---

## Architecture

The backend is built as a **modular monolith**.

Each module owns its:
- Domain
- Application
- Infrastructure
- API

Current planned modules:

- Identity
- Users
- HouseholdBudget
- SharedExpenses
- GroceryPrices
- Reminders
- Notifications
- ReferenceData
- Administration

The application is a **single deployable backend**, but internally split into explicit business modules to keep the codebase maintainable and extensible.

---

## Repository Structure

```text
src/
  backend/
    MoroccanWallet.sln
    Host/
    Shared/
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

tests/
  backend-unit/
  backend-integration/
  backend-architecture/
