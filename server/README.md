# Mandi Ledger — Backend API

Express 5 + TypeScript + Prisma 7 + PostgreSQL backend for the Ledger Noir rice mandi inventory system.

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20+ |
| Framework | Express 5 |
| Language | TypeScript (NodeNext modules) |
| ORM | Prisma 7 (pg adapter) |
| Database | PostgreSQL via Prisma local dev server |
| Auth | JWT access tokens (15 min) + refresh tokens (7 days) |
| Validation | Zod v4 |
| Logging | Pino + pino-http |

## Project Structure

```
server/
├── src/
│   ├── index.ts                 # Entry point
│   ├── app.ts                   # Express app factory
│   ├── lib/
│   │   ├── logger.ts            # Pino logger
│   │   ├── prisma.ts            # Prisma client singleton (pg adapter)
│   │   ├── jwt.ts               # Access + refresh token utils
│   │   └── schemas.ts           # Zod validation schemas
│   ├── middleware/
│   │   ├── authenticate.ts      # JWT Bearer auth + requireRole()
│   │   ├── asyncHandler.ts      # Async error wrapper
│   │   ├── errorHandler.ts      # Centralized error handler
│   │   └── notFound.ts          # 404 handler
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── stock.routes.ts
│   │   ├── supplier.routes.ts
│   │   ├── purchase.routes.ts
│   │   ├── sales.routes.ts
│   │   ├── customer.routes.ts
│   │   ├── riceVariety.routes.ts
│   │   ├── dashboard.routes.ts
│   │   └── report.routes.ts
│   └── controllers/
│       ├── auth.controller.ts
│       ├── stock.controller.ts
│       ├── supplier.controller.ts
│       ├── purchase.controller.ts
│       ├── sales.controller.ts
│       ├── customer.controller.ts
│       ├── riceVariety.controller.ts
│       ├── dashboard.controller.ts
│       └── report.controller.ts
└── prisma/
    ├── schema.prisma            # Data models
    ├── prisma.config.ts         # Prisma 7 config (datasource URL)
    └── seed.ts                  # Database seeder
```

## Quick Start

### 1. Start the local database
```powershell
# In one terminal — keep this running
cd server
npx prisma dev
```

### 2. Push schema & seed
```powershell
npx prisma db push --schema=prisma/schema.prisma
npx tsx prisma/seed.ts
```

### 3. Start the API server
```powershell
npx tsx watch src/index.ts
# or: npm run dev
```

API is available at **http://localhost:8000**

## API Reference

### Auth (`/api/auth`)
| Method | Path | Description |
|---|---|---|
| POST | `/register` | Create account |
| POST | `/login` | Login → returns access + refresh tokens |
| POST | `/refresh` | Rotate refresh token |
| POST | `/logout` | Revoke session |
| GET | `/me` | Current user info |

**Default credentials:** `admin@mandi.local` / `Admin@1234`

### Stock (`/api/stock`) 🔒
| Method | Path | Description |
|---|---|---|
| GET | `/` | All stock entries (matches frontend `StockEntry` shape) |
| POST | `/` | Create stock entry |
| GET | `/low` | Below-threshold items |
| GET | `/:id` | Single entry |
| PATCH | `/:id` | Update quantity |
| DELETE | `/:id` | Delete |

### Suppliers (`/api/suppliers`) 🔒
Full CRUD with pagination. `GET /:id` includes purchase history and total volume.

### Purchases (`/api/purchases`) 🔒
- `POST /` — Creates purchase and **atomically increments stock**
- `PATCH /:id/status` — Update payment status

### Sales (`/api/sales`) 🔒
- `POST /` — Validates stock, creates sale and **atomically decrements stock**
- Returns `422` if insufficient stock with detailed message

### Customers (`/api/customers`) 🔒
Full CRUD with pagination.

### Rice Varieties (`/api/rice-varieties`) 🔒
Full CRUD. List includes current stock quantities per variety.

### Dashboard (`/api/dashboard/summary`) 🔒
Single endpoint returns: KPI cards, stock gauge data, today's ledger entries.

### Reports (`/api/reports`) 🔒
| Path | Description |
|---|---|
| `GET /profit-loss?from=&to=` | P&L by variety |
| `GET /stock-movement?from=&to=&varietyId=` | Stock in/out log |
| `GET /top-suppliers?limit=5` | Top suppliers by value |
| `GET /top-customers?limit=5` | Top customers by value |

## Environment Variables

Copy `.env.example` to `.env`:
```
DATABASE_URL=postgres://postgres:postgres@localhost:51214/template1?...
PORT=8000
NODE_ENV=development
LOG_LEVEL=info
JWT_SECRET=<random 64-char string>
JWT_REFRESH_SECRET=<another random 64-char string>
CLIENT_URL=http://localhost:5173
```

## Database Scripts

```powershell
npm run db:push      # Sync schema to DB (dev only)
npm run db:migrate   # Create a migration (production)
npm run db:seed      # Seed with sample data
npm run db:studio    # Open Prisma Studio
npm run db:reset     # Reset + reseed (destructive!)
```

## Changelog

- **v1.3.1**: Standardized ERP document templates to use A4-compliant layout (`invoice.html`), resolved page height overflow in print stylesheet to prevent empty second page, and corrected spelling to "MB BHARATH RICE MANDI".

