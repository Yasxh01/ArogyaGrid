const assert = require('assert');
const db = require('../config/db');
const { seedDatabase } = require('../db/seed');
const coldChainService = require('../services/coldChainService');

let passedTests = 0;
let totalTests = 0;

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

async function runColdChainTests() {
  console.log('================================================================');
  console.log('      AROGYAGRID COLD-CHAIN IOT & WHO DATA VALIDATION SUITE     ');
  console.log('================================================================');

  await db.initialize();
  await seedDatabase();

  console.log('\n❄️ [SUITE 1] Cold-Chain IoT Sensor Ingestion & Threshold Rules:');

  await itAsync('Should list all seeded cold chain units with facility and state metadata', async () => {
    const units = await coldChainService.getAllUnits();
    assert(Array.isArray(units), 'Units must be an array');
    assert(units.length >= 4, `Expected at least 4 seeded units, found ${units.length}`);
    const unit1 = units.find(u => u.id === 'CCU-RAN-01');
    assert(unit1, 'CCU-RAN-01 must exist');
    assert.strictEqual(unit1.min_temp_celsius, 2.0);
    assert.strictEqual(unit1.max_temp_celsius, 8.0);
    assert.strictEqual(unit1.facility_name, 'Ranchi Sadar PHC');
  });

  await itAsync('Should ingest normal operating telemetry (4.5°C) and keep status NORMAL', async () => {
    const result = await coldChainService.recordTelemetry({
      unit_id: 'CCU-RAN-01',
      temperature_celsius: 4.5,
      ambient_temp_celsius: 30.0,
      power_status: 'MAINS_ACTIVE',
      battery_runtime_mins: 480
    });
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.status, 'NORMAL');
    assert.strictEqual(result.unit.current_temp_celsius, 4.5);
  });

  await itAsync('Should detect Heat Excursion Breach (> 8.0°C) and trigger alarm', async () => {
    const result = await coldChainService.recordTelemetry({
      unit_id: 'CCU-RAN-01',
      temperature_celsius: 9.2,
      ambient_temp_celsius: 34.0,
      power_status: 'BATTERY_BACKUP',
      battery_runtime_mins: 40
    });
    assert.strictEqual(result.status, 'BREACH');
    assert.strictEqual(result.breachType, 'HEAT_EXCURSION');
  });

  await itAsync('Should detect Sub-Zero Freeze Risk (< 2.0°C) and trigger alarm', async () => {
    const result = await coldChainService.recordTelemetry({
      unit_id: 'CCU-RAN-02',
      temperature_celsius: 1.2,
      ambient_temp_celsius: 28.0,
      power_status: 'MAINS_ACTIVE'
    });
    assert.strictEqual(result.status, 'BREACH');
    assert.strictEqual(result.breachType, 'FREEZE_RISK');
  });

  await itAsync('Should calculate predictive spoilage time-to-decay for heat breaches', async () => {
    const assessment = await coldChainService.assessThermalSpoilageRisk('CCU-RAN-01');
    assert(assessment, 'Assessment must be returned');
    assert.strictEqual(assessment.risk_level, 'HIGH');
    assert(assessment.hours_to_spoilage > 0, 'Hours to spoilage must be positive');
    assert(assessment.recommendation.includes('Thermal breach detected'), 'Must recommend corrective action');
  });

  await itAsync('Should execute Grid Failure operations drill successfully', async () => {
    const drill = await coldChainService.simulateDrill({
      unit_id: 'CCU-PAT-01',
      event_type: 'GRID_FAILURE'
    });
    assert.strictEqual(drill.unit.power_status, 'BATTERY_BACKUP');
    assert.strictEqual(drill.unit.status, 'BREACH');
    assert(drill.unit.current_temp_celsius > 8.0);
  });

  console.log('\n🏛️ [SUITE 2] Real WHO & Government Public Dataset Audit:');

  await itAsync('Should verify medicines catalog is mapped to official NLEM / WHO standards', () => {
    const store = db.memoryStore;
    assert(store.medicines.length >= 7, 'Medicines catalog must be loaded');
    for (const med of store.medicines) {
      assert(med.nlem_code, `Medicine ${med.name} (${med.id}) must have an official NLEM code`);
      assert(['COLD_CHAIN_2_8C', 'AMBIENT'].includes(med.storage_type), `Medicine ${med.name} must have valid storage type`);
    }
    const coldMeds = store.medicines.filter(m => m.storage_type === 'COLD_CHAIN_2_8C');
    assert(coldMeds.length >= 2, 'Must include cold-chain vaccines and insulin');
  });

  await itAsync('Should verify facility hierarchy across all 4 public health tiers', () => {
    const store = db.memoryStore;
    const types = new Set(store.phcs.map(p => p.facility_type));
    assert(types.has('DISTRICT_HOSPITAL'), 'Must include District Hospital tier');
    assert(types.has('CHC'), 'Must include Community Health Centre tier');
    assert(types.has('PHC'), 'Must include Primary Health Centre tier');
    assert(types.has('SUB_CENTRE_HWC'), 'Must include Sub-Centre / Ayushman Arogya Mandir tier');
  });

  console.log('\n================================================================');
  console.log(`SUMMARY: ${passedTests}/${totalTests} tests passed (${Math.round((passedTests / totalTests) * 100)}% success rate)`);
  console.log('================================================================\n');

  if (passedTests !== totalTests) {
    process.exit(1);
  }
}

if (require.main === module) {
  runColdChainTests();
}

module.exports = { runColdChainTests };
