# 📦 Warehouse Dispatch System & Terminal Console

[![React](https://img.shields.io/badge/Frontend-React%2018-blue.svg?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Playwright](https://img.shields.io/badge/E2E%20Testing-Playwright-45ba4b.svg?logo=playwright&logoColor=white)](https://playwright.dev/)
[![Vite](https://img.shields.io/badge/Bundler-Vite-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/UI-Tailwind%20CSS-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> An enterprise warehouse dispatch management system and logistics staging terminal console featuring dynamic tariff calculation rules, gate security clearance, dispatch tracking, and end-to-end Playwright workflow verification.

---

## ⚡ Core Architecture & Workflow Capabilities

1. **Logistics Dispatch & Gate Clearance**
   - Truck and trailer intake with barcode scanning, gross vehicle weight (GVW) validation, and dock bay assignments.
   - Dynamic demurrage, dwell time, and zone tariff pricing engine.

2. **Terminal Staging Telemetry & Bay Scheduling**
   - Live visual layout of dock doors, staging buffers, and active loading/unloading progress.
   - Real-time exception notifications (capacity limits, priority freight escalations, seal discrepancies).

3. **Automated E2E Test Suite (`tests/dispatch-workflow.spec.ts`)**
   - Comprehensive Playwright end-to-end automated testing covering user login, dispatch ticket creation, tariff recalculation, and manifest generation.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Web** | React 18, TypeScript, Tailwind CSS, Lucide React |
| **E2E Testing** | Playwright (`playwright.config.ts`), Chromium, Firefox, WebKit |
| **Bundler & Build** | Vite, Bun / npm |

---

## 🚀 Setup & Execution

### 1. Installation
```bash
git clone https://github.com/abhisheikraja2007-droid/Warehouse-Dispatch-System-Console.git
cd Warehouse-Dispatch-System-Console
npm install
```

### 2. Run Application
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 3. Run E2E Test Suite
```bash
npx playwright test
```

---

## 📝 License
This project is licensed under the MIT License.
