# Finance App

![Next.js](https://img.shields.io/badge/NextJS-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwind-css&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Clerk](https://img.shields.io/badge/Clerk-6C47FF?style=flat-square&logo=clerk&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-635BFF?style=flat-square&logo=stripe&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)

A full-stack personal finance management application built with Next.js 15. Track transactions, manage accounts, visualize spending with charts, and control your financial health — all in one place.

## Features

- **Dashboard** — Visual analytics with bar, line, area, pie, radar, and radial bar charts
- **Transactions** — Create, categorize, and track income and expense transactions
- **Accounts** — Manage multiple financial accounts with multi-currency support (USD, EUR, GBP, UAH)
- **Categories** — Custom expense/income categories with color customization
- **Settings** — Personalize dashboard layout, chart type, sorting, and pagination preferences
- **Subscriptions** — Free, Pro (monthly), and Gold (yearly) tiers via Stripe
- **Dark Mode** — Full light/dark theme support
- **Responsive** — Mobile-optimized interface

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15, React 18 |
| Styling | Tailwind CSS, NextUI v2 |
| State | Zustand, TanStack React Query |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Animation | Framer Motion |
| Auth | Clerk |
| Payments | Stripe |
| ORM | Prisma 5 |
| Database | PostgreSQL |
| Logging | Winston |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Clerk account (authentication)
- Stripe account (payments)

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables
cp .env.example .env
# Fill in the values (see Environment Variables section)

# 3. Generate Prisma client
npm run prisma:generate

# 4. Run database migrations
npm run prisma:migrate

# 5. (Optional) Seed the database
npm run prisma:seed

# 6. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Docker

```bash
docker-compose up -d
```

This starts three services:
- **finance-app** — Next.js app on port `3000`
- **finance-db** — PostgreSQL on port `5432`
- **finance-adminer** — Database UI on port `8080`

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/finance_db

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Stripe Payments
STRIPE_SECRET_KEY=
MONTHLY_PRICE_ID=
YEARLY_PRICE_ID=

# App URL
NEXT_PUBLIC_FRONT_URL=http://localhost:3000
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:studio` | Open Prisma Studio on port 5555 |
| `npm run prisma:seed` | Seed database with initial data |

## Project Structure

```
src/
├── app/                  # Next.js App Router
│   ├── (auth)/           # Sign-in / sign-up pages
│   ├── (public-pages)/   # Public landing page
│   └── (user-pages)/     # Protected pages (dashboard, accounts, etc.)
├── actions/              # Server actions (API layer)
│   ├── Account/
│   ├── Category/
│   ├── Transaction/
│   ├── Payment/
│   └── UserSettings/
├── components/           # Shared UI components
├── hooks/                # Custom React hooks
├── providers/            # Context providers (auth, query, theme)
├── store/                # Zustand state slices
├── utils/                # Utility functions and constants
└── validation/           # Zod validation schemas
prisma/
├── schema.prisma         # Database schema
├── migrations/           # Migration history
└── seed.ts               # Seed script
```

## Subscription Tiers

| Feature | Free | Pro | Gold |
|---------|------|-----|------|
| Accounts | 3 | Unlimited | Unlimited |
| Categories | 5 | Unlimited | Unlimited |
| Transactions | 3 | Unlimited | Unlimited |
| Billing | — | Monthly | Yearly |

## Database Schema

- **Account** — User financial accounts (currency, color, default flag)
- **Category** — Custom transaction categories
- **Transaction** — Income and expense entries linked to accounts and categories
- **UserSettings** — Dashboard preferences (chart type, period, sorting, pagination)
- **Subscription** — Stripe subscription tracking (type, status, customer ID)

## Deployment

The app is ready for deployment on [Vercel](https://vercel.com) or any Docker-compatible platform. Set all required environment variables in your hosting provider's dashboard before deploying.
