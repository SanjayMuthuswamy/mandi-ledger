# Mandi Ledger

A production-grade, ledger-inspired stock management system tailored specifically for a grain mandi (market). Built with React, Tailwind CSS, and Framer Motion, this system abandons generic SaaS templates in favor of a bespoke, physical-ledger aesthetic characterized by stamped typography, brass hairlines, and variety-specific grain tracking.

## 🌾 Features

- **Mandi Board Ticker:** A horizontally swipeable snapshot of core metrics (Total Stock, Purchases, Sales) designed to resemble a mechanical count-up board.
- **Grain Gauge Matrix:** A custom UI component using dot-textured patterns (mimicking grain) to visualize stock levels across different rice varieties. Features dynamic pulsing when stock drops below designated thresholds.
- **Ledger-Style Index:** Navigation built to resemble physical ledger tabs.
- **Unified CRUD Workflows:** Symmetrical, non-obtrusive bottom-sheet drawers (on mobile) and right-side slide-outs (on desktop) for Purchases, Sales, and Stock adjustments.
- **Mobile-First Data Density:** Data tables adapt to stacked "Ledger Cards" on mobile devices to prevent horizontal squeezing and preserve tabular alignment.
- **Responsive Trend Reporting:** Recharts integration rendering vertical bars on desktop and horizontal bars on mobile for optimal legibility of long variety names.

## 🛠 Tech Stack

- **Framework:** React 18 (Vite)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (Custom Color System + No default styles)
- **Animation:** Framer Motion
- **Forms & Validation:** React Hook Form + Zod
- **Data Visualization:** Recharts
- **Icons:** Lucide React

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
- npm or yarn

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```

## 📂 Project Structure

```text
src/
├── components/
│   ├── layout/       # App layout, Ticker, and Ledger Index navigation
│   └── ui/           # Reusable branded components (GrainGauge, StampHeader, Drawer, etc.)
├── data/             # State management and mock API hooks (useStock)
├── pages/            # Core views (Dashboard, Stock, Purchases, Sales, Suppliers, Reports)
└── lib/              # Utility functions
```

## 📝 License
Proprietary - All rights reserved.
