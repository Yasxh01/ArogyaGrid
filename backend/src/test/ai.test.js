const assert = require('assert');
const db = require('../config/db');
const { seedDatabase } = require('../db/seed');
const aiService = require('../services/aiService');

async function testAISuite() {
  console.log('=== Testing ArogyaGrid GenAI & Vernacular Intelligence ===');
  await db.initialize();
  await seedDatabase();

  // Test 1: Hindi Vernacular Voice Intake Parsing
  console.log('Test 1: Hindi Vernacular Voice Intake...');
  const voiceRes1 = await aiService.parseNaturalLanguageIntake({
    text: 'आज सदर पीएचसी में 50 पैरासिटामोल बांटी गई',
    phc_id: 'PHC-RAN-01',
    language: 'hi'
  });
  console.log('  Parsed Result:', voiceRes1);
  assert.strictEqual(voiceRes1.type, 'STOCK_OUT');
  assert.strictEqual(voiceRes1.quantity, 50);
  assert.strictEqual(voiceRes1.medicine_id, 'MED-001');
  console.log('  ✔ Passed: Hindi voice note accurately parsed into MED-001 DISPENSE');

  // Test 2: English Bed Intake Parsing
  console.log('Test 2: Natural Language Bed Update Parsing...');
  const voiceRes2 = await aiService.parseNaturalLanguageIntake({
    text: 'Namkum PHC has 18 oxygen beds occupied right now',
    phc_id: 'PHC-RAN-03'
  });
  console.log('  Parsed Result:', voiceRes2);
  assert.strictEqual(voiceRes2.type, 'BED_UPDATE');
  assert.strictEqual(voiceRes2.occupied_beds, 18);
  console.log('  ✔ Passed: Bed telemetry parsed successfully');

  // Test 3: Multimodal Gemini Vision Delivery Challan Digitizer
  console.log('Test 3: Multimodal Delivery Challan Digitizer...');
  const challanRes = await aiService.digitizeStockChallan({
    phc_id: 'PHC-RAN-01'
  });
  console.log('  Challan No:', challanRes.challan_number);
  console.log('  Items Extracted:', challanRes.items.length);
  assert(challanRes.challan_number.startsWith('CH-'), 'Should generate valid challan number');
  assert(challanRes.items.length >= 3, 'Should extract items array');
  assert(challanRes.items.some(i => i.nlem_code && i.batch_number), 'Items must have NLEM code and batch number');
  console.log('  ✔ Passed: Multimodal Challan Digitizer extracted structured batch items');

  // Test 4: Executive State Health Situation Report
  console.log('Test 4: Executive Situation Report Generation...');
  const report = await aiService.generateSituationReport({
    district_id: 'DIST-JH-01',
    state: 'Jharkhand'
  });
  console.log('  Executive Report Summary:', report.executive_summary);
  assert(report.outbreak_risk_level, 'Should assess outbreak risk level');
  assert(report.recommended_immediate_actions.length > 0, 'Should provide action items');
  console.log('  ✔ Passed: State Health briefing generated with crisis recommendations');

  // Test 5: Copilot Query with Cold-Chain Check
  console.log('Test 5: District Officer Copilot Query with Cold-Chain Watchdog...');
  const copilotRes = await aiService.handleCopilotQuery({
    query: 'What is the cold chain refrigerator status?'
  });
  console.log('  Copilot Answer:', copilotRes.answer);
  assert(copilotRes.answer.includes('Ice-Lined Refrigerators') || copilotRes.answer.includes('Cold-Chain'), 'Copilot should evaluate cold-chain telemetry');
  console.log('  ✔ Passed: Copilot grounded querying and cold-chain status verified');

  console.log('=== ALL AI INTELLIGENCE UNIT TESTS PASSED (5/5) ===');
  process.exit(0);
}

testAISuite().catch(err => {
  console.error('AI Test Failed:', err);
  process.exit(1);
});
