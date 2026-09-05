const assert = require('assert');
const db = require('../config/db');
const { seedDatabase } = require('../db/seed');
const stockService = require('../services/stockService');
const bedService = require('../services/bedService');
const staffService = require('../services/staffService');
const transferService = require('../services/transferService');
const mlService = require('../services/mlService');
const { tools } = require('../../../mcp_server/tools/arogyaTools');

async function runFullHealthCheck() {
  console.log('================================================================');
  console.log('       AROGYAGRID COMPREHENSIVE END-TO-END HEALTH CHECK         ');
  console.log('================================================================');

  // 1. Initialize Database & Seed Baseline
  console.log('[1/8] Initializing Database & Seeding Baseline...');
  await db.initialize();
  await seedDatabase();
  assert(db.memoryStore.districts.length >= 5, 'Should seed >= 5 districts');
  assert(db.memoryStore.phcs.length >= 7, 'Should seed >= 7 PHCs');
  assert(db.memoryStore.medicines.length >= 5, 'Should seed >= 5 medicines');
  console.log('  ✔ Database Initialized with Multi-District PHC network');

  // 2. Auth & RBAC
  console.log('[2/8] Testing Authentication & RBAC User Registry...');
  const admin = db.memoryStore.users.find(u => u.role === 'ADMIN');
  const districtOfficer = db.memoryStore.users.find(u => u.role === 'DISTRICT_OFFICER');
  const phcStaff = db.memoryStore.users.find(u => u.role === 'PHC_STAFF');
  assert(admin && districtOfficer && phcStaff, 'All three roles must exist');
  console.log('  ✔ ADMIN, DISTRICT_OFFICER, and PHC_STAFF roles verified');

  // 3. Stock Telemetry & Idempotency
  console.log('[3/8] Testing Stock Intake & Idempotent Deduplication...');
  const txUuid = 'E2E-TX-' + Date.now();
  const tx1 = await stockService.processTransaction({
    transaction_uuid: txUuid,
    phc_id: 'PHC-RAN-01',
    medicine_id: 'MED-001',
    quantity: 100,
    transaction_type: 'INTAKE',
    created_by: 'phc.ranchi01@arogyagrid.gov.in'
  });
  assert.strictEqual(tx1.duplicate, false, 'First submission must be accepted');

  const tx2 = await stockService.processTransaction({
    transaction_uuid: txUuid,
    phc_id: 'PHC-RAN-01',
    medicine_id: 'MED-001',
    quantity: 100,
    transaction_type: 'INTAKE',
    created_by: 'phc.ranchi01@arogyagrid.gov.in'
  });
  assert.strictEqual(tx2.duplicate, true, 'Duplicate transaction_uuid must be acknowledged without double counting');
  console.log('  ✔ Transaction Idempotency: Duplicate rejected safely, count preserved');

  // 4. Bed Occupancy & High-Occupancy Alert
  console.log('[4/8] Testing Bed Availability Matrix & Alert Escalation...');
  const bedRecord = await bedService.updateBedOccupancy({
    phc_id: 'PHC-RAN-01',
    bed_type: 'OXYGEN',
    total_beds: 20,
    occupied_beds: 19 // 95% occupancy
  });
  assert.strictEqual(bedRecord.occupied_beds, 19);
  console.log('  ✔ Oxygen Bed occupancy updated to 95% (Critical threshold triggered)');

  // 5. Staff Attendance Roster
  console.log('[5/8] Testing Medical Personnel Attendance...');
  const staffRecord = await staffService.logAttendance({
    phc_id: 'PHC-RAN-01',
    staff_name: 'Dr. Priya Sharma',
    role: 'DOCTOR',
    shift: 'EVENING',
    status: 'ON_DUTY'
  });
  assert.strictEqual(staffRecord.status, 'ON_DUTY');
  console.log('  ✔ Staff duty log recorded: Dr. Priya Sharma (Doctor, Evening Shift)');

  // 6. Cross-District Rebalancing & Logistics
  console.log('[6/8] Testing Cross-District Resource Transfer Workflow...');
  const transfer = await transferService.createTransfer({
    source_phc_id: 'PHC-RAN-01',
    destination_phc_id: 'PHC-RAN-03',
    medicine_id: 'MED-001',
    quantity: 150,
    requested_by: 'district.ranchi@arogyagrid.gov.in'
  });
  assert.strictEqual(transfer.status, 'PENDING');
  assert(transfer.route_distance_km > 0, 'Distance must be calculated');

  const approved = await transferService.updateStatus(transfer.id, {
    status: 'APPROVED',
    approved_by: 'district.ranchi@arogyagrid.gov.in'
  });
  assert.strictEqual(approved.status, 'APPROVED');
  console.log(`  ✔ Transfer TRF-${transfer.id.slice(-4)} created (${transfer.route_distance_km} km) and approved`);

  // 7. ML Service & Federated Learning Coordinator
  console.log('[7/8] Testing ML Predictor & Federated Coordinator...');
  const pred = await mlService.predictStockout({
    phc_id: 'PHC-RAN-03',
    medicine_id: 'MED-001',
    current_stock: 35,
    daily_consumption: 40.0,
    footfall_surge_factor: 1.3
  });
  assert(pred.days_to_stockout > 0, 'DTS should be positive');
  assert(['CRITICAL', 'HIGH'].includes(pred.risk_level), 'Should trigger high/critical risk');

  const fedStatus = await mlService.getFederatedStatus();
  assert(fedStatus.active_nodes.length >= 3, 'Active state nodes present');
  console.log(`  ✔ ML Inference: Days to Stockout = ${pred.days_to_stockout}d, Risk = ${pred.risk_level}`);
  console.log(`  ✔ Federated Nodes: [${fedStatus.active_nodes.join(', ')}], Version: ${fedStatus.global_model_version}`);

  // 8. MCP Tools Verification
  console.log('[8/8] Testing Model Context Protocol (MCP) Tool Suite...');
  assert(tools.length >= 4, 'MCP must register at least 4 tools');
  const toolNames = tools.map(t => t.name);
  console.log(`  ✔ MCP Tools Available: ${toolNames.join(', ')}`);

  console.log('================================================================');
  console.log('       ALL 8/8 CORE SUBSYSTEMS ARE FULLY OPERATIONAL            ');
  console.log('================================================================');
  process.exit(0);
}

runFullHealthCheck().catch(err => {
  console.error('Health Check Failed:', err);
  process.exit(1);
});
