# Mandi Ledger (v1.1.0)

A production-grade, ledger-inspired ERP and stock management system tailored specifically for a grain mandi (market) and warehouse operations. Built with React, Tailwind CSS, Python FastAPI, and PostgreSQL-ready data models, this system abandons generic SaaS templates in favor of a bespoke, physical-ledger aesthetic characterized by stamped typography, brass hairlines, and variety-specific grain tracking.

## 🌾 Features

- **Enterprise Document Viewer (Reports):** A completely bespoke reporting workspace that acts like a printed physical ledger, complete with a sticky report library, data insights, and right-aligned tabular financial data.
- **Industrial Login Portal:** A robust, split-pane login interface featuring paper textures, watermark branding, shake-animations for invalid credentials, and standard JWT-ready inputs.
- **Mandi Board Ticker:** A horizontally swipeable snapshot of core metrics (Total Stock, Purchases, Sales) designed to resemble a mechanical count-up board.
- **Ledger-Style Index:** Navigation built to resemble physical ledger tabs that strictly lock to the viewport without detaching.
- **Unified CRUD Workflows:** Symmetrical, non-obtrusive bottom-sheet drawers (on mobile) and right-side slide-outs (on desktop) for Purchases, Sales, and Stock adjustments.
- **Mobile-First Data Density:** Data tables adapt to stacked "Ledger Cards" on mobile devices to prevent horizontal squeezing and preserve tabular alignment.

## 🛠 Tech Stack

### Frontend
- **Framework:** React 18 (Vite)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Custom Color System + No default styles)
- **Animation:** Framer Motion
- **Icons:** Lucide React

### Backend (API)
- **Runtime:** Python 3.11+
- **Framework:** FastAPI
- **Server:** Uvicorn
- **Validation:** Pydantic
- **Database:** PostgreSQL-ready

## 🎨 Design System: "Ledger Noir"

The application uses a strict 6-token color palette:
- `Godown Ink` (`#14201A`): Primary text and heavy borders.
- `Husk Stone` (`#E9EBDF`): Main application background.
- `Husk Stone Light` (`#F8F9F3`): Elevated surfaces (cards, sheets).
- `Turmeric` (`#D9A02C`): Active states and primary actions.
- `Mandi Brass` (`#8C6F3E`): Hairline rules and dividers.
- `Ledger Red` (`#A6362C`): Void actions and critical stock alerts.
- `Paddy Green` (`#4C6B3F`): Positive metrics and "In Stock" badges.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Python 3.11 or higher
- PostgreSQL Database
- npm or yarn

### Installation (Frontend)
1. Clone the repository
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

### Installation (Backend)
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install backend dependencies:
   ```bash
   python -m venv .venv
   .venv\Scripts\activate
   pip install -r requirements.txt
   ```
3. Start the FastAPI development server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
4. Open the interactive API docs at `http://localhost:8000/docs`.

## 📂 Project Structure

```text
mandi-ledger/
├── backend/          # FastAPI service and stock API
├── src/
│   ├── components/
│   │   ├── layout/   # App layout, Ticker, and Ledger Index navigation
│   │   └── ui/       # Reusable branded components (StampHeader, Drawer, etc.)
│   ├── data/         # State management and mock API hooks (useStock)
│   ├── pages/        # Core views (Dashboard, Stock, Purchases, Sales, Reports, Login)
│   └── lib/          # Utility functions
└── README.md
```

## 📝 License
Proprietary - All rights reserved.
