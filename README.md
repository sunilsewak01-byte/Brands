# ReconcileX | Pharma Portfolio Intelligence & Reconciliation Studio

A modern, high-performance **Vite + React** web application engineered for pharmaceutical portfolio reconciliation, clinical indication analysis, and commercial intelligence.

---

## 🚀 Key Features & Left Sidebar Analytical Suites

### 1. 📊 Executive Overview (`/overview`)
- **Key Executive Metric Cards**: Total Unified Products, FDCs / Multi-APIs, Single Active Molecules, Originator Reference Footprint, Functional Pharmacological Classes, and Oral Delivery Modalities.
- **Interactive Visualizations (Chart.js)**:
  - Therapeutic Area Volume Distribution (Horizontal Bar)
  - Commercial Franchise SKU Allocations (Vertical Bar)
  - Product Classification Mix (Doughnut Chart)
  - Delivery Modality Breakdown (Pie Chart)
  - Top Originator & Innovator Footprint (Bar Chart)
- **Interactive Click-Throughs**: Clicking on any bar, pie segment, or KPI card immediately opens a filtered subset modal with dossier inspection capabilities.

### 2. 🩺 Therapeutic & Clinical Intelligence (`/therapeutic`)
- Detailed breakdown across all Therapeutic Areas (e.g. Women's Health, Hematology, Ophthalmology, Dermatology, Cardiology, Endocrinology, Respiratory, etc.).
- Active clinical conditions & indications explorer.
- Monotherapy vs. Fixed-Dose Combination (FDC) ratios per therapeutic specialty.

### 3. 🧬 Molecules & Formulation Studio (`/molecules`)
- Distinct Active Pharmaceutical Ingredients (APIs) catalog.
- Functional & Pharmacological MOA Class Explorer (e.g., GnRH antagonist, Combined hormonal contraceptive, Alpha-2 agonist, CAI + Beta Blocker, ARB + CCB + Diuretic).
- Dedicated FDC Synergy Matrix displaying multi-component active ingredients.

### 4. 🏢 Commercial Franchises & Teams (`/commercial`)
- Division and Sales Team portfolios (Valensia, Illuma, Zillion, Mexlon, Maxcor, Axys, Avecea).
- Therapeutic coverage and route allocations per commercial franchise.
- Complete assigned brand rosters with direct dossier viewers.

### 5. 🏆 Originator & Innovator Landscape (`/innovators`)
- Global originator footprint analysis (AbbVie, Bayer, Abbott, Galderma, Allergan, Merck, Sanofi, Boehringer Ingelheim, AstraZeneca, Astellas, Pfizer, Mylan).
- Direct mapping of reference innovator brand names to internal generic formulations.

### 6. 📑 Unified Product Master Explorer (`/explorer`)
- Comprehensive, sortable, and searchable master table.
- Interactive multi-row audit badges showing exactly how many raw source rows merged into each consolidated product.
- Click **"View"** on any row to open the full **Clinical & Commercial Dossier Modal**.
- Pagination (10, 25, 50, 100 rows per page).

### 7. ⚙️ Reconciliation & Data Ops Engine (`/reconcile`)
- Spreadsheet drag-and-drop file uploader supporting `.xlsx`, `.xls`, and `.csv`.
- Primary Key / ID column auto-detection and custom selector.
- Tokenized join delimiter configuration (`; `, `;`, `, `, ` | `, and custom delimiters).
- Case-insensitive deduplication and alphabetical sorting toggles.
- Real-time reconciliation metric indicators (Input Rows, Consolidated Records, Merged Rows, Columns Retained).
- Audit Trail Comparison viewer showing original unmerged rows alongside the resulting unified record.

---

## 🛠️ Technology Stack
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS + Custom Design System tokens
- **Data & Excel Processing**: SheetJS (`xlsx`)
- **Visual Analytics**: Chart.js 4 + React-Chartjs-2
- **Iconography**: Lucide React

---

## 💻 Running Locally

```bash
# Install dependencies
npm install

# Start Vite dev server
npm run dev

# Build for production
npm run build
```

The application runs locally on `http://127.0.0.1:3000/`.
