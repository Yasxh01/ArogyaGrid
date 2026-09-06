# ArogyaGrid — System Architecture & Technical Design Document (system_design.md)
**Document Version:** 1.0.0  
**Target Platform:** India's Primary Health Centre (PHC) & Community Health Centre (CHC) Network  
**Compliance Standards:** Digital Personal Data Protection (DPDP) Act 2023, Ayushman Bharat Digital Mission (ABDM) Guidelines  
**Architecture Paradigm:** Resilient Offline-First, Tri-Resource Telemetry, Federated AI & Model Context Protocol (MCP)

---

## 1. Executive Summary & Problem Statement

### 1.1 Context & Background
India's public rural healthcare grid operates across **150,000+ Primary Health Centres (PHCs)**, Community Health Centres (CHCs), and Sub-Centres serving over 900 million citizens. Frontline healthcare facilities face acute systemic challenges:
1. **Intermittent Grid Power & Connectivity Outages**: Severe network dropouts prevent real-time telemetry updates.
2. **Resource Stockouts & Supply Chain Latency**: Critical drug stockouts (e.g., Anti-Rabies Vaccine, ORS, Insulin) frequently occur while adjacent districts possess surplus inventory due to lack of cross-district visibility.
3. **Tri-Resource Asymmetry**: Healthcare delivery requires coordinated alignment of **medicines**, **bed capacity** (general, oxygen, ICU, pediatric), and **staff attendance** (doctors, specialists, nurses). Isolated tracking of just medicine inventory fails during clinical surges.
4. **Data Privacy & Interstate Boundaries (DPDP Act 2023)**: Centralizing granular citizen health records or raw transaction logs across state jurisdictions creates compliance risks and privacy vulnerabilities.

### 1.2 The ArogyaGrid Solution
ArogyaGrid is a production-grade, offline-capable, resilient, and federated healthcare supply chain and hospital resource orchestration platform designed specifically for India's healthcare infrastructure.

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                                 AROGYAGRID CORE                                  │
│                                                                                  │
│   [ Offline-First PWA ]       [ Tri-Resource Hub ]       [ Federated AI (DP) ]   │
│   IndexedDB + Local Queue     Meds + Beds + Staff        FedAvg + Laplace Noise  │
│                                                                                  │
│   [ Idempotent Ingestion ]    [ Inter-District Escrow ]  [ Agentic MCP Server ]  │
│   UUID-keyed Deduplication    Haversine Optimization     Typed Health Ops Tools  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

### 1.3 Core Architectural Invariants
The system enforces five mandatory non-negotiable architectural invariants:

1. **Transaction Idempotency**:
   - Every stock intake, dispense, bed allocation, or staff update contains a cryptographically unique `transaction_uuid`.
   - Repeated sync transmissions are acknowledged with HTTP 200 without double-counting inventory or transactions.
2. **Tri-Resource Scope**:
   - Tracks **Medicines & Vaccines** (quantity, daily burn rate, batch expiry).
   - Tracks **Dynamic Bed Matrix** (`GENERAL`, `OXYGEN`, `ICU`, `PEDIATRIC`).
   - Tracks **Staff Attendance Roster** (Doctors, Specialists, Nurses, Pharmacists on duty).
3. **Federated AI Privacy (DPDP Act 2023 Compliant)**:
   - Zero raw patient records or hospital logs are transmitted across state lines.
   - Node clusters in Bihar, Jharkhand, Odisha, West Bengal, and Assam compute local gradient updates; the central coordinator aggregates model weights via Federated Averaging (`FedAvg`) with Laplace Differential Privacy noise ($\epsilon = 1.0$).
4. **Resilient Offline-First Sync**:
   - Frontline touch kiosks operate fully offline during grid power cuts or internet outages.
   - PWA caches transactions in client-side IndexedDB and replays them via `/api/v1/telemetry/intake` upon network reconnection.
5. **Role-Based Access Control (RBAC)**:
   - Four discrete security roles: `ADMIN`, `DISTRICT_OFFICER`, `DOCTOR`, and `PHC_STAFF`.

---

## 2. High-Level System Architecture

ArogyaGrid follows a decoupled micro-service and orchestrator topology comprising five primary architectural tiers:
1. **Client Tier**: React 18 PWA with Vite, Tailwind CSS, Lucide icons, Leaflet GIS, and IndexedDB local store.
2. **API & Orchestration Tier**: Node.js Express REST Gateway & Socket.io Real-Time Event Hub.
3. **Machine Learning & Privacy Tier**: Python FastAPI microservice providing RandomForest stockout forecasting, cross-district rebalancing heuristics, and Federated Averaging (FedAvg).
4. **Agentic Tool Tier**: Model Context Protocol (MCP) JSON-RPC Stdio server exposing typed operations for AI agents.
5. **Persistence Tier**: Dual-layer store comprising PostgreSQL 16 relational database with an automatic zero-downtime In-Memory Datastore fallback.

### 2.1 System Topology Diagram

```mermaid
graph TB
    subgraph "Client Layer (Frontline & Command)"
        PWAKiosk["Touch Kiosk / Mobile PWA<br/>(PHC Staff & Doctors)"]
        BrowserAdmin["District / National Command Web<br/>(DHO & Admin)"]
        VoiceEngine["Web Speech API<br/>(Vernacular Hindi / English NLP)"]
        IndexedDBStore[("Client IndexedDB<br/>ArogyaGridOfflineDB")]
        
        PWAKiosk --> IndexedDBStore
        VoiceEngine --> PWAKiosk
    end

    subgraph "API & Orchestration Tier (Port 5000)"
        Gateway["Node.js Express API Gateway<br/>/api/v1"]
        AuthMiddleware["JWT & RBAC Middleware<br/>(Admin, DHO, Doctor, Staff)"]
        IdempotencyCtrl["Idempotency & Batch Engine<br/>/api/v1/telemetry/intake"]
        SocketServer["Socket.io WebSocket Hub<br/>(Real-Time Alerts & Events)"]
        AIService["AI Service<br/>(Gemini 1.5 Flash + Local NLP)"]

        Gateway --> AuthMiddleware
        Gateway --> IdempotencyCtrl
        Gateway --> SocketServer
        Gateway --> AIService
    end

    subgraph "Machine Learning Microservice (Port 8000)"
        FastAPIServer["Python FastAPI Engine<br/>/api/v1/predict & /federated"]
        Predictor["Stockout Predictor<br/>(RandomForest DTS & Risk)"]
        FederatedCoord["FedAvg Coordinator<br/>(Laplace Diff Privacy ε=1.0)"]
        RebalanceOptimizer["Cross-District Optimizer<br/>(Haversine + Surplus Heuristics)"]

        FastAPIServer --> Predictor
        FastAPIServer --> FederatedCoord
        FastAPIServer --> RebalanceOptimizer
    end

    subgraph "Agentic Layer (MCP Stdio / JSON-RPC)"
        MCPServer["ArogyaGrid MCP Server<br/>(Model Context Protocol)"]
        LLMAgents["LLM Autonomous Agents<br/>(Claude, Gemini, Custom Agents)"]

        LLMAgents <-->|JSON-RPC 2.0| MCPServer
        MCPServer <-->|Internal API Client| Gateway
    end

    subgraph "Persistence Tier (Port 5432)"
        PostgresDB[("PostgreSQL 16 Database<br/>(Relational State Store)")]
        MemoryStore[("Resilient Memory Store<br/>(Zero-Downtime Fallback)")]

        Gateway --> PostgresDB
        Gateway -.->|Auto Fallback| MemoryStore
    end

    %% Cross-tier connections
    PWAKiosk -->|HTTPS REST / WebSocket| Gateway
    IndexedDBStore -->|Batch Replay Sync| IdempotencyCtrl
    BrowserAdmin -->|HTTPS REST / WebSocket| Gateway
    Gateway <-->|HTTP REST Requests| FastAPIServer
    SocketServer -.->|Push Critical Stockout Alerts| BrowserAdmin
    SocketServer -.->|Push Transfer State Updates| PWAKiosk
```

---

## 3. Subsystem Deconstruction

### 3.1 Frontend Architecture (React 18 + Vite PWA)

The frontend is constructed using React 18, Tailwind CSS, Lucide React, and HTML5 Web APIs. It operates both as an administrative web console and as a ruggedized touch kiosk for rural health workers.

```mermaid
graph LR
    subgraph "Frontend Subsystem"
        Router["App Router & Scoped Views"]
        
        subgraph "Role Dashboards"
            V1["AdminDashboardView<br/>(Formulary & National AI)"]
            V2["DistrictOfficerDashboardView<br/>(GIS Map & Transfer Approvals)"]
            V3["DoctorDashboardView<br/>(Bed Matrix & Medical Roster)"]
            V4["PHCWorkerDashboardView<br/>(Touch Kiosk & Voice Intake)"]
        end

        subgraph "State & Telemetry Layer"
            AuthCtx["AuthContext (JWT + User Info)"]
            SocketCtx["SocketContext (Live Alert Channels)"]
            QueueEngine["offlineQueue.js (IndexedDB Engine)"]
            VoiceIntake["VoiceIntakeModal (Speech Recognition)"]
        end

        Router --> V1
        Router --> V2
        Router --> V3
        Router --> V4

        V4 --> VoiceIntake
        V4 --> QueueEngine
        V1 & V2 & V3 & V4 --> AuthCtx
        V1 & V2 & V3 & V4 --> SocketCtx
    end
```

#### Key Frontend Modules:
- **`offlineQueue.js`**: Interacts with IndexedDB database `ArogyaGridOfflineDB` under object store `pending_telemetry`. When an HTTP request fails or network status is offline (`navigator.onLine === false`), transactions are assigned a `transaction_uuid` and stored locally. A background sweep replays pending records once connectivity is re-established.
- **`VoiceIntakeModal.jsx`**: Uses the browser's `SpeechRecognition` API (supporting `hi-IN` and `en-IN`), captures raw speech, presents immediate transcript previews, and transmits audio text to the backend NLP engine for entity extraction.
- **`MapView.jsx`**: Renders district-level Leaflet GIS maps, color-coding PHCs into `HEALTHY` (emerald), `WARNING` (amber), and `CRITICAL` (rose) markers with real-time popup telemetry.
- **`BedMatrix.jsx`**: Clinical bed management module for admitting and discharging patients across `GENERAL`, `OXYGEN`, `ICU`, and `PEDIATRIC` categories.
- **`FederatedCenter.jsx` & `FederatedExplainerModal.jsx`**: Interactive visualization of state node weight distributions, loss curves, and differential privacy noise parameters.

---

### 3.2 Backend Orchestrator (Node.js & Express REST/WS)

The backend provides the API gateway, JWT authentication, RBAC enforcement, transactional deduplication, and WebSocket broadcast orchestration.

```mermaid
graph TD
    subgraph "Backend Tier Structure"
        Server["server.js (Express & Socket.io Server)"]

        subgraph "Middleware Layer"
            CORS["CORS & Body Parser"]
            AuthMid["authMiddleware.js (JWT Validation)"]
            RBACMid["roleCheck.js (Permission Enforcement)"]
        end

        subgraph "Controller Layer"
            AuthCtrl["authController.js"]
            StockCtrl["stockController.js"]
            BedCtrl["bedController.js"]
            StaffCtrl["staffController.js"]
            TelemetryCtrl["telemetryController.js"]
            TransferCtrl["transferController.js"]
            DistrictCtrl["districtController.js"]
            AICtrl["aiController.js"]
            MLCtrl["mlController.js"]
        end

        subgraph "Service Layer"
            StockSvc["stockService.js"]
            BedSvc["bedService.js"]
            StaffSvc["staffService.js"]
            TransferSvc["transferService.js"]
            AISvc["aiService.js"]
            MLSvc["mlService.js"]
            SocketSvc["socketService.js"]
        end

        subgraph "Data Storage Bridge"
            DBAdapter["config/db.js (Dual PostgreSQL / MemoryStore)"]
        end

        Server --> CORS --> AuthMid --> RBACMid
        RBACMid --> AuthCtrl & StockCtrl & BedCtrl & StaffCtrl & TelemetryCtrl & TransferCtrl & DistrictCtrl & AICtrl & MLCtrl
        StockCtrl --> StockSvc
        BedCtrl --> BedSvc
        StaffCtrl --> StaffSvc
        TelemetryCtrl --> StockSvc & BedSvc & StaffSvc
        TransferCtrl --> TransferSvc
        AICtrl --> AISvc
        MLCtrl --> MLSvc

        StockSvc --> DBAdapter & SocketSvc & MLSvc
        BedSvc --> DBAdapter & SocketSvc
        StaffSvc --> DBAdapter & SocketSvc
        TransferSvc --> DBAdapter & SocketSvc
    end
```

#### Idempotency Ingestion Algorithm:
When `/api/v1/telemetry/intake` receives a batch payload:
1. Validates array structure of payload items.
2. For each transaction, checks if `transaction_uuid` already exists in `stock_transactions`.
3. If found: marks receipt as `{ transaction_uuid, status: 'ALREADY_PROCESSED', duplicate: true }`.
4. If not found: updates current inventory, writes transaction audit record, dispatches `stock:updated` WebSocket event, triggers predictive stockout inference, and flags receipt as `{ transaction_uuid, status: 'SUCCESS', duplicate: false }`.
5. Returns HTTP 200 with batch receipts array, ensuring zero data loss and zero double-counting.

---

### 3.3 Machine Learning Microservice (Python FastAPI)

The ML service is a specialized microservice running on Python 3.11 with FastAPI, NumPy, and Scikit-Learn. It hosts three discrete computational engines:

```mermaid
graph TD
    subgraph "Python ML Engine (FastAPI)"
        AppMain["app/main.py"]

        subgraph "Predictive Stockout Engine"
            Predictor["predictor.py (StockoutPredictor)"]
            RFReg["RandomForestRegressor (n_estimators=30)<br/>Target: Days-to-Stockout (DTS)"]
            RFClf["RandomForestClassifier (n_estimators=30)<br/>Target: Risk Level (0:LOW, 1:MOD, 2:HIGH, 3:CRIT)"]
            Predictor --> RFReg
            Predictor --> RFClf
        end

        subgraph "Federated Learning Coordinator"
            FedCoord["federated.py (FederatedCoordinator)"]
            StateNodes["State Node Gradients<br/>[Bihar, Jharkhand, Odisha, West Bengal, Assam]"]
            NormClip["L2 Gradient Clipping (Norm <= 1.0)"]
            FedAvg["Federated Averaging (FedAvg)"]
            DiffPrivacy["Laplace DP Noise Perturbation<br/>b = 1.0 / ε (ε = 1.0)"]

            FedCoord --> StateNodes --> NormClip --> FedAvg --> DiffPrivacy
        end

        subgraph "Cross-District Supply Optimizer"
            Optimizer["optimizer.py (CrossDistrictOptimizer)"]
            HaversineCalc["Haversine Geodesic Distance Matrix"]
            SafetyInvariant["Donor Safety Reserve Invariant<br/>Surplus = Stock - (Daily_Consumption * 14)"]
            FeasibilityScorer["Multi-Criteria Feasibility Function<br/>Score = 0.6 * Dist_Score + 0.4 * Surplus_Score"]
            GreedyAlloc["Greedy Allocation Knapsack"]

            Optimizer --> HaversineCalc --> SafetyInvariant --> FeasibilityScorer --> GreedyAlloc
        end

        AppMain --> Predictor
        AppMain --> FedCoord
        AppMain --> Optimizer
    end
```

#### Mathematical Formulations:

##### 1. Predictive Days-to-Stockout (DTS):
$$\text{Effective Consumption} = \text{Daily Consumption} \times \text{Footfall Surge Factor} \times (1.0 + 0.3 \times \text{Weather Risk})$$
$$\text{DTS} = \frac{\text{Current Stock}}{\text{Effective Consumption}}$$
$$\text{Recommended Restock} = \max(0, (\text{Effective Daily Rate} \times 30) - \text{Current Stock})$$

##### 2. Differential Privacy Perturbation in FedAvg:
For global parameter vector $\mathbf{w}_t \in \mathbb{R}^d$ aggregated over $K$ participating state nodes:
$$\mathbf{w}_{t+1} = \frac{1}{K}\sum_{k=1}^K \text{clip}\left(\mathbf{w}_{t, k}, C\right) + \text{Laplace}\left(0, \frac{\Delta S}{\epsilon}\right)$$
Where $C = 1.0$ (clipping threshold), $\Delta S = \frac{C}{K}$ (sensitivity), and $\epsilon = 1.0$ (privacy budget).

##### 3. Cross-District Supply Feasibility:
$$\text{Haversine Distance: } d = 2 R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \phi}{2}\right) + \cos\phi_1\cos\phi_2\sin^2\left(\frac{\Delta \lambda}{2}\right)}\right)$$
$$\text{Distance Score} = \max\left(0.1, 1.0 - \frac{d}{R_{\max}}\right)$$
$$\text{Surplus Score} = \min\left(1.0, \frac{\text{Stock}_{\text{donor}} - 14 \times \text{Consumption}_{\text{donor}}}{\text{Stock}_{\text{requested}}}\right)$$
$$\text{Feasibility Score} = 0.6 \cdot \text{Distance Score} + 0.4 \cdot \text{Surplus Score}$$

---

### 3.4 Model Context Protocol (MCP) Server

The MCP Server implements the JSON-RPC 2.0 Stdio specification, allowing LLM autonomous agents (Claude, Gemini, Open-Source models) to inspect live state and trigger health interventions programmatically.

```mermaid
graph LR
    subgraph "MCP Agentic Interface"
        Agent["External LLM Agent"]
        MCPProcess["mcp_server/index.js (Stdio JSON-RPC)"]
        
        subgraph "Exposed Typed Tools"
            T1["get_phc_inventory_status<br/>Input: phc_id"]
            T2["simulate_stockout_risk<br/>Input: phc_id, medicine_id, surge"]
            T3["propose_resource_transfer<br/>Input: target_phc_id, medicine_id, needed_qty"]
            T4["trigger_federated_round<br/>Input: participating_nodes[]"]
        end

        Agent <-->|JSON-RPC 2.0 (stdio)| MCPProcess
        MCPProcess --> T1 & T2 & T3 & T4
        T1 & T2 & T3 & T4 -->|HTTP REST Client| Backend["Backend API Gateway (:5000)"]
    end
```

---

### 3.5 Vernacular Hindi / English Natural Language Parser

Rural frontline workers speak naturally into kiosks. ArogyaGrid provides a hybrid dual-engine parser:
1. **Primary Cloud Engine**: Gemini 1.5 Flash via REST API converting freeform Hindi speech to structured JSON payloads.
2. **Local Zero-Dependency Heuristic Engine**: Embedded regex, phonetic keyword tokenizer, and fuzzy matcher that functions without internet connectivity.

```mermaid
flowchart TD
    VoiceInput["Worker Speech Input<br/>'आज 50 पैरासिटामोल और 20 ओआरएस दिए'"]
    SpeechToText["Browser Web Speech API<br/>Transcribes to text string"]
    CheckAPIKey{"GEMINI_API_KEY Configured<br/>& Network Online?"}
    
    GeminiCall["Gemini 1.5 Flash Parser<br/>Prompt + Schema Constraints"]
    LocalNLP["Local Heuristic Vernacular NLP<br/>- Regex Intent Detection (दिए, intake, consume)<br/>- Hindi/English Medicine Lexicon Matcher<br/>- Numeric Tokenizer"]
    
    StructuredJSON["Standard Telemetry Transaction<br/>{ type: 'DISPENSE', medicine_id: 'MED-001', quantity: 50 }"]
    IDBEnqueue["Store in IndexedDB Queue with UUID"]

    VoiceInput --> SpeechToText --> CheckAPIKey
    CheckAPIKey -->|Yes| GeminiCall
    CheckAPIKey -->|No / Network Fallback| LocalNLP
    GeminiCall -->|Output Validated| StructuredJSON
    GeminiCall -.->|API Error / Timeout| LocalNLP
    LocalNLP --> StructuredJSON
    StructuredJSON --> IDBEnqueue
```

---

## 4. Database Architecture & Data Models

ArogyaGrid uses PostgreSQL 16 as its primary relational engine, supplemented with an in-memory replica store for fault tolerance.

### 4.1 Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    DISTRICTS ||--o{ PHCS : "contains"
    DISTRICTS ||--o{ USERS : "supervises"
    PHCS ||--o{ USERS : "employs"
    PHCS ||--o{ STOCK : "holds"
    PHCS ||--o{ STOCK_TRANSACTIONS : "logs"
    PHCS ||--o{ BEDS : "manages"
    PHCS ||--o{ STAFF_ATTENDANCE : "records"
    PHCS ||--o{ PREDICTIONS : "evaluates"
    PHCS ||--o{ TRANSFERS : "source_facility"
    PHCS ||--o{ TRANSFERS : "destination_facility"
    
    MEDICINES ||--o{ STOCK : "inventory_catalog"
    MEDICINES ||--o{ STOCK_TRANSACTIONS : "transacted_item"
    MEDICINES ||--o{ PREDICTIONS : "predicted_item"
    MEDICINES ||--o{ TRANSFERS : "transferred_item"

    DISTRICTS {
        varchar(64) id PK
        varchar(128) name
        varchar(64) state
        float latitude
        float longitude
        timestamp created_at
    }

    PHCS {
        varchar(64) id PK
        varchar(128) name
        varchar(64) district_id FK
        float latitude
        float longitude
        int capacity
        varchar(32) status
        int population_served
        timestamp created_at
    }

    USERS {
        varchar(64) id PK
        varchar(128) name
        varchar(128) email UK
        varchar(256) password_hash
        varchar(32) role
        varchar(64) district_id FK
        varchar(64) phc_id FK
        timestamp created_at
    }

    MEDICINES {
        varchar(64) id PK
        varchar(128) name
        varchar(64) category
        varchar(32) unit
        int minimum_stock
        float daily_base_consumption
        timestamp created_at
    }

    STOCK {
        varchar(64) id PK
        varchar(64) phc_id FK
        varchar(64) medicine_id FK
        int quantity
        float daily_consumption
        timestamp updated_at
    }

    STOCK_TRANSACTIONS {
        varchar(64) id PK
        varchar(64) transaction_uuid UK
        varchar(64) phc_id FK
        varchar(64) medicine_id FK
        int quantity
        varchar(32) transaction_type
        varchar(64) created_by
        timestamp created_at
    }

    BEDS {
        varchar(64) id PK
        varchar(64) phc_id FK
        varchar(32) bed_type
        int total_beds
        int occupied_beds
        timestamp updated_at
    }

    STAFF_ATTENDANCE {
        varchar(64) id PK
        varchar(64) phc_id FK
        varchar(128) staff_name
        varchar(64) role
        varchar(32) shift
        varchar(32) status
        timestamp check_in_time
        timestamp check_out_time
    }

    PREDICTIONS {
        varchar(64) id PK
        varchar(64) phc_id FK
        varchar(64) medicine_id FK
        float days_to_stockout
        varchar(32) risk_level
        float confidence
        int recommended_restock_qty
        timestamp created_at
    }

    TRANSFERS {
        varchar(64) id PK
        varchar(64) source_phc_id FK
        varchar(64) destination_phc_id FK
        varchar(64) medicine_id FK
        int quantity
        varchar(32) status
        float route_distance_km
        varchar(64) requested_by
        varchar(64) approved_by
        timestamp created_at
        timestamp updated_at
    }
```

### 4.2 Database Constraints & Integrity Guarantees
- `stock_transactions.transaction_uuid`: Globally unique constraint preventing duplicate transaction logging.
- `stock.check_positive_stock`: Enforces invariant `quantity >= 0` at SQL layer.
- `stock.unique_phc_medicine`: Composite unique constraint preventing duplicate stock tracking rows for the same medicine in a PHC.
- `users.email`: Unique constraint across all administrative and field accounts.

---

## 5. Architectural Flow & Sequence Diagrams

### 5.1 Offline-to-Online Batch Intake & Idempotency Flow

```mermaid
sequenceDiagram
    autonumber
    actor Worker as PHC Field Worker
    participant PWA as Frontline PWA (React)
    participant IDB as Client IndexedDB
    participant API as Express Gateway
    participant StockSvc as StockService
    participant DB as Postgres / MemoryStore
    participant ML as ML Service (:8000)
    participant WS as Socket.io Hub

    Note over Worker, IDB: Network Disconnected (Offline Grid Outage)
    Worker->>PWA: Record medicine consumption (50 units)
    PWA->>PWA: Generate UUID v4 (tx_uuid_101)
    PWA->>IDB: queueOfflineTransaction(tx_uuid_101, phc_id, 'DISPENSE', 50)
    PWA-->>Worker: Display "Queued Locally (Offline Ready)"

    Note over Worker, API: Connectivity Restored (Online Event Detected)
    PWA->>IDB: getPendingTransactions()
    IDB-->>PWA: Return [tx_uuid_101]
    PWA->>API: POST /api/v1/telemetry/intake { transactions: [tx_uuid_101] }
    
    API->>StockSvc: processTransaction(tx_uuid_101)
    StockSvc->>DB: Check if tx_uuid_101 exists in stock_transactions
    alt First Time Ingestion
        DB-->>StockSvc: Not Found
        StockSvc->>DB: Deduct 50 units from stock (quantity >= 0 check)
        StockSvc->>DB: INSERT INTO stock_transactions (tx_uuid_101, ...)
        StockSvc->>WS: broadcastEvent('stock:updated', { phc_id, new_quantity })
        StockSvc->>ML: POST /api/v1/predict/stockout (Evaluate new DTS)
        ML-->>StockSvc: { days_to_stockout: 2.1, risk_level: 'HIGH' }
        StockSvc-->>API: { status: 'SUCCESS', duplicate: false }
    else Already Processed (Replay Attack / Duplicate Sync)
        DB-->>StockSvc: Record Found
        StockSvc-->>API: { status: 'ALREADY_PROCESSED', duplicate: true }
    end

    API-->>PWA: HTTP 200 OK { receipts: [{ transaction_uuid, status }] }
    PWA->>IDB: clearPendingTransactions([tx_uuid_101])
    PWA-->>Worker: UI shows "All Transactions Synchronized"
```

---

### 5.2 Real-Time Predictive Stockout & Alert Escalation Flow

```mermaid
sequenceDiagram
    autonumber
    participant Worker as PHC Worker
    participant API as Express Gateway (:5000)
    participant StockSvc as StockService
    participant ML as ML Service (:8000)
    participant WS as Socket.io Event Hub
    participant DHO as District Health Officer (Dashboard)

    Worker->>API: POST /api/v1/stock/transaction (Dispense 200 vials of Anti-Rabies)
    API->>StockSvc: processTransaction()
    StockSvc->>ML: POST /api/v1/predict/stockout { stock: 15, consumption: 25 }
    
    Note over ML: RandomForest Regressor & Classifier Inference
    ML-->>StockSvc: { days_to_stockout: 0.6, risk_level: 'CRITICAL', confidence: 0.94 }
    
    alt Risk Level in ['CRITICAL', 'HIGH']
        StockSvc->>WS: broadcastEvent('alert:critical', { phc_id, medicine_id, risk_level, DTS: 0.6 })
        WS-->>DHO: Push WebSocket 'alert:critical'
        Note over DHO: Dashboard UI triggers audio alert & red pulsating map marker
        DHO->>API: GET /api/v1/transfers/recommendations?phc_id=PHC-01
        API->>ML: POST /api/v1/optimize/redistribute (Search candidate donors)
        ML-->>API: Propose donor PHC-03 (Surplus: 120, Dist: 18.4km)
        API-->>DHO: Return Transfer Recommendation
    end
```

---

### 5.3 Cross-District Resource Rebalancing & Transfer Escrow Flow

```mermaid
sequenceDiagram
    autonumber
    actor DHO as District Health Officer
    participant API as Backend REST Gateway
    participant TransferSvc as TransferService
    participant ML as ML Service (Optimizer)
    participant DB as Postgres Datastore
    participant WS as Socket.io Gateway
    actor DonorDoctor as Donor PHC Medical Officer
    actor RecipientStaff as Recipient PHC Staff

    DHO->>API: POST /api/v1/transfers/propose { target_phc: 'PHC-01', needed: 80 }
    API->>ML: POST /api/v1/optimize/redistribute
    Note over ML: Filters candidates by 14-day safety reserve & Haversine distance
    ML-->>API: Return Ranked Donors (Donor: 'PHC-02', Feasibility: 0.88)
    
    DHO->>API: POST /api/v1/transfers (Initiate Transfer Request)
    API->>TransferSvc: createTransfer(status: 'PENDING')
    TransferSvc->>DB: INSERT INTO transfers
    TransferSvc->>WS: broadcastEvent('transfer:requested', transfer_id)
    
    DHO->>API: PATCH /api/v1/transfers/:id/status { status: 'APPROVED' }
    API->>TransferSvc: updateStatus('APPROVED', approved_by: DHO.id)
    TransferSvc->>DB: UPDATE transfers SET status = 'APPROVED'
    TransferSvc->>WS: broadcastEvent('transfer:approved')
    WS-->>DonorDoctor: Alert: Dispatch Authorized
    
    DonorDoctor->>API: PATCH /api/v1/transfers/:id/status { status: 'DISPATCHED' }
    TransferSvc->>DB: Deduct inventory from Donor PHC
    TransferSvc->>WS: broadcastEvent('transfer:dispatched')
    
    RecipientStaff->>API: PATCH /api/v1/transfers/:id/status { status: 'DELIVERED' }
    TransferSvc->>DB: Credit inventory to Recipient PHC
    TransferSvc->>WS: broadcastEvent('transfer:delivered')
```

---

### 5.4 State-Level Privacy-Preserving Federated Learning Flow

```mermaid
sequenceDiagram
    autonumber
    actor Admin as National Health AI Director
    participant API as Backend Gateway
    participant Coord as ML FederatedCoordinator
    participant NodeBR as Bihar State Node
    participant NodeJH as Jharkhand State Node
    participant NodeOD as Odisha State Node
    participant NodeWB as West Bengal State Node
    participant NodeAS as Assam State Node

    Admin->>API: POST /api/v1/ml/federated/trigger
    API->>Coord: trigger_round(participating_nodes)
    
    Note over Coord, NodeAS: Zero raw patient/intake data leaves state boundaries
    par Local Model Training in Sovereign Nodes
        Coord->>NodeBR: Request Gradient Weights Update
        NodeBR-->>Coord: Return Δw_BR
        Coord->>NodeJH: Request Gradient Weights Update
        NodeJH-->>Coord: Return Δw_JH
        Coord->>NodeOD: Request Gradient Weights Update
        NodeOD-->>Coord: Return Δw_OD
        Coord->>NodeWB: Request Gradient Weights Update
        NodeWB-->>Coord: Return Δw_WB
        Coord->>NodeAS: Request Gradient Weights Update
        NodeAS-->>Coord: Return Δw_AS
    end

    Note over Coord: Step 1: L2 Norm Clipping (||Δw|| <= 1.0)
    Note over Coord: Step 2: FedAvg Weighted Model Aggregation
    Note over Coord: Step 3: Laplace Differential Privacy Noise Injection (ε = 1.0)
    
    Coord->>Coord: w_global = FedAvg(Δw) + Laplace(0, 1.0/ε) * 0.01
    Coord->>Coord: Generate Global Model Release (e.g. 'v2.5.0')
    Coord-->>API: { round_id: 5, status: 'COMPLETED', version: 'v2.5.0', mean_loss: 0.114, dp_applied: true }
    API-->>Admin: Display Global Convergence & Privacy Audit
```

---

### 5.5 Bed Occupancy & Clinical Admitting State Diagram

```mermaid
stateDiagram-v2
    [*] --> BedAvailable : PHC Provisioning

    state BedAvailable {
        [*] --> Unoccupied
        Unoccupied --> Sanitized
    }

    BedAvailable --> BedOccupied : Patient Admitted (GENERAL / OXYGEN / ICU / PEDIATRIC)
    
    state BedOccupied {
        [*] --> UnderObservation
        UnderObservation --> OxygenTherapy
        OxygenTherapy --> CriticalCareICU
        CriticalCareICU --> StepDownWard
    }

    BedOccupied --> BedMaintenance : Patient Discharged / Transferred
    
    state BedMaintenance {
        [*] --> TerminalDisinfection
        TerminalDisinfection --> ColdChainO2Check
    }

    BedMaintenance --> BedAvailable : Ready for Admission
    BedOccupied --> CriticalSurgeLockout : PHC Bed Capacity Reached (Occupancy = 100%)
    CriticalSurgeLockout --> BedOccupied : Emergency Divert / Discharge
```

---

## 6. Security, Privacy & DPDP Act 2023 Compliance

### 6.1 Regulatory Guarantees & Privacy Matrix

| Regulatory Requirement | ArogyaGrid Technical Implementation | Architectural Guarantee |
|---|---|---|
| **Data Principal Consent & Anonymity** | No raw patient identifers (Aadhaar, ABHA card ID, phone numbers) are required for inventory and capacity operations. | **Zero PII Leakage**: The database only tracks aggregated numbers and inventory units. |
| **Cross-Border / Cross-State Restrictions** | Federated Averaging (`FedAvg`) executes in memory. State nodes retain their proprietary transaction telemetry. | **Sovereign Node Isolation**: Only weight gradients are shared across state nodes. |
| **Differential Privacy ($\epsilon$-DP)** | Laplace noise mechanism is applied to averaged model parameters before global broadcast. | **Mathematical Privacy Bound**: $P(\mathcal{M}(D) \in S) \le e^\epsilon \cdot P(\mathcal{M}(D') \in S)$ with $\epsilon = 1.0$. |
| **Integrity & Non-Repudiation** | UUID v4 idempotency tokens and signed JWT tokens with immutable timestamps. | **Replay Protection**: Transactions cannot be re-applied or manipulated. |

---

### 6.2 Role-Based Access Control (RBAC) Matrix

```mermaid
graph TD
    subgraph "RBAC Hierarchy"
        Admin["NATIONAL_ADMIN"]
        DHO["DISTRICT_OFFICER"]
        Doctor["DOCTOR / MEDICAL_OFFICER"]
        Staff["PHC_STAFF / FIELD_WORKER"]

        Admin -->|Supervises| DHO
        DHO -->|Coordinates Logistics| Doctor
        Doctor -->|Directs Clinical Duty| Staff
    end
```

| Operational Capability | National Admin | District Officer | Medical Officer | PHC Staff |
|---|:---:|:---:|:---:|:---:|
| **Manage Formulary & Catalog** | ✅ | ❌ | ❌ | ❌ |
| **Trigger Federated AI Rounds** | ✅ | ❌ | ❌ | ❌ |
| **District GIS Command Console** | ✅ | ✅ | ❌ | ❌ |
| **Approve Cross-District Transfers** | ❌ | ✅ | ❌ | ❌ |
| **Bed Admitting & Discharge** | ❌ | ❌ | ✅ | ❌ |
| **Staff Shift Roster Management** | ❌ | ❌ | ✅ | ❌ |
| **Medicine Dispense & Intake** | ❌ | ❌ | ❌ | ✅ |
| **Vernacular Hindi Voice Kiosk** | ❌ | ❌ | ❌ | ✅ |
| **Offline Queue Batch Sync** | ❌ | ❌ | ✅ | ✅ |

---

## 7. Deployment Architecture & Infrastructure Topology

### 7.1 Containerized Docker Deployment

A single command (`docker compose up --build -d`) orchestrates the complete production-grade multi-container topology:

```mermaid
graph TB
    subgraph "Host Machine / Cloud VM"
        subgraph "Docker Compose Network (arogyagrid-net)"
            FrontendContainer["Container: arogyagrid_frontend<br/>React 18 + Vite PWA<br/>Internal Port: 80 / Host: 3000"]
            BackendContainer["Container: arogyagrid_backend<br/>Node.js Express + Socket.io<br/>Port: 5000"]
            MLContainer["Container: arogyagrid_ml_service<br/>Python FastAPI Engine<br/>Port: 8000"]
            MCPContainer["Container: arogyagrid_mcp_server<br/>Model Context Protocol Tools<br/>Stdio / JSON-RPC"]
            PostgresContainer["Container: arogyagrid_postgres<br/>PostgreSQL 16 Engine<br/>Port: 5432"]

            FrontendContainer -->|API Requests| BackendContainer
            BackendContainer -->|Prediction & FedAvg| MLContainer
            BackendContainer -->|SQL Queries| PostgresContainer
            MCPContainer -->|Health Tool Queries| BackendContainer
        end

        VolumeStorage[("Docker Volume<br/>pgdata_arogya")]
        PostgresContainer --> VolumeStorage
    end

    ExternalClient["External Browser / Field Tablet"] -->|HTTP :3000| FrontendContainer
    ExternalClient -->|REST & WS :5000| BackendContainer
    ExternalLLM["Autonomous LLM Agent"] -->|JSON-RPC| MCPContainer
```

### 7.2 Port and Configuration Mapping

| Service Name | Container Name | Internal Port | Host Port | Environment Dependencies |
|---|---|---|---|---|
| **Frontend PWA** | `arogyagrid_frontend` | 80 / 3000 | `3000` | `VITE_API_BASE_URL=http://localhost:5000/api/v1` |
| **Backend REST & WS** | `arogyagrid_backend` | 5000 | `5000` | `PORT=5000`, `DATABASE_URL`, `JWT_SECRET`, `ML_SERVICE_URL=http://ml_service:8000` |
| **Python ML Engine** | `arogyagrid_ml_service` | 8000 | `8000` | `PORT=8000`, `DP_EPSILON=1.0`, `DP_CLIP_NORM=1.0` |
| **MCP Server** | `arogyagrid_mcp_server` | Stdio | Stdio | `BACKEND_URL=http://localhost:5000/api/v1` |
| **PostgreSQL DB** | `arogyagrid_postgres` | 5432 | `5432` | `POSTGRES_DB=arogyagrid`, `POSTGRES_USER`, `POSTGRES_PASSWORD` |

---

## 8. Reliability, Resilience & Disaster Recovery Strategies

```mermaid
flowchart TD
    Request["Incoming Ingestion Request"]
    CheckDB{"PostgreSQL Active & Healthy?"}
    WritePG["Persist to PostgreSQL 16"]
    WriteMem["Persist to In-Memory Resilient Store"]
    CheckML{"ML Service Online?"}
    ComputeRF["Compute RandomForest Regressor Inference"]
    FallbackHeuristic["Compute Deterministic DTS: Stock / DailyConsumption"]
    BroadcastAlert["Broadcast Real-Time WebSocket Alerts"]

    Request --> CheckDB
    CheckDB -->|Yes| WritePG
    CheckDB -->|No: DB Timeout / Crash| WriteMem
    WritePG --> CheckML
    WriteMem --> CheckML
    CheckML -->|Yes| ComputeRF
    CheckML -->|No: Network Partition| FallbackHeuristic
    ComputeRF --> BroadcastAlert
    FallbackHeuristic --> BroadcastAlert
```

### 8.1 Network Partition Tolerance & CAP Theorem Trade-Offs
- ArogyaGrid opts for **AP (Availability and Partition Tolerance)** at the rural edge:
  - When disconnected from the internet, rural kiosks operate unimpeded.
  - Transactions are accepted and validated locally in client-side IndexedDB.
- When connected to the regional server, it switches to **CP (Consistency and Partition Tolerance)**:
  - Enforces atomic deduplication using UUID tokens and atomic SQL transactions.

### 8.2 Zero-Downtime Dual-Store Fallback
- `config/db.js` implements a transparent database proxy.
- If PostgreSQL fails to initialize or encounters a connection drop, queries automatically fall back to `memoryStore` without throwing 500 fatal errors.
- Telemetry logging and inventory tracking continue uninterrupted.

### 8.3 ML Microservice Degradation Strategy
- If the Python microservice is temporarily unavailable:
  - The Node.js backend calculates deterministic stockout metrics using classical burn-rate equations: $DTS = \frac{\text{Current Stock}}{\text{Daily Consumption}}$.
  - Critical alerts are still generated if $DTS < 3.0$ days.

---

## 9. Future Roadmap & Strategic Integrations

1. **National ABDM (Ayushman Bharat Digital Mission) Gateway**: Direct integration with the national Health Facility Registry (HFR) and Unified Health Interface (UHI).
2. **Cold-Chain IoT Sensor Ingestion**: Real-time MQTT telemetry streaming from vaccine storage refrigerators, automatically downgrading vaccine efficacy upon thermal excursion.
3. **Autonomous Medical Drone Logistics**: Automated triggering of medical delivery drones between CHCs and isolated rural PHCs for antivenom and emergency blood units.
4. **On-Device Edge ML via WebAssembly**: Compiling the stockout prediction model to ONNX Runtime Web for local zero-latency offline inference directly within the browser.

---

*Document maintained by the ArogyaGrid Core Architecture Team. Built for resilience across India's public healthcare grid.*
