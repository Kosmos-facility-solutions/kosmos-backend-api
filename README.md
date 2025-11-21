# Kosmos Backend API

Kosmos is a NestJS + Sequelize backend that keeps track of users, properties, service requests, contracts, visits, emails, and Stripe payments for facility services.

## What’s inside

- **Service Requests & Contracts** – customers submit a single request that, once approved, becomes a recurring contract with schedules, next payment dates, and service frequencies.
- **Payments** – `/payments` endpoints create Stripe Checkout sessions, receive webhooks, send payment links/receipts, and update contracts (next due date, last payment). A cron job reminds customers before/after the due date.
- **Service Visits** – another cron reads each contract’s frequency/work days and creates upcoming `service_visit` rows so the operations team always has a calendar of work.
- **Email Automation** – Resend templates handle service confirmations, contract PDFs, payment links, and failures.
- **Documentation** – Swagger UI at `/swagger` plus an ER diagram in `docs/app-flow.drawio`.

## Requirements

- Node 18+ and npm
- PostgreSQL (default) or another Sequelize-supported DB
- Stripe account/keys for test mode
- Resend API key (or update email transport)

## Quick start

```bash
cp .env.example .env    # or edit the existing .env
npm install
npm run migrate:local   # build + run pending migrations
npm run start:dev       # API available at http://localhost:8888/api
```

Visit `http://localhost:8888/swagger` for the live docs. Use the Stripe CLI (`stripe listen --forward-to http://localhost:8888/api/payments/webhook`) to relay webhooks during development.

## Key environment variables

| Variable | Description |
| --- | --- |
| `DB_*` | Database connection (host, name, user, password). |
| `PAYMENT_GATEWAY_SECRET_KEY` | Stripe secret key (test or live). |
| `PAYMENT_GATEWAY_WEBHOOK_SECRET` | Stripe webhook signing secret. |
| `PAYMENT_GATEWAY_SUCCESS_URL` / `PAYMENT_GATEWAY_CANCEL_URL` | Frontend URLs for checkout redirect. |
| `PAYMENT_REMINDER_LEAD_DAYS` | Days in advance to send payment reminders (default 7). |
| `SERVICE_VISIT_HORIZON_DAYS` | How far ahead to schedule visits (default 30). |

See `.env` for the full list (email credentials, swagger auth, etc.).

## Useful scripts

| Command | Description |
| --- | --- |
| `npm run start:dev` | Nest dev server with live reload. |
| `npm run start` | Production mode. |
| `npm run test` / `npm run test:e2e` | Unit & e2e tests. |
| `npm run makemigration` | Generate Sequelize migration from schema changes. |
| `npm run migrate:local` | Build and run migrations locally. |

## Cron jobs (by default)

1. **Payment reminder** – runs daily, checks overdue/upcoming contracts, and creates Stripe payment sessions if none are pending.
2. **Service visit scheduler** – runs daily, calculates the next visits for each active contract, and fills the `service_visit` table.

Tune their frequency with `PAYMENT_REMINDER_CRON` / `SERVICE_VISIT_CRON`.

## Need to test Stripe?

```bash
stripe login                # once
stripe listen --forward-to http://localhost:8888/api/payments/webhook
# in another terminal, create a payment request via POST /payments
```

Use Stripe test cards (e.g., `4242 4242 4242 4242`) to simulate success, or failing cards to test error emails.

## Contributing / Support

Open an issue or pull request with details about the bug/feature. When filing payment issues, include webhook logs (`stripe listen --log-level debug`) so we can trace the event flow.

Enjoy building with Kosmos! 🚀
