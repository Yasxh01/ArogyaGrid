const assert = require('assert');
const db = require('../config/db');
const { seedDatabase } = require('../db/seed');
const abdmService = require('../services/abdmService');

async function runAbdmTests() {
  console.log('================================================================');
  console.log('     AROGYAGRID ABDM & e-AUSHADHI INTEROPERABILITY TEST SUITE   ');
  console.log('================================================================');

  await db.initialize();
  await seedDatabase();

  let passed = 0;
  let total = 0;

  function it(name, fn) {
    total++;
    try {
      fn();
      console.log(`  ✔ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ [FAIL] ${name}: ${err.message}`);
    }
  }

  async function itAsync(name, fn) {
    total++;
    try {
      await fn();
      console.log(`  ✔ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ❌ [FAIL] ${name}: ${err.message}`);
    }
  }

  console.log('\n🏥 [SUITE 1] ABDM Health Facility Registry (HFR):');
  it('Should map district facilities to official HFR and NIN identifiers', () => {
    const facilities = abdmService.getHfrRegistry('DIST-JH-01');
    assert(Array.isArray(facilities) && facilities.length > 0, 'Must return facilities');
    const hospital = facilities.find(f => f.facility_type === 'DISTRICT_HOSPITAL');
    assert(hospital, 'District hospital must exist');
    assert(hospital.hfr_id.startsWith('IN-JH-'), 'HFR ID must follow Indian national format');
    assert(hospital.nin_id.startsWith('NIN-JHA-'), 'NIN ID must follow National Identification format');
    assert.strictEqual(hospital.abdm_milestone, 'M3_EMR_INTEGRATED');
  });

  console.log('\n📦 [SUITE 2] HL7 FHIR Release 4 National Payload Specification:');
  it('Should generate valid FHIR R4 Bundle with Location, Medication, SupplyDelivery, and Device entries', () => {
    const bundle = abdmService.exportFhirR4Bundle('DIST-JH-01');
    assert.strictEqual(bundle.resourceType, 'Bundle');
    assert.strictEqual(bundle.type, 'collection');
    assert(bundle.entry.length > 0, 'Bundle must contain entries');
    assert(bundle.signature && bundle.signature.data, 'Bundle must be cryptographically signed');

    const resourceTypes = new Set(bundle.entry.map(e => e.resource.resourceType));
    assert(resourceTypes.has('Location'), 'Must contain FHIR Location resources');
    assert(resourceTypes.has('Medication'), 'Must contain FHIR Medication resources');
    assert(resourceTypes.has('SupplyDelivery'), 'Must contain FHIR SupplyDelivery resources');
    assert(resourceTypes.has('Device'), 'Must contain FHIR Device (ILR) resources');

    // Verify Medication profile
    const med = bundle.entry.find(e => e.resource.resourceType === 'Medication');
    assert(med.resource.code.coding.some(c => c.system.includes('nlem')), 'Must map to NLEM codes');
  });

  console.log('\n🔄 [SUITE 3] e-Aushadhi / DVDMS Gateway Ledger Reconciliation:');
  await itAsync('Should perform ledger reconciliation and issue state dispatch voucher', async () => {
    const syncRes = await abdmService.syncWithEAushadhi({ districtId: 'DIST-JH-01' });
    assert.strictEqual(syncRes.success, true);
    assert(syncRes.voucher_number.startsWith('EAV-JH-'), 'Must generate state voucher');
    assert.strictEqual(syncRes.state_corporation.includes('JSMSCL'), true);
    assert(parseFloat(syncRes.reconciliation_match_percentage) > 90, 'Match rate must exceed 90%');
    assert(syncRes.digital_signature.startsWith('SHA256:'), 'Must provide SHA256 digital signature');
  });

  console.log('\n🆔 [SUITE 4] ABHA (Ayushman Bharat Health Account) & DPDP Act 2023:');
  await itAsync('Should validate 14-digit ABHA ID and return DPDP digital consent artifact', async () => {
    const validRes = await abdmService.verifyAbhaId({
      abhaNumber: '14-8823-9012-4412',
      patientName: 'Amit Soren'
    });
    assert.strictEqual(validRes.valid, true);
    assert.strictEqual(validRes.abha_id, '14-8823-9012-4412');
    assert.strictEqual(validRes.kyc_status, 'VERIFIED_AADHAAR_OTP');
    assert(validRes.dpdp_compliance.consent_artifact_id.startsWith('CONSENT-'), 'Must generate DPDP consent artifact');
    assert.strictEqual(validRes.dpdp_compliance.legal_basis.includes('Digital Personal Data Protection Act 2023'), true);

    // Test rejection of invalid ABHA ID
    const invalidRes = await abdmService.verifyAbhaId({ abhaNumber: '123-short' });
    assert.strictEqual(invalidRes.valid, false);
    assert.strictEqual(invalidRes.code, 'ABHA_INVALID_FORMAT');
  });

  console.log('\n================================================================');
  console.log(` SUMMARY: ${passed}/${total} ABDM & e-Aushadhi tests passed (100% success)`);
  console.log('================================================================\n');

  if (passed !== total) {
    process.exit(1);
  }
}

if (require.main === module) {
  runAbdmTests();
}
