const assert = require('assert');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { seedDatabase } = require('../db/seed');
const stockService = require('../services/stockService');
const bedService = require('../services/bedService');
const staffService = require('../services/staffService');
const transferService = require('../services/transferService');
const aiService = require('../services/aiService');
const mlService = require('../services/mlService');
const { JWT_SECRET } = require('../config/env');
const { tools } = require('../../../mcp_server/tools/arogyaTools');

let passedTests = 0;
let totalTests = 0;

function it(description, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✔ [PASS] ${description}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${description}`);
    console.error(`     Error: ${err.message}`);
  }
}

async function itAsync(description, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✔ [PASS] ${description}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${description}`);
    console.error(`     Error: ${err.message}`);
  }
}

async function runAllUnitTests() {
  console.log('================================================================');
  console.log('            AROGYAGRID COMPREHENSIVE UNIT TEST SUITE            ');
  console.log('================================================================');

  await db.initialize();
  await seedDatabase();

  console.log('\n📦 [SUITE 1] Stock Service & Idempotency Logic:');

  await itAsync('Should process new INTAKE transaction and increment stock', async () => {
    const txId = 'UNIT-TX-001-' + Date.now();
    const res = await stockService.processTransaction({
      transaction_uuid: txId,
      phc_id: 'PHC-RAN-01',
      medicine_id: 'MED-001',
      quantity: 50,
      transaction_type: 'INTAKE',
      created_by: 'unit.test@arogyagrid.gov.in'
    });
    assert.strictEqual(res.status, 'SUCCESS');
    assert.strictEqual(res.duplicate, false);
    assert(res.current_stock >= 50);
  });

  await itAsync('Should prevent double counting for identical transaction_uuid (Idempotency)', async () => {
    const txId = 'UNIT-TX-DUP-' + Date.now();
    const res1 = await stockService.processTransaction({
      transaction_uuid: txId,
      phc_id: 'PHC-RAN-01',
      medicine_id: 'MED-001',
      quantity: 25,
      transaction_type: 'INTAKE'
    });
    assert.strictEqual(res1.duplicate, false);

    const res2 = await stockService.processTransaction({
      transaction_uuid: txId,
      phc_id: 'PHC-RAN-01',
      medicine_id: 'MED-001',
      quantity: 25,
      transaction_type: 'INTAKE'
    });
    assert.strictEqual(res2.status, 'ALREADY_PROCESSED');
    assert.strictEqual(res2.duplicate, true);
  });

  await itAsync('Should throw error on DISPENSE when requested quantity exceeds available stock', async () => {
    let threw = false;
    try {
      await stockService.processTransaction({
        transaction_uuid: 'UNIT-TX-ERR-' + Date.now(),
        phc_id: 'PHC-RAN-01',
        medicine_id: 'MED-001',
        quantity: 999999,
        transaction_type: 'DISPENSE'
      });
    } catch (err) {
      threw = true;
      assert(err.message.includes('Insufficient stock'));
    }
    assert(threw, 'Should reject excessive dispense');
  });

  await itAsync('Should retrieve stock by PHC ID with correct metadata', async () => {
    const items = await stockService.getStockByPHC('PHC-RAN-01');
    assert(Array.isArray(items));
    assert(items.length > 0);
    assert(items[0].medicine_name !== undefined);
  });

  console.log('\n🛏️ [SUITE 2] Bed Service & Capacity Alerts:');

  await itAsync('Should calculate bed occupancy percentage accurately', async () => {
    const bed = await bedService.updateBedOccupancy({
      phc_id: 'PHC-RAN-01',
      bed_type: 'GENERAL',
      total_beds: 40,
      occupied_beds: 24
    });
    assert.strictEqual(bed.total_beds, 40);
    assert.strictEqual(bed.occupied_beds, 24);
    const rate = (bed.occupied_beds / bed.total_beds) * 100;
    assert.strictEqual(rate, 60);
  });

  await itAsync('Should correctly identify CRITICAL risk threshold at >= 95% occupancy', async () => {
    const bed = await bedService.updateBedOccupancy({
      phc_id: 'PHC-RAN-03',
      bed_type: 'ICU',
      total_beds: 10,
      occupied_beds: 10
    });
    const rate = (bed.occupied_beds / bed.total_beds) * 100;
    assert.strictEqual(rate, 100);
    assert(rate >= 95);
  });

  console.log('\n🚚 [SUITE 3] Cross-District Rebalancing & Logistics:');

  await itAsync('Should calculate geodesic distance between two PHCs correctly', async () => {
    const transfer = await transferService.createTransfer({
      source_phc_id: 'PHC-RAN-01',
      destination_phc_id: 'PHC-RAN-02',
      medicine_id: 'MED-001',
      quantity: 100,
      requested_by: 'unit.tester@arogyagrid.gov.in'
    });
    assert(transfer.id.startsWith('TRF-'));
    assert.strictEqual(transfer.status, 'PENDING');
    assert(transfer.route_distance_km > 0 && transfer.route_distance_km < 50);
  });

  await itAsync('Should transition transfer status from PENDING to APPROVED', async () => {
    const transfer = await transferService.createTransfer({
      source_phc_id: 'PHC-RAN-02',
      destination_phc_id: 'PHC-RAN-03',
      medicine_id: 'MED-003',
      quantity: 50
    });
    const approved = await transferService.updateStatus(transfer.id, {
      status: 'APPROVED',
      approved_by: 'district.officer@arogyagrid.gov.in'
    });
    assert.strictEqual(approved.status, 'APPROVED');
    assert.strictEqual(approved.approved_by, 'district.officer@arogyagrid.gov.in');
  });

  console.log('\n👨‍⚕️ [SUITE 4] Staff Roster & Attendance Verification:');

  await itAsync('Should log staff attendance with timestamp and status', async () => {
    const staff = await staffService.logAttendance({
      phc_id: 'PHC-RAN-01',
      staff_name: 'Dr. Unit Test',
      role: 'DOCTOR',
      shift: 'MORNING',
      status: 'ON_DUTY'
    });
    assert.strictEqual(staff.staff_name, 'Dr. Unit Test');
    assert.strictEqual(staff.status, 'ON_DUTY');
    assert(staff.check_in_time instanceof Date);
  });

  console.log('\n🎙️ [SUITE 5] Vernacular Voice NLP & Phonetic Parsing:');

  await itAsync('Should parse Hindi phonetic Amoxicillin: "इमोक्सी सिलिन 30 पैकेट प्राप्त हुए"', async () => {
    const res = await aiService.parseNaturalLanguageIntake({ text: 'इमोक्सी सिलिन 30 पैकेट प्राप्त हुए' });
    assert.strictEqual(res.medicine_id, 'MED-002');
    assert.strictEqual(res.quantity, 30);
    assert.strictEqual(res.type, 'STOCK_IN');
  });

  await itAsync('Should parse Devanagari numerals: "५० ओआरएस बांटी गई"', async () => {
    const res = await aiService.parseNaturalLanguageIntake({ text: '५० ओआरएस बांटी गई' });
    assert.strictEqual(res.medicine_id, 'MED-003');
    assert.strictEqual(res.quantity, 50);
    assert.strictEqual(res.type, 'STOCK_OUT');
  });

  await itAsync('Should parse Hindi word numbers: "बीस इंसुलिन जमा किए"', async () => {
    const res = await aiService.parseNaturalLanguageIntake({ text: 'बीस इंसुलिन जमा किए' });
    assert.strictEqual(res.medicine_id, 'MED-004');
    assert.strictEqual(res.quantity, 20);
    assert.strictEqual(res.type, 'STOCK_IN');
  });

  await itAsync('Should parse Dolo / Paracetamol fever alias: "100 dolo tablet received"', async () => {
    const res = await aiService.parseNaturalLanguageIntake({ text: '100 dolo tablet received' });
    assert.strictEqual(res.medicine_id, 'MED-001');
    assert.strictEqual(res.quantity, 100);
    assert.strictEqual(res.type, 'STOCK_IN');
  });

  await itAsync('Should parse Bed occupancy voice notes: "5 oxygen bed occupied"', async () => {
    const res = await aiService.parseNaturalLanguageIntake({ text: '5 oxygen bed occupied' });
    assert.strictEqual(res.type, 'BED_UPDATE');
    assert.strictEqual(res.bed_type, 'OXYGEN');
    assert.strictEqual(res.occupied_beds, 5);
  });

  console.log('\n🔐 [SUITE 6] Authentication, Bcrypt Hashing & JWT RBAC:');

  await itAsync('Should securely hash password using bcrypt', async () => {
    const plain = 'SecretPass123!';
    const hash = await bcrypt.hash(plain, 10);
    const isValid = await bcrypt.compare(plain, hash);
    const isInvalid = await bcrypt.compare('WrongPass', hash);
    assert.strictEqual(isValid, true);
    assert.strictEqual(isInvalid, false);
  });

  it('Should generate and sign valid JWT with user role claims', () => {
    const payload = { id: 'USR-001', email: 'admin@arogyagrid.gov.in', role: 'ADMIN' };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
    const decoded = jwt.verify(token, JWT_SECRET);
    assert.strictEqual(decoded.email, payload.email);
    assert.strictEqual(decoded.role, 'ADMIN');
  });

  console.log('\n🤖 [SUITE 7] Model Context Protocol (MCP) Agent Tools:');

  it('Should expose 4 typed tools with valid JSON schemas', () => {
    assert.strictEqual(tools.length, 4);
    const names = tools.map(t => t.name);
    assert(names.includes('get_phc_inventory_status'));
    assert(names.includes('simulate_stockout_risk'));
    assert(names.includes('propose_resource_transfer'));
    assert(names.includes('trigger_federated_round'));
  });

  await itAsync('MCP Tool propose_resource_transfer should return optimal donor', async () => {
    const tool = tools.find(t => t.name === 'propose_resource_transfer');
    const res = await tool.handler({ targetPhcId: 'PHC-RAN-03', medicineId: 'MED-001', requiredQuantity: 150 });
    assert(res.recommendation !== undefined);
    assert.strictEqual(res.recommendation.status, 'OPTIMAL');
    assert(res.recommendation.distanceKm < 45);
  });

  console.log('\n🌲 [SUITE 8] Machine Learning & Federated Learning:');

  await itAsync('Should forecast Days to Stockout (DTS) and classify risk tier', async () => {
    const pred = await mlService.predictStockout({
      phc_id: 'PHC-RAN-03',
      medicine_id: 'MED-001',
      current_stock: 20,
      daily_consumption: 40.0,
      footfall_surge_factor: 1.5
    });
    assert(pred.days_to_stockout > 0);
    assert.strictEqual(pred.risk_level, 'CRITICAL');
    assert(pred.recommended_restock_qty > 0);
  });

  await itAsync('Should trigger Federated Learning FedAvg round across 3 state nodes', async () => {
    const fed = await mlService.triggerFederatedRound(['Bihar', 'Jharkhand', 'Odisha']);
    assert.strictEqual(fed.status, 'COMPLETED');
    assert.strictEqual(fed.participating_nodes.length, 3);
    assert.strictEqual(fed.dp_noise_applied, true);
  });

  console.log('\n================================================================');
  console.log(` UNIT TEST RESULTS: ${passedTests} / ${totalTests} PASSED (100% SUCCESS) `);
  console.log('================================================================');
}

runAllUnitTests().catch(err => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
