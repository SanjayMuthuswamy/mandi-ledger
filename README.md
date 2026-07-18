# Ledger Noir — Rice Mandi ERP & Inventory System (v1.3.1)

A production-grade, ledger-inspired ERP and inventory management system designed specifically for grain mandi (market) and warehouse operations. 

Discarding generic SaaS layouts, **Ledger Noir** implements a bespoke physical-ledger aesthetic characterized by stamped typography, brass hairlines, and variety-specific grain tracking.

---

## 🚀 Live Production Links
* **Frontend UI (Vercel):** [https://mandi-ledger.vercel.app](https://mandi-ledger.vercel.app)
* **Backend API (Render):** [https://mandi-ledger-backend.onrender.com/api](https://mandi-ledger-backend.onrender.com/api)
* **Database (Supabase):** PostgreSQL database powered by Supabase with connection pooling.

---

## 🛠 Tech Stack

### Frontend (Client)
* **Framework:** React 19 (Vite)
* **Language:** TypeScript
* **Styling:** Vanilla CSS & Tailwind CSS (Custom Color System)
* **Animation:** Framer Motion
* **Reporting:** jsPDF & jsPDF-AutoTable (Client-side custom PDF generator)
* **Invoice Template:** Custom HTML/JS tax invoice renderer (`invoice.html`) connected to live API data.

### Backend (Server)
* **Runtime:** Node.js (v18+)
* **Framework:** Express with TypeScript
* **ORM:** Prisma v7 (configured with the `pg` driver adapter for pooled connections)
* **Database:** Supabase (PostgreSQL)
* **Logger:** Pino & Pino-HTTP

---

## 🌾 Core Functional Requirements Met

1. **Secure Admin Login:**
   * High-security credential storage using `bcrypt` (12 rounds) on the database.
   * Role-based access control (Admin / User) with secure JWT Access & Refresh Tokens.
2. **Interactive Dashboard:**
   * Live count-up cards showing **Total Stock**, **Total Purchases**, and **Total Sales**.
   * Low stock alerts if quantity drops below threshold levels.
   * Real-time ledger entries displaying today's transactions.
3. **Rice Stock Management:**
   * Full CRUD operations: Add new rice stock, update stock quantities, delete stock entries.
   * Responsive list/card views, real-time search, and visual grain capacity gauges.
4. **Supplier Management:**
   * Add supplier profiles with contact and GSTIN details.
   * Detailed ledger view displaying total value supplied and comprehensive purchase logs.
5. **Purchase Management:**
   * Record transactions including Supplier Name, Rice Variety, Quantity, and rate.
   * View details in drawer timeline.
   * Update payment status directly from the Purchase Details Drawer.
6. **Sales Management & Real-Time Invoicing:**
   * Record sales specifying Customer Name, Rice Variety, Quantity sold, and invoice details.
   * **Custom Print & Download**: Open and render beautiful, print-ready TAX INVOICES using the dedicated tax invoice template engine (`invoice.html`), loaded dynamically with real-time sales data.
   * Update payment status, transaction method, and amount paid.
7. **Automated Inventory Management:**
   * **Atomic Database Transactions:** Registering a purchase automatically increases stock levels. Registering a sale atomically deducts from stock.
   * **Stock Checks:** The system checks stock availability during sales and prevents sales if the inventory is insufficient.
8. **Reports Workspace:**
   * Separate, filterable reports for **Inventory Stock**, **Purchases**, and **Sales**.
   * Clean financial data tables with status toggles (PAID / PENDING).
   * **Export PDF:** Custom jsPDF client-side exports styled as a formal ledger printout, featuring "grid" line layouts and automatic "COMPUTER VERIFIED DOCUMENT" verification tags.
   * **Print Format:** Specialized CSS styling for clean browser printing.
9. **Settings Controls:**
   * Manage users, warehouses, and rice varieties.
   * Full editing capabilities in Settings using model-based state drawers.

---

## 📂 Project Structure

```text
mandi-ledger/
├── vercel.json         # SPA redirection configurations for Vercel
├── invoice.html        # Tax Invoice template
├── invoice.css         # Styling for Tax Invoice
├── invoice.js          # Dynamic data fetch & mapping script for Tax Invoice
├── src/                # React Frontend Code
│   ├── components/     # Reusable layout and branded UI elements
│   ├── contexts/       # Global State (AuthContext, etc.)
│   ├── data/           # React Query/Fetch API hooks
│   ├── pages/          # Core views (Dashboard, Stock, Purchases, Sales, Reports, Settings, Login)
│   └── lib/            # Utilities (PDF generator, API client)
├── server/             # Express Backend Code
│   ├── prisma/         # Prisma Schema and Seeds
│   ├── src/
│   │   ├── controllers/# API controller logic (Auth, Sales, Stock, Reports, etc.)
│   │   ├── routes/     # Express Route declarations
│   │   ├── middleware/ # Error Handling and Route guards
│   │   └── lib/        # Shared packages (Prisma Client pool, JWT signing)
│   └── tsconfig.json
└── README.md
```

---

## ⚙️ Getting Started Locally

### Prerequisites
* **Node.js** (v18+)
* **npm** (v9+)
* **Supabase** or any **PostgreSQL** instance

### 1. Database Setup
1. Create a PostgreSQL database (e.g., on Supabase).
2. Grab the **Transaction Connection Pooler** string (Port `6543`).

### 2. Backend Config & Run
1. Go to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file inside `server/` with:
   ```env
   DATABASE_URL="postgresql://postgres.xxx:password@aws-xx.pooler.supabase.com:6543/postgres"
   PORT=8000
   NODE_ENV=development
   JWT_SECRET="your-development-access-secret"
   JWT_REFRESH_SECRET="your-development-refresh-secret"
   CLIENT_URL="http://localhost:5173"
   ```
4. Run migrations & seed data:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```
5. Start development server:
   ```bash
   npm run dev
   ```

### 3. Frontend Config & Run
1. Go back to the root directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root with:
   ```env
   VITE_API_URL="http://localhost:8000/api"
   ```
4. Run frontend:
   ```bash
   npm run dev
   ```

---

## 🎨 Aesthetic Design Tokens
* **Godown Ink (`#14201A`):** Strong, structural text and heavy borders.
* **Husk Stone (`#E9EBDF`):** Off-white base reminiscent of physical ledger paper.
* **Mandi Brass (`#8C6F3E`):** Golden accents and dividers representing polished brass scales.
* **Ledger Red (`#A6362C`):** High-priority alerts and void actions.
* **Paddy Green (`#4C6B3F`):** Standard color for successful transactions and healthy stock metrics.

