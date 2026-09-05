# ArogyaGrid - Agent Guidelines & Repository Identity

## System Purpose
ArogyaGrid is an offline-capable, resilient, and federated AI-driven healthcare supply chain & resource platform for India\'s Primary Health Centre (PHC) network. It provides real-time tracking, predictive stockout early warnings, bed occupancy, medical staff attendance, cross-district rebalancing, and state-level federated machine learning.

## Core Architectural Invariants
1. **Transaction Idempotency**:
   - Every stock and resource intake transaction must contain a unique 	ransaction_uuid.
   - The backend enforces uniqueness in the database layer and in-memory caches. Duplicate UUIDs are acknowledged with HTTP 200 without double-counting.
2. **Tri-Resource Scope**:
   - Track **Medicines** (inventory count, expiry, daily consumption).
   - Track **Beds** (General, Oxygen, ICU, Pediatric availability and occupancy).
   - Track **Staff Attendance** (Doctors, Specialists, Nurses, Pharmacists on active duty).
3. **Federated AI Privacy**:
   - No raw patient health records or granular transaction logs are transmitted across states.
   - Nodes in Bihar, Jharkhand, Odisha compute local weight gradients; the central coordinator aggregates updates using FedAvg with Differential Privacy noise.
4. **Resilient Offline-First Sync**:
   - Mobile and web PWAs cache transactions in IndexedDB and replay to /api/v1/telemetry/intake upon network restoration.
5. **Role-Based Access Control (RBAC)**:
   - ADMIN: Full system administrative oversight, catalog creation, user provisioning.
   - DISTRICT_OFFICER: District monitoring, cross-district transfer approvals, alert resolutions.
   - PHC_STAFF: Assigned PHC stock updates, bed occupancy reports, duty check-ins.

## Directory Layout
- specs/: OpenAPI & AsyncAPI specification contracts.
- skills/: Reusable agent skills and SOPs.
- ackend/: Node.js & Express REST/WebSocket orchestrator.
- ml_service/: Python FastAPI predictive & federated learning microservice.
- mcp_server/: Model Context Protocol server exposing typed health ops tools.
- llms.txt: LLM-optimized architectural index.
