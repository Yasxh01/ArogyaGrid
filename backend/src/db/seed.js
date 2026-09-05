const bcrypt = require('bcryptjs');
const db = require('../config/db');

async function seedDatabase() {
  const store = db.memoryStore;
  if (store.districts.length > 0) return;

  console.log('[Seed] Seeding realistic public healthcare baseline data for India...');

  // 1. Districts
  store.districts = [
    { id: 'DIST-JH-01', name: 'Ranchi', state: 'Jharkhand', latitude: 23.3441, longitude: 85.3096 },
    { id: 'DIST-JH-02', name: 'Dhanbad', state: 'Jharkhand', latitude: 23.7957, longitude: 86.4304 },
    { id: 'DIST-BR-01', name: 'Patna', state: 'Bihar', latitude: 25.5941, longitude: 85.1376 },
    { id: 'DIST-BR-02', name: 'Gaya', state: 'Bihar', latitude: 24.7955, longitude: 85.0002 },
    { id: 'DIST-OD-01', name: 'Khordha', state: 'Odisha', latitude: 20.1812, longitude: 85.6174 }
  ];

  // 2. PHCs
  store.phcs = [
    { id: 'PHC-RAN-01', name: 'Ranchi Sadar PHC', district_id: 'DIST-JH-01', latitude: 23.3500, longitude: 85.3200, capacity: 50, status: 'HEALTHY', population_served: 18000 },
    { id: 'PHC-RAN-02', name: 'Kanke Rural PHC', district_id: 'DIST-JH-01', latitude: 23.4350, longitude: 85.3200, capacity: 30, status: 'HEALTHY', population_served: 12000 },
    { id: 'PHC-RAN-03', name: 'Namkum PHC', district_id: 'DIST-JH-01', latitude: 23.3200, longitude: 85.3800, capacity: 40, status: 'CRITICAL', population_served: 15000 },
    { id: 'PHC-DHN-01', name: 'Jharia Coalfield PHC', district_id: 'DIST-JH-02', latitude: 23.7400, longitude: 86.4100, capacity: 45, status: 'WARNING', population_served: 22000 },
    { id: 'PHC-PAT-01', name: 'Patna City PHC', district_id: 'DIST-BR-01', latitude: 25.6000, longitude: 85.1800, capacity: 60, status: 'HEALTHY', population_served: 28000 },
    { id: 'PHC-GAY-01', name: 'Bodh Gaya PHC', district_id: 'DIST-BR-02', latitude: 24.6950, longitude: 84.9910, capacity: 35, status: 'HEALTHY', population_served: 14000 },
    { id: 'PHC-KHO-01', name: 'Bhubaneswar Urban PHC', district_id: 'DIST-OD-01', latitude: 20.2961, longitude: 85.8245, capacity: 55, status: 'HEALTHY', population_served: 25000 }
  ];

  // 3. Medicines Catalog
  store.medicines = [
    { id: 'MED-001', name: 'Paracetamol 500mg Tablets', category: 'Antipyretic', unit: 'strips', minimum_stock: 150, daily_base_consumption: 35.0 },
    { id: 'MED-002', name: 'Amoxicillin 250mg Capsules', category: 'Antibiotic', unit: 'strips', minimum_stock: 100, daily_base_consumption: 25.0 },
    { id: 'MED-003', name: 'Oral Rehydration Salts (ORS)', category: 'Essential', unit: 'sachets', minimum_stock: 200, daily_base_consumption: 40.0 },
    { id: 'MED-004', name: 'Insulin Glargine 100IU/ml', category: 'Cold-Chain / Diabetes', unit: 'vials', minimum_stock: 30, daily_base_consumption: 5.0 },
    { id: 'MED-005', name: 'Anti-Rabies Vaccine (ARV)', category: 'Emergency / Cold-Chain', unit: 'vials', minimum_stock: 25, daily_base_consumption: 4.0 }
  ];

  // 4. Initial Stock
  store.stock = [
    { id: 'STK-001', phc_id: 'PHC-RAN-01', medicine_id: 'MED-001', quantity: 650, daily_consumption: 35.0, updated_at: new Date() },
    { id: 'STK-002', phc_id: 'PHC-RAN-01', medicine_id: 'MED-002', quantity: 400, daily_consumption: 25.0, updated_at: new Date() },
    { id: 'STK-003', phc_id: 'PHC-RAN-02', medicine_id: 'MED-001', quantity: 720, daily_consumption: 20.0, updated_at: new Date() },
    { id: 'STK-004', phc_id: 'PHC-RAN-03', medicine_id: 'MED-001', quantity: 35, daily_consumption: 40.0, updated_at: new Date() },
    { id: 'STK-005', phc_id: 'PHC-RAN-03', medicine_id: 'MED-004', quantity: 3, daily_consumption: 6.0, updated_at: new Date() },
    { id: 'STK-006', phc_id: 'PHC-PAT-01', medicine_id: 'MED-001', quantity: 900, daily_consumption: 45.0, updated_at: new Date() }
  ];

  // 5. Dynamic Beds Matrix
  store.beds = [
    { id: 'BED-RAN-01-GEN', phc_id: 'PHC-RAN-01', bed_type: 'GENERAL', total_beds: 30, occupied_beds: 18, updated_at: new Date() },
    { id: 'BED-RAN-01-OXY', phc_id: 'PHC-RAN-01', bed_type: 'OXYGEN', total_beds: 15, occupied_beds: 7, updated_at: new Date() },
    { id: 'BED-RAN-01-ICU', phc_id: 'PHC-RAN-01', bed_type: 'ICU', total_beds: 5, occupied_beds: 2, updated_at: new Date() },
    { id: 'BED-RAN-01-PED', phc_id: 'PHC-RAN-01', bed_type: 'PEDIATRIC', total_beds: 10, occupied_beds: 4, updated_at: new Date() },
    { id: 'BED-RAN-03-GEN', phc_id: 'PHC-RAN-03', bed_type: 'GENERAL', total_beds: 25, occupied_beds: 24, updated_at: new Date() },
    { id: 'BED-RAN-03-OXY', phc_id: 'PHC-RAN-03', bed_type: 'OXYGEN', total_beds: 10, occupied_beds: 10, updated_at: new Date() },
    { id: 'BED-RAN-03-ICU', phc_id: 'PHC-RAN-03', bed_type: 'ICU', total_beds: 5, occupied_beds: 5, updated_at: new Date() }
  ];

  // 6. Medical Staff Roster
  store.staff_attendance = [
    { id: 'STF-01', phc_id: 'PHC-RAN-01', staff_name: 'Dr. Priya Sharma', role: 'DOCTOR', shift: 'MORNING', status: 'ON_DUTY', check_in_time: new Date() },
    { id: 'STF-02', phc_id: 'PHC-RAN-01', staff_name: 'Anjali Verma', role: 'NURSE', shift: 'MORNING', status: 'ON_DUTY', check_in_time: new Date() },
    { id: 'STF-03', phc_id: 'PHC-RAN-03', staff_name: 'Dr. Rajesh Oraon', role: 'DOCTOR', shift: 'MORNING', status: 'ON_DUTY', check_in_time: new Date() }
  ];

  // 7. Users with 4 distinct roles
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  store.users = [
    { id: 'USR-ADMIN', name: 'National Director AI Ops', email: 'admin@arogyagrid.gov.in', password_hash: passwordHash, role: 'ADMIN' },
    { id: 'USR-DO-RAN', name: 'District Health Officer (Ranchi)', email: 'district.ranchi@arogyagrid.gov.in', password_hash: passwordHash, role: 'DISTRICT_OFFICER', district_id: 'DIST-JH-01' },
    { id: 'USR-DOC-RAN01', name: 'Dr. Priya Sharma (Medical Officer)', email: 'doctor.ranchi@arogyagrid.gov.in', password_hash: passwordHash, role: 'DOCTOR', district_id: 'DIST-JH-01', phc_id: 'PHC-RAN-01' },
    { id: 'USR-PHC-RAN01', name: 'Sadar PHC Frontline Staff', email: 'phc.ranchi01@arogyagrid.gov.in', password_hash: passwordHash, role: 'PHC_STAFF', district_id: 'DIST-JH-01', phc_id: 'PHC-RAN-01' }
  ];

  console.log('[Seed] Database seeded with Admin, District Officer, Doctor, and PHC Staff users.');
}

module.exports = { seedDatabase };
