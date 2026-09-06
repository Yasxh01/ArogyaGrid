# 🧪 ArogyaGrid — Comprehensive Unit Test Suite Documentation

This document provides a detailed breakdown of the automated **Unit Test Suite** implemented for **ArogyaGrid**, covering all core backend services, machine learning models, vernacular voice intelligence, transaction idempotency, and Model Context Protocol (MCP) tooling.

---

## 📊 Summary Test Execution Report

```
================================================================
            AROGYAGRID COMPREHENSIVE UNIT TEST SUITE            
================================================================
[DB] Operating in embedded resilient database mode.
[Seed] Seeding realistic public healthcare baseline data for India...
[Seed] Database seeded with Admin, District Officer, Doctor, and PHC Staff users.

📦 [SUITE 1] Stock Service & Idempotency Logic:
  ✔ [PASS] Should process new INTAKE transaction and increment stock
  ✔ [PASS] Should prevent double counting for identical transaction_uuid (Idempotency)
  ✔ [PASS] Should throw error on DISPENSE when requested quantity exceeds available stock
  ✔ [PASS] Should retrieve stock by PHC ID with correct metadata

🛏️ [SUITE 2] Bed Service & Capacity Alerts:
  ✔ [PASS] Should calculate bed occupancy percentage accurately
  ✔ [PASS] Should correctly identify CRITICAL risk threshold at >= 95% occupancy

🚚 [SUITE 3] Cross-District Rebalancing & Logistics:
  ✔ [PASS] Should calculate geodesic distance between two PHCs correctly
  ✔ [PASS] Should transition transfer status from PENDING to APPROVED

👨‍⚕️ [SUITE 4] Staff Roster & Attendance Verification:
  ✔ [PASS] Should log staff attendance with timestamp and status

🎙️ [SUITE 5] Vernacular Voice NLP & Phonetic Parsing:
  ✔ [PASS] Should parse Hindi phonetic Amoxicillin: "इमोक्सी सिलिन 30 पैकेट प्राप्त हुए"
  ✔ [PASS] Should parse Devanagari numerals: "५० ओआरएस बांटी गई"
  ✔ [PASS] Should parse Hindi word numbers: "बीस इंसुलिन जमा किए"
  ✔ [PASS] Should parse Dolo / Paracetamol fever alias: "100 dolo tablet received"
  ✔ [PASS] Should parse Bed occupancy voice notes: "5 oxygen bed occupied"

🔐 [SUITE 6] Authentication, Bcrypt Hashing & JWT RBAC:
  ✔ [PASS] Should securely hash password using bcrypt
  ✔ [PASS] Should generate and sign valid JWT with user role claims

🤖 [SUITE 7] Model Context Protocol (MCP) Agent Tools:
  ✔ [PASS] Should expose 4 typed tools with valid JSON schemas
  ✔ [PASS] MCP Tool propose_resource_transfer should return optimal donor

🌲 [SUITE 8] Machine Learning & Federated Learning:
  ✔ [PASS] Should forecast Days to Stockout (DTS) and classify risk tier
  ✔ [PASS] Should trigger Federated Learning FedAvg round across 3 state nodes

================================================================
 UNIT TEST RESULTS: 20 / 20 PASSED (100% SUCCESS) 
================================================================
```

---

## 🔍 Detailed Test Suites Breakdown

### Suite 1: Stock Service & Idempotency Logic
* **File**: `backend/src/services/stockService.js`
* **Test Cases**:
  1. **Stock Intake Increment**: Verifies that logging an `INTAKE` transaction increases available medicine count correctly.
  2. **Transaction Idempotency**: Submits identical `transaction_uuid` twice and ensures the backend returns `ALREADY_PROCESSED` without double-counting (protecting rural offline sync).
  3. **Over-Dispense Prevention**: Validates that dispensing more units than in stock triggers an `Insufficient stock` error, preventing negative inventory.
  4. **PHC Metadata Enrichment**: Confirms stock lookups join medicine category, units, and baseline burn rates.

### Suite 2: Bed Capacity & Threshold Alerts
* **File**: `backend/src/services/bedService.js`
* **Test Cases**:
  1. **Occupancy Percentage**: Calculates $(Occupied / Total) \times 100$ across General, Oxygen, ICU, and Pediatric wards.
  2. **Critical Saturation Alert**: Verifies that occupancy rates $\ge 95\%$ automatically trigger `alert:critical` WebSocket broadcasts.

### Suite 3: Cross-District Rebalancing & Logistics
* **File**: `backend/src/services/transferService.js`
* **Test Cases**:
  1. **Geodesic Haversine Distance**: Calculates road transit distances between donor and recipient PHCs (e.g. Ranchi Sadar to Kanke Rural = 9.8 km).
  2. **Status Lifecycle**: Tests the complete state machine: `PENDING` $\to$ `APPROVED` $\to$ `DISPATCHED`.

### Suite 4: Medical Staff Duty & Roster
* **File**: `backend/src/services/staffService.js`
* **Test Cases**:
  1. **Attendance Logging**: Confirms shift logs record staff designation, shift (Morning/Evening/Night), and active timestamps.

### Suite 5: Vernacular Voice NLP & Phonetics
* **File**: `backend/src/services/aiService.js`
* **Test Cases**:
  1. **Phonetic Drug Mapping**: Tests Hindi phonetic variations (*"इमोक्सी सिलिन"* $\to$ `MED-002` Amoxicillin).
  2. **Devanagari Numerals**: Converts numerals (*"५० ओआरएस"* $\to$ 50 ORS `STOCK_OUT`).
  3. **Hindi Number Words**: Maps words (*"बीस इंसुलिन"* $\to$ 20 Insulin).
  4. **Drug Brand Aliases**: Resolves colloquial names (*"100 dolo"* $\to$ `MED-001` Paracetamol).
  5. **Bed Voice Notes**: Parses spoken ward capacity updates (*"5 oxygen bed occupied"*).

### Suite 6: Security, Passwords & RBAC
* **File**: `backend/src/middleware/auth.js`
* **Test Cases**:
  1. **Bcrypt Password Security**: Verifies cryptographic hashing and resistance to plaintext comparisons.
  2. **JWT Role Claims**: Ensures signed tokens carry authenticated role privileges (`ADMIN`, `DISTRICT_OFFICER`, `DOCTOR`, `PHC_STAFF`).

### Suite 7: Model Context Protocol (MCP) Tools
* **File**: `mcp_server/tools/arogyaTools.js`
* **Test Cases**:
  1. **Schema Validation**: Ensures all 4 tools (`get_phc_inventory_status`, `simulate_stockout_risk`, `propose_resource_transfer`, `trigger_federated_round`) export valid JSON schemas.
  2. **Donor Protection Rule**: Verifies transfer suggestions preserve a minimum 14-day supply at donor clinics within 45 km.

### Suite 8: Machine Learning & Federated Learning
* **File**: `backend/src/services/mlService.js`
* **Test Cases**:
  1. **Days to Stockout (DTS)**: Verifies Random Forest regression forecasting stockout horizon under outbreak surges.
  2. **Federated FedAvg Aggregation**: Executes a multi-state gradient aggregation round with Differential Privacy noise.

---

## 💻 How to Run the Tests

### 1. Run Unit Tests Only:
```bash
npm --prefix backend test
```

### 2. Run All Test Suites (Unit + Integration + AI + E2E):
```bash
npm --prefix backend run test:all
```

### 3. Run Python ML Service Tests:
```bash
py -3.11 ml_service/test_ml.py
```
