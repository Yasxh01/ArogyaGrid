# ArogyaGrid 🏥🇮🇳
### Intelligent, Offline-Ready Healthcare Supply Chain & Telemetry Network for India's 1,50,000+ Health Centres

[![Live Demo](https://img.shields.io/badge/Live%20Demo-arogya--grid.vercel.app-0070F3?style=flat&logo=vercel&logoColor=white)](https://arogya-grid.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Mobile Ready](https://img.shields.io/badge/Mobile-Ready%20%26%20Touch%20Optimized-success.svg)](frontend/)
[![Privacy: DPDP Act 2023](https://img.shields.io/badge/Privacy-100%25%20DPDP%20Compliant-blue.svg)](specs/)
[![Offline First](https://img.shields.io/badge/Offline-IndexedDB%20Sync-teal.svg)](frontend/)

🌐 **Live Web Application**: [https://arogya-grid.vercel.app/](https://arogya-grid.vercel.app/)  
📖 **Quick Links**: [Live Demo](https://arogya-grid.vercel.app/) • [1-Click Test Accounts](#-try-it-live--demo-accounts) • [How It Works](#-what-arogyagrid-does) • [Architecture](#-system-architecture) • [Docker Quickstart](#-quick-start-with-docker)

---

## 💡 The Real-World Problem

In rural and semi-urban India, millions of citizens travel miles to their local **Primary Health Centre (PHC)**, only to find that basic medicines like Paracetamol, Oral Rehydration Salts (ORS), or emergency anti-snake venom are out of stock.

Meanwhile, a neighbouring clinic just 15 km away often has a surplus of those exact medicines sitting on shelves, risking expiration. Because frontline health workers are overwhelmed by manual paper registers and lack connected tools, shortages are only discovered after shelves are already empty.

**ArogyaGrid solves this by turning every health centre into a smart, connected, and self-balancing node.**

---

## ✨ What ArogyaGrid Does

### 🔮 7-Day Advance Shortage Warning
Instead of waiting for a stockout to happen, AI analyzes daily medicine burn rates, seasonal health trends, and weather patterns to alert health officers up to **7 days before shelves run empty**.

### 🗣️ Speak in Hindi & Regional Languages, Zero Typing
Village frontline workers (ASHA and ANM staff) can simply speak into their phone or kiosk tablet (e.g., *"आज 50 पैरासिटामोल और 20 ओआरएस दिए"*). The speech engine automatically parses the medicine names and updates clinic inventory within seconds.

### 🔄 Smart Inter-Clinic Restocking
When a clinic is running low on critical supplies (like antibiotics or rabies vaccines), ArogyaGrid automatically identifies nearby health centres with healthy surplus stocks and coordinates a restock transfer by road or emergency medical drone.

### ❄️ Vaccine Cold-Chain Guardian
Vaccines lose potency if temperatures rise above 8°C. Continuous IoT thermal telemetry tracks vaccine refrigerators (ILRs) 24/7 and triggers automated warnings before summer heatwaves or power cuts spoil life-saving vaccines.

### 🛏️ Live Hospital Bed & Clinical Management
Doctors and hospital staff track and manage live admissions across 4 bed tiers (**General, Oxygen, ICU, Pediatric**) with single-tap admissions, discharges, and patient queue triage.

### 📸 Paper Delivery Slip & Challan Scanner
Frontline staff can snap a photo of paper delivery challans and handwritten supplier slips. Multimodal AI reads the handwriting and logs the batches, expiry dates, and quantities directly into digital inventory.

### ⚡ 100% Offline-First Operation
Rural health clinics continue working without interruption during power cuts or internet outages. All transactions are securely stored on the local device and automatically synchronize with the central grid once connectivity returns.

### 🔒 Privacy-Preserving AI (DPDP Act 2023 Compliant)
Patient identities and sensitive medical records never leave their local hospital. Only privacy-protected learning trends are shared across state health networks.

---

## 👥 4 Tailored Roles for Every Level of Healthcare

ArogyaGrid provides specialized dashboards designed for each stakeholder:

| Role | Who Uses It | What They Can Do |
|:---|:---|:---|
| 🏛️ **National Health Director** | Ministry & State Health Leaders | Nationwide inventory trends, national medicine formulary, cloud telemetry, and AI health models. |
| 🗺️ **District Health Officer** | Chief Medical Officers (CMO) | "Live Health Centres & Clinic Map", automated stockout early warnings, and 1-click supply transfer approvals. |
| 🩺 **Medical Officer / Doctor** | PHC & Hospital Doctors | Live ICU & Oxygen bed admissions, patient triage queue, and clinical staff duty rosters. |
| 📱 **Frontline PHC Worker** | ASHA, ANM & Pharmacy Staff | Vernacular voice intake, paper challan photo scanning, daily medicine dispensing, and offline sync. |

---

## 🔑 Try It Live — Demo Accounts

You can test any role instantly using our 1-click demo buttons on the login portal:

| Role | Demo Email | Password | Access Scope |
|:---|:---|:---|:---|
| **National Admin** | `admin@arogyagrid.gov.in` | `password123` | National Catalog, Cloud Telemetry, AI Models |
| **District Officer** | `district.ranchi@arogyagrid.gov.in` | `password123` | Live GIS Clinic Map, Triage Alerts, Transfer Approvals |
| **Medical Officer** | `doctor.ranchi@arogyagrid.gov.in` | `password123` | Bed Matrix, Patient Queue, Staff Rostering |
| **PHC Staff** | `phc.ranchi01@arogyagrid.gov.in` | `password123` | Voice Dispensing, Paper Challan OCR, Offline Sync |

> **Note**: You can also click **Create Account** on the portal to register custom doctors or health officers for any district.

---

## 📱 Device & Mobile Compatibility

- **Desktop PCs & Monitors**: Features a "Smart Viewport Lock" where the portal fits comfortably on screen with zero page jumping or unwanted scrollbars.
- **Laptops & Tablets**: Responsive multi-column grids that adapt smoothly to horizontal and vertical tablet views (iPad / Android).
- **Smartphones**: Fully touch-friendly layout with pinch-to-zoom interactive maps, 44px easy-tap buttons, and horizontally swipeable inventory tables.

---

## 🏛️ System Architecture

```
                                 ┌─────────────────────────────────┐
                                 │   ArogyaGrid React 18 Web/PWA   │
                                 │  (Tailwind CSS + Lucide Icons)  │
                                 └───────────────┬─────────────────┘
                                                 │ REST & WebSocket
                                                 ▼
┌─────────────────────────┐       ┌─────────────────────────────────┐       ┌─────────────────────────┐
│   Python ML Service     │ ◄───► │  Node.js Express Orchestrator   │ ◄───► │   Model Context Protocol│
│(FastAPI + FedAvg + DP)  │       │ (REST Gateway + Socket.io)      │       │     (MCP Health Tools)  │
└─────────────────────────┘       └───────────────┬─────────────────┘       └─────────────────────────┘
                                                  │
                                                  ▼
                                  ┌─────────────────────────────────┐
                                  │ PostgreSQL 16 / Embedded Store  │
                                  │ (Idempotency & Resilient Store) │
                                  └─────────────────────────────────┘
```

### Technology Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Leaflet Maps, Lucide Icons
- **Backend Orchestrator**: Node.js, Express, Socket.io (real-time alerts)
- **Machine Learning**: Python FastAPI, Scikit-Learn (Random Forest predictive engine), Federated Averaging (`FedAvg`)
- **Cloud & AI Integrations**: Google Cloud BigQuery, Gemini Vision OCR, Web Speech API
- **Data & Storage**: PostgreSQL 16, SQLite (embedded local development), IndexedDB (browser offline queue)

---

## 🐳 Quick Start with Docker

Launch the complete stack (PostgreSQL database, Node.js backend, Python ML service, MCP tool server, and React frontend) with a single command:

```bash
docker compose up --build -d
```

### Port Overview

| Service | Container Name | Address |
|:---|:---|:---|
| **Frontend Web App** | `arogyagrid_frontend` | `http://localhost:3000` |
| **Backend REST & WS** | `arogyagrid_backend` | `http://localhost:5000` |
| **Python ML Engine** | `arogyagrid_ml_service` | `http://localhost:8000` |
| **MCP Agent Server** | `arogyagrid_mcp_server` | Stdio / JSON-RPC |
| **PostgreSQL Database** | `arogyagrid_postgres` | `localhost:5432` |

To stop the containers:
```bash
docker compose down
```

---

## 💻 Manual Local Setup

If you prefer to run services individually:

### Prerequisites
- Node.js (v18+)
- Python (v3.10 or v3.11)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/Yasxh01/ArogyaGrid.git
cd ArogyaGrid
```

### 2. Start Python ML Microservice (Port 8000)
```powershell
cd ml_service
pip install -r requirements.txt
py -3.11 -m uvicorn app.main:app --port 8000 --reload
```
*Interactive API documentation: `http://localhost:8000/docs`*

### 3. Start Node.js Backend (Port 5000)
```powershell
cd ../backend
npm install
npm start
```
*Health Check: `http://localhost:5000/api/v1/health`*

### 4. Start React Frontend (Port 3000)
```powershell
cd ../frontend
npm install
npm run dev
```
*Open `http://localhost:3000` in your web browser.*

---

## 🧪 Testing

### Backend Integration & Subsystem Tests
```powershell
cd backend
npm test
node src/test/e2e_full_check.js
```

### Python ML Unit Tests
```powershell
cd ml_service
py -3.11 test_ml.py
```

### Frontend Build Verification
```powershell
cd frontend
npm run build
```

---

## 🔌 Model Context Protocol (MCP) Server

ArogyaGrid includes a standard Model Context Protocol (MCP) server enabling AI agents to query hospital logistics:

```powershell
cd mcp_server
npm install
node index.js
```

**Available MCP Tools**:
- `get_phc_inventory_status`: Real-time stock, beds, and staff telemetry.
- `simulate_stockout_risk`: Days-to-Stockout predictions.
- `propose_resource_transfer`: Inter-clinic restocking recommendations.
- `trigger_federated_round`: State-level privacy-preserving learning.

---

## 📄 License
Distributed under the MIT License. See [LICENSE](LICENSE) for more information.
