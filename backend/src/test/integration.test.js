const assert = require('assert');
const db = require('../config/db');
const { seedDatabase } = require('../db/seed');

async function runTests() {
  console.log('=== Starting ArogyaGrid Backend Integration Tests ===');

  await db.initialize();
  await seedDatabase();

  const stockService = require('../services/stockService');
  const bedService = require('../services/bedService');
  const staffService = require('../services/staffService');
  const transferService = require('../services/transferService');

  // Test 1: Idempotency & Stock Transaction
  console.log('Test 1: Transaction UUID Idempotency...');
  const txUuid = 'test-uuid-' + Date.now();
  const res1 = await stockService.processTransaction({
    transaction_uuid: txUuid,
    phc_id: 'PHC-RAN-01',
    medicine_id: 'MED-001',
    quantity: 50,
    transaction_type: 'INTAKE',
    created_by: 'test@arogyagrid.gov.in'
  });
  assert.strictEqual(res1.duplicate, false, 'First submission should NOT be a duplicate');

  const res2 = await stockService.processTransaction({
    transaction_uuid: txUuid,
    phc_id: 'PHC-RAN-01',
    medicine_id: 'MED-001',
    quantity: 50,
    transaction_type: 'INTAKE',
    created_by: 'test@arogyagrid.gov.in'
  });
  assert.strictEqual(res2.duplicate, true, 'Second submission MUST be detected as duplicate');
  console.log('  -> PASSED (Idempotency deduplication verified)');

  // Test 2: Bed Telemetry
  console.log('Test 2: Bed Capacity & High Occupancy Calculation...');
  const bedRes = await bedService.updateBedOccupancy({
    phc_id: 'PHC-RAN-01',
    bed_type: 'ICU',
    total_beds: 10,
    occupied_beds: 9
  });
  assert.strictEqual(bedRes.occupied_beds, 9);
  console.log('  -> PASSED (Bed occupancy updated to 90%)');

  // Test 3: Staff Attendance
  console.log('Test 3: Staff Attendance Check-In...');
  const staffRes = await staffService.logAttendance({
    phc_id: 'PHC-RAN-01',
    staff_name: 'Dr. Anita Roy',
    role: 'DOCTOR',
    shift: 'MORNING'
  });
  assert.strictEqual(staffRes.staff_name, 'Dr. Anita Roy');
  console.log('  -> PASSED (Staff attendance logged)');

  // Test 4: Transfer Workflow
  console.log('Test 4: Inter-District Resource Transfer...');
  const transfer = await transferService.createTransfer({
    source_phc_id: 'PHC-RAN-01',
    destination_phc_id: 'PHC-RAN-03',
    medicine_id: 'MED-001',
    quantity: 100,
    requested_by: 'district.ranchi@arogyagrid.gov.in'
  });
  assert.strictEqual(transfer.status, 'PENDING');
  const approved = await transferService.updateStatus(transfer.id, {
    status: 'APPROVED',
    approved_by: 'district.ranchi@arogyagrid.gov.in'
  });
  assert.strictEqual(approved.status, 'APPROVED');
  console.log('  -> PASSED (Transfer requested and approved)');

  console.log('=== ALL BACKEND INTEGRATION TESTS PASSED (4/4) ===');
  process.exit(0);
}

runTests().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
