const bcrypt = require('bcryptjs');
const db = require('../config/db');

async function seedDatabase() {
  const store = db.memoryStore;
  if (store.districts.length > 0) return;

  console.log('[Seed] Seeding enterprise multi-state public healthcare data for India...');

  // 1. Multi-State Districts (Jharkhand, Bihar, Odisha, Maharashtra, Karnataka)
  store.districts = [
    { id: 'DIST-JH-01', name: 'Ranchi', state: 'Jharkhand', latitude: 23.3441, longitude: 85.3096 },
    { id: 'DIST-JH-02', name: 'Dhanbad', state: 'Jharkhand', latitude: 23.7957, longitude: 86.4304 },
    { id: 'DIST-BR-01', name: 'Patna', state: 'Bihar', latitude: 25.5941, longitude: 85.1376 },
    { id: 'DIST-BR-02', name: 'Gaya', state: 'Bihar', latitude: 24.7955, longitude: 85.0002 },
    { id: 'DIST-OD-01', name: 'Khordha', state: 'Odisha', latitude: 20.1812, longitude: 85.6174 },
    { id: 'DIST-MH-01', name: 'Pune', state: 'Maharashtra', latitude: 18.5204, longitude: 73.8567 },
    { id: 'DIST-KA-01', name: 'Bengaluru Urban', state: 'Karnataka', latitude: 12.9716, longitude: 77.5946 }
  ];

  // 2. Facilities across 4 Tiers (DH, CHC, PHC, SUB_CENTRE_HWC)
  store.phcs = [
    { id: 'DH-RAN-01', name: 'Ranchi District Civil Hospital', facility_type: 'DISTRICT_HOSPITAL', district_id: 'DIST-JH-01', latitude: 23.3600, longitude: 85.3250, capacity: 250, status: 'HEALTHY', population_served: 250000 },
    { id: 'PHC-RAN-01', name: 'Ranchi Sadar PHC', facility_type: 'PHC', district_id: 'DIST-JH-01', latitude: 23.3500, longitude: 85.3200, capacity: 50, status: 'HEALTHY', population_served: 18000 },
    { id: 'PHC-RAN-02', name: 'Kanke Rural CHC', facility_type: 'CHC', district_id: 'DIST-JH-01', latitude: 23.4350, longitude: 85.3200, capacity: 60, status: 'HEALTHY', population_served: 35000 },
    { id: 'PHC-RAN-03', name: 'Namkum PHC', facility_type: 'PHC', district_id: 'DIST-JH-01', latitude: 23.3200, longitude: 85.3800, capacity: 40, status: 'CRITICAL', population_served: 15000 },
    { id: 'HWC-RAN-01', name: 'Bundu Ayushman Arogya Mandir', facility_type: 'SUB_CENTRE_HWC', district_id: 'DIST-JH-01', latitude: 23.1800, longitude: 85.5800, capacity: 10, status: 'HEALTHY', population_served: 6000 },
    { id: 'PHC-DHN-01', name: 'Jharia Coalfield CHC', facility_type: 'CHC', district_id: 'DIST-JH-02', latitude: 23.7400, longitude: 86.4100, capacity: 55, status: 'WARNING', population_served: 40000 },
    { id: 'PHC-PAT-01', name: 'Patna City Sub-Divisional Hospital', facility_type: 'CHC', district_id: 'DIST-BR-01', latitude: 25.6000, longitude: 85.1800, capacity: 80, status: 'HEALTHY', population_served: 60000 },
    { id: 'PHC-GAY-01', name: 'Bodh Gaya PHC', facility_type: 'PHC', district_id: 'DIST-BR-02', latitude: 24.6950, longitude: 84.9910, capacity: 35, status: 'HEALTHY', population_served: 14000 },
    { id: 'PHC-KHO-01', name: 'Bhubaneswar Urban CHC', facility_type: 'CHC', district_id: 'DIST-OD-01', latitude: 20.2961, longitude: 85.8245, capacity: 70, status: 'HEALTHY', population_served: 45000 },
    { id: 'PHC-PUN-01', name: 'Haveli Rural CHC', facility_type: 'CHC', district_id: 'DIST-MH-01', latitude: 18.5100, longitude: 73.8900, capacity: 50, status: 'HEALTHY', population_served: 32000 },
    { id: 'PHC-BLR-01', name: 'Anekal Community Health Centre', facility_type: 'CHC', district_id: 'DIST-KA-01', latitude: 12.7100, longitude: 77.6900, capacity: 60, status: 'HEALTHY', population_served: 38000 }
  ];

  // 3. National Essential Medicines Catalog (NLEM-2022 & WHO EML Compliant)
  store.medicines = [
    { id: 'MED-001', nlem_code: 'NLEM-2022-A01', name: 'Paracetamol 500mg Tablets', category: 'Antipyretic', unit: 'strips', storage_type: 'AMBIENT', minimum_stock: 150, daily_base_consumption: 35.0 },
    { id: 'MED-002', nlem_code: 'NLEM-2022-J01', name: 'Amoxicillin 250mg Capsules', category: 'Antibiotic', unit: 'strips', storage_type: 'AMBIENT', minimum_stock: 100, daily_base_consumption: 25.0 },
    { id: 'MED-003', nlem_code: 'NLEM-2022-O01', name: 'Oral Rehydration Salts (ORS)', category: 'Essential / Diarrheal', unit: 'sachets', storage_type: 'AMBIENT', minimum_stock: 200, daily_base_consumption: 40.0 },
    { id: 'MED-004', nlem_code: 'NLEM-2022-I01', name: 'Insulin Glargine 100IU/ml', category: 'Cold-Chain / Diabetes', unit: 'vials', storage_type: 'COLD_CHAIN_2_8C', minimum_stock: 30, daily_base_consumption: 5.0 },
    { id: 'MED-005', nlem_code: 'NLEM-2022-V01', name: 'Anti-Rabies Vaccine (ARV)', category: 'Emergency / Cold-Chain', unit: 'vials', storage_type: 'COLD_CHAIN_2_8C', minimum_stock: 25, daily_base_consumption: 4.0 },
    { id: 'MED-006', nlem_code: 'NLEM-2022-A02', name: 'Azithromycin 500mg Tablets', category: 'Antibiotic', unit: 'strips', storage_type: 'AMBIENT', minimum_stock: 50, daily_base_consumption: 15.0 },
    { id: 'MED-007', nlem_code: 'NLEM-2022-C01', name: 'Cetirizine 10mg Tablets', category: 'Antihistamine', unit: 'strips', storage_type: 'AMBIENT', minimum_stock: 80, daily_base_consumption: 20.0 },
    { id: 'MED-008', nlem_code: 'NLEM-2022-V02', name: 'Rotavirus Vaccine (Live Oral)', category: 'Pediatric / Cold-Chain', unit: 'doses', storage_type: 'COLD_CHAIN_2_8C', minimum_stock: 40, daily_base_consumption: 6.0 }
  ];

  // 4. Initial Stock
  store.stock = [
    { id: 'STK-001', phc_id: 'PHC-RAN-01', medicine_id: 'MED-001', quantity: 650, daily_consumption: 35.0, updated_at: new Date() },
    { id: 'STK-002', phc_id: 'PHC-RAN-01', medicine_id: 'MED-002', quantity: 400, daily_consumption: 25.0, updated_at: new Date() },
    { id: 'STK-003', phc_id: 'PHC-RAN-01', medicine_id: 'MED-004', quantity: 45, daily_consumption: 4.0, updated_at: new Date() },
    { id: 'STK-004', phc_id: 'PHC-RAN-01', medicine_id: 'MED-005', quantity: 38, daily_consumption: 3.5, updated_at: new Date() },
    { id: 'STK-005', phc_id: 'PHC-RAN-02', medicine_id: 'MED-001', quantity: 720, daily_consumption: 20.0, updated_at: new Date() },
    { id: 'STK-006', phc_id: 'PHC-RAN-02', medicine_id: 'MED-003', quantity: 600, daily_consumption: 25.0, updated_at: new Date() },
    { id: 'STK-007', phc_id: 'PHC-RAN-03', medicine_id: 'MED-001', quantity: 35, daily_consumption: 40.0, updated_at: new Date() },
    { id: 'STK-008', phc_id: 'PHC-RAN-03', medicine_id: 'MED-003', quantity: 20, daily_consumption: 38.0, updated_at: new Date() },
    { id: 'STK-009', phc_id: 'PHC-RAN-03', medicine_id: 'MED-004', quantity: 3, daily_consumption: 6.0, updated_at: new Date() },
    { id: 'STK-010', phc_id: 'DH-RAN-01', medicine_id: 'MED-001', quantity: 3500, daily_consumption: 120.0, updated_at: new Date() },
    { id: 'STK-011', phc_id: 'PHC-PAT-01', medicine_id: 'MED-001', quantity: 900, daily_consumption: 45.0, updated_at: new Date() },
    { id: 'STK-012', phc_id: 'PHC-KHO-01', medicine_id: 'MED-005', quantity: 60, daily_consumption: 5.0, updated_at: new Date() }
  ];

  // 5. Batch-Level FEFO Inventory
  const now = new Date();
  const expFar = new Date(now.getFullYear() + 2, now.getMonth(), 1);
  const expNear = new Date(now.getFullYear(), now.getMonth() + 2, 1);

  store.batches = [
    { id: 'BAT-001', phc_id: 'PHC-RAN-01', medicine_id: 'MED-001', batch_number: 'PCM-2024-B1', quantity: 400, mfg_date: '2024-01-15', expiry_date: expFar.toISOString().split('T')[0], challan_ref: 'CH-JSMSCL-8841' },
    { id: 'BAT-002', phc_id: 'PHC-RAN-01', medicine_id: 'MED-001', batch_number: 'PCM-2023-A9', quantity: 250, mfg_date: '2023-08-10', expiry_date: expNear.toISOString().split('T')[0], challan_ref: 'CH-JSMSCL-6520' },
    { id: 'BAT-003', phc_id: 'PHC-RAN-01', medicine_id: 'MED-005', batch_number: 'ARV-2024-C2', quantity: 38, mfg_date: '2024-03-01', expiry_date: expFar.toISOString().split('T')[0], challan_ref: 'CH-JSMSCL-9102' },
    { id: 'BAT-004', phc_id: 'PHC-RAN-03', medicine_id: 'MED-001', batch_number: 'PCM-2023-A4', quantity: 35, mfg_date: '2023-05-15', expiry_date: expNear.toISOString().split('T')[0], challan_ref: 'CH-JSMSCL-5211' }
  ];

  // 6. Industrial Cold-Chain IoT Units (WHO PQS Standard 2°C–8°C Ice-Lined Refrigerators)
  store.cold_chain_units = [
    {
      id: 'CCU-RAN-01',
      phc_id: 'PHC-RAN-01',
      model_name: 'Vestfrost VLS 024 GreenLine ILR',
      min_temp_celsius: 2.0,
      max_temp_celsius: 8.0,
      current_temp_celsius: 4.2,
      ambient_temp_celsius: 29.5,
      power_status: 'MAINS_ACTIVE',
      battery_runtime_mins: 480,
      status: 'NORMAL',
      updated_at: new Date()
    },
    {
      id: 'CCU-RAN-02',
      phc_id: 'PHC-RAN-02',
      model_name: 'Godrej GVR 50 Lite ILR',
      min_temp_celsius: 2.0,
      max_temp_celsius: 8.0,
      current_temp_celsius: 3.8,
      ambient_temp_celsius: 31.0,
      power_status: 'MAINS_ACTIVE',
      battery_runtime_mins: 520,
      status: 'NORMAL',
      updated_at: new Date()
    },
    {
      id: 'CCU-RAN-03',
      phc_id: 'PHC-RAN-03',
      model_name: 'Haier HBD-116 Deep Freezer / ILR',
      min_temp_celsius: 2.0,
      max_temp_celsius: 8.0,
      current_temp_celsius: 7.9,
      ambient_temp_celsius: 34.0,
      power_status: 'BATTERY_BACKUP',
      battery_runtime_mins: 45,
      status: 'WARNING',
      updated_at: new Date()
    },
    {
      id: 'CCU-PAT-01',
      phc_id: 'PHC-PAT-01',
      model_name: 'B Medical Systems TCW 40 SDD',
      min_temp_celsius: 2.0,
      max_temp_celsius: 8.0,
      current_temp_celsius: 4.5,
      ambient_temp_celsius: 32.0,
      power_status: 'MAINS_ACTIVE',
      battery_runtime_mins: 600,
      status: 'NORMAL',
      updated_at: new Date()
    }
  ];

  // 7. Dynamic Beds Matrix
  store.beds = [
    { id: 'BED-RAN-01-GEN', phc_id: 'PHC-RAN-01', bed_type: 'GENERAL', total_beds: 30, occupied_beds: 18, updated_at: new Date() },
    { id: 'BED-RAN-01-OXY', phc_id: 'PHC-RAN-01', bed_type: 'OXYGEN', total_beds: 15, occupied_beds: 7, updated_at: new Date() },
    { id: 'BED-RAN-01-ICU', phc_id: 'PHC-RAN-01', bed_type: 'ICU', total_beds: 5, occupied_beds: 2, updated_at: new Date() },
    { id: 'BED-RAN-01-PED', phc_id: 'PHC-RAN-01', bed_type: 'PEDIATRIC', total_beds: 10, occupied_beds: 4, updated_at: new Date() },
    { id: 'BED-RAN-03-GEN', phc_id: 'PHC-RAN-03', bed_type: 'GENERAL', total_beds: 25, occupied_beds: 24, updated_at: new Date() },
    { id: 'BED-RAN-03-OXY', phc_id: 'PHC-RAN-03', bed_type: 'OXYGEN', total_beds: 10, occupied_beds: 10, updated_at: new Date() },
    { id: 'BED-RAN-03-ICU', phc_id: 'PHC-RAN-03', bed_type: 'ICU', total_beds: 5, occupied_beds: 5, updated_at: new Date() }
  ];

  // 8. Medical Staff Roster
  store.staff_attendance = [
    { id: 'STF-01', phc_id: 'PHC-RAN-01', staff_name: 'Dr. Priya Sharma', role: 'DOCTOR', shift: 'MORNING', status: 'ON_DUTY', check_in_time: new Date() },
    { id: 'STF-02', phc_id: 'PHC-RAN-01', staff_name: 'Anjali Verma', role: 'NURSE', shift: 'MORNING', status: 'ON_DUTY', check_in_time: new Date() },
    { id: 'STF-03', phc_id: 'PHC-RAN-03', staff_name: 'Dr. Rajesh Oraon', role: 'DOCTOR', shift: 'MORNING', status: 'ON_DUTY', check_in_time: new Date() }
  ];

  // 9. Users across roles
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  store.users = [
    { id: 'USR-ADMIN', name: 'National Director AI Ops', email: 'admin@arogyagrid.gov.in', password_hash: passwordHash, role: 'ADMIN' },
    { id: 'USR-DO-RAN', name: 'District Health Officer (Ranchi)', email: 'district.ranchi@arogyagrid.gov.in', password_hash: passwordHash, role: 'DISTRICT_OFFICER', district_id: 'DIST-JH-01' },
    { id: 'USR-DOC-RAN01', name: 'Dr. Priya Sharma (Medical Officer)', email: 'doctor.ranchi@arogyagrid.gov.in', password_hash: passwordHash, role: 'DOCTOR', district_id: 'DIST-JH-01', phc_id: 'PHC-RAN-01' },
    { id: 'USR-PHC-RAN01', name: 'Sadar PHC Frontline Staff', email: 'phc.ranchi01@arogyagrid.gov.in', password_hash: passwordHash, role: 'PHC_STAFF', district_id: 'DIST-JH-01', phc_id: 'PHC-RAN-01' }
  ];

  console.log('[Seed] Database seeded with multi-state districts, facilities, NLEM/WHO drugs, cold-chain units, and batches.');
}

module.exports = { seedDatabase };
