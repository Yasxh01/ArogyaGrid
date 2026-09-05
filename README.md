# ArogyaGrid 🏥🇮🇳
### Resilient, Offline-First & Federated AI Healthcare Supply Chain Platform for India's PHC Network

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Architecture: New Developer Stack](https://img.shields.io/badge/Stack-AGENTS.md%20|%20MCP%20|%20OpenAPI-indigo.svg)](AGENTS.md)
[![Privacy: DPDP Act 2023](https://img.shields.io/badge/Privacy-FedAvg%20%2B%20DiffPrivacy-blue.svg)](specs/)
[![Offline: IndexedDB Sync](https://img.shields.io/badge/Offline-PWA%20Idempotent-teal.svg)](frontend/)

ArogyaGrid is an offline-capable, resilient, and federated AI-driven healthcare supply chain and hospital resource orchestration platform designed specifically for India's **150,000+ Primary Health Centres (PHCs)**, Community Health Centres (CHCs), and Sub-Centres.

It enables real-time tri-resource tracking, automated stockout early warnings, dynamic ICU/Oxygen bed admissions, staff duty check-ins, inter-district emergency supply transfers, vernacular Hindi voice intake, and privacy-preserving state-level Federated Machine Learning.

---

## 🌟 Key Capabilities

1. **Tri-Resource Scoped Telemetry**:
   - **Medicines & Vaccines**: Real-time stock levels, daily burn rate forecasting, expiry tracking, and cold-chain compliance.
   - **Dynamic Bed Matrix**: Live tracking and one-click admission/discharge across 4 bed tiers: `GENERAL`, `OXYGEN`, `ICU`, and `PEDIATRIC`.
   - **Staff Attendance Roster**: Shift check-ins for Medical Officers, Specialists, Staff Nurses, and Pharmacists.

2. **Transaction Idempotency & Resilient Offline Sync**:
   - Frontline touch kiosks operate fully offline during grid power cuts or internet outages.
   - Every transaction is assigned a cryptographically unique `transaction_uuid`, queued in IndexedDB, and safely synchronized to `/api/v1/telemetry/intake` upon reconnection without double-counting.

3. **Privacy-Preserving Federated Learning (FedAvg + Differential Privacy)**:
   - **DPDP Act 2023 Compliant**: Zero raw patient records or hospital logs are transmitted across state boundaries.
   - State hospital nodes (Bihar, Jharkhand, Odisha, West Bengal, Assam) train local gradient weights. The central coordinator aggregates weights using Federated Averaging (`FedAvg`) perturbed with Laplace Differential Privacy noise ($\epsilon=1.0$).

4. **Multi-Criteria Cross-District Supply Logistics & Escrow**:
   - Automated detection of impending stockouts (e.g. Days-to-Stockout $DTS < 3$).
   - Rebalances supplies between donor and recipient PHCs while enforcing a **30-day safety reserve invariant** for donor facilities.

5. **Frontline Vernacular Hindi Voice Intake**:
   - Touch kiosk equipped with the Web Speech API and NLP parser, enabling healthcare workers to record stock consumption and dispense medicines in spoken Hindi or English (e.g., *"आज 50 पैरासिटामोल और 20 ओआरएस दिए"*).

6. **Role-Based Access Control (RBAC)**:
   - **National Admin**: National formulary catalog management, custom drug creation, and nationwide federated learning trigger.
   - **District Health Officer**: Interactive GIS command triage map, stockout escalation alerts, and cross-district transfer approvals.
   - **Medical Officer / Doctor**: Dynamic clinical bed admitting/discharge console and medical duty roster.
   - **PHC Staff / Worker**: Simplified touch kiosk with 1-click voice intake and offline queue sync.

---

## 🏛️ System Architecture

```
                                 ┌─────────────────────────────────┐
                                 │   ArogyaGrid React 18 Web/PWA   │
                                 │    (Tailwind CSS + Lucide)      │
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

---

## 📂 Repository Structure

```
ArogyaGrid/
├── AGENTS.md                  # System identity, architectural invariants & agent SOPs
├── llms.txt                   # LLM-optimized architectural index
├── docker-compose.yml         # Container orchestration (backend, ML microservice, Postgres)
├── specs/                     # Contract specifications
│   ├── openapi-telemetry.yaml # REST API schema
│   └── asyncapi-events.yaml   # Real-time WebSocket event schemas
├── skills/                    # Reusable Agent standard operating procedures
│   ├── supply-forecasting/    # Inventory depletion prediction
│   ├── disaster-rebalance/    # Emergency logistics & transfer heuristics
│   └── federated-node-audit/  # State node gradient validation & DP verification
├── backend/                   # Node.js Express REST & WebSocket gateway
│   ├── src/controllers/       # Auth, Stock, Bed, Staff, Transfer, District, AI, ML controllers
│   ├── src/services/          # Business logic, ML clients, and Socket.io broadcast
│   ├── src/db/                # SQL schema and seed data
│   └── src/test/              # Comprehensive integration & E2E test suites
├── frontend/                  # React 18 + Vite PWA
│   ├── src/views/             # Scoped Dashboards (Admin, District, Doctor, PHC Worker, AuthPortal)
│   ├── src/components/        # MapView, BedMatrix, StockManager, StaffRoster, FederatedCenter
│   ├── src/context/           # AuthContext (RBAC) & SocketContext (Live alerts)
│   └── src/api/               # JWT client & IndexedDB offline queue
├── ml_service/                # Python FastAPI Microservice
│   └── app/core/              # RandomForest predictor, FedAvg coordinator, DP engine
└── mcp_server/                # Model Context Protocol (MCP) server exposing typed tools
```

---

---

## 🐳 Docker Deployment (1-Command Full-Stack Launch)

You can launch the entire ecosystem (PostgreSQL, Python ML microservice, Node.js Backend, Model Context Protocol Server, and React Frontend) with a single Docker Compose command:

```bash
# Build and spin up all 5 containers
docker compose up --build -d
```

### Container Port Mapping

| Service | Container Name | Port | Description |
|---|---|---|---|
| **Frontend PWA** | `arogyagrid_frontend` | `http://localhost:3000` | React 18 Web App & Touch Kiosks |
| **Backend REST & WS** | `arogyagrid_backend` | `http://localhost:5000` | Express Orchestrator & Socket.io |
| **Python ML Engine** | `arogyagrid_ml_service` | `http://localhost:8000` | FastAPI FedAvg & Stockout Predictor |
| **MCP Tool Server** | `arogyagrid_mcp_server` | Stdio / JSON-RPC | Model Context Protocol Agent Tools |
| **PostgreSQL 16** | `arogyagrid_postgres` | `localhost:5432` | Relational Telemetry & State Store |

To stop all containers:
```bash
docker compose down
```

---

## 💻 Manual Local Development Setup

If you prefer to run each service individually on your local machine:

### Prerequisites
- **Node.js**: v18.0.0 or later
- **Python**: v3.10 or v3.11
- **Git**

---

### Step 1: Clone Repository
```bash
git clone https://github.com/Yasxh01/ArogyaGrid.git
cd ArogyaGrid
```

---

### Step 2: Start Python ML Microservice (Port 8000)
```powershell
cd ml_service
pip install -r requirements.txt
py -3.11 -m uvicorn app.main:app --port 8000 --reload
```
*API docs available at: `http://localhost:8000/docs`*

---

### Step 3: Start Node.js Backend Orchestrator (Port 5000)
```powershell
cd ../backend
npm install
npm start
```
*REST Gateway: `http://localhost:5000/api/v1`*  
*Health Check: `http://localhost:5000/api/v1/health`*

---

### Step 4: Start React Frontend Application (Port 3000)
```powershell
cd ../frontend
npm install
npm run dev
```
*Open your browser at: `http://localhost:3000`*

---

## 🔑 Default Test Accounts & 1-Click Presets

| Role | Name | Email | Password | Access Scope |
|---|---|---|---|---|
| **National Admin** | National AI Director | `admin@arogyagrid.gov.in` | `password123` | National Formulary, Custom Drug Provisioning, Federated AI |
| **District Officer** | Ranchi District Officer | `district.ranchi@arogyagrid.gov.in` | `password123` | Command Map, Stockout Triage Alerts, Transfer Approvals |
| **Medical Officer** | Dr. Priya Sharma | `doctor.ranchi@arogyagrid.gov.in` | `password123` | Sadar PHC Bed Admitting/Discharge, Medical Duty Roster |
| **PHC Staff** | Sadar PHC Staff | `phc.ranchi01@arogyagrid.gov.in` | `password123` | Daily Stock Dispense, Hindi Voice Intake, Offline Sync Queue |

*You can also click **✨ Create Account** on the login page to register custom doctors, officers, or staff across any district.*

---

## 🧪 Testing & Verification

### Run Backend Integration & Subsystem Tests
```powershell
cd backend
npm test
node src/test/e2e_full_check.js
```

### Run Python ML Unit Tests
```powershell
cd ml_service
py -3.11 test_ml.py
```

### Run Frontend Production Build Check
```powershell
cd frontend
npm run build
```

---

## 🔌 Model Context Protocol (MCP) Server

ArogyaGrid includes a standard Model Context Protocol server exposing typed health operations to LLM agents:

```powershell
cd mcp_server
npm install
node index.js
```

**Exposed MCP Tools**:
- `get_phc_inventory_status`: Fetch real-time tri-resource metrics for a PHC.
- `simulate_stockout_risk`: Predict Days-to-Stockout given consumption trends.
- `propose_resource_transfer`: Calculate optimal multi-criteria cross-district transfers.
- `trigger_federated_round`: Orchestrate privacy-preserving FedAvg across state nodes.

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
