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

  // 2. Facilities across 4 Tiers (DH, CHC, PHC, SUB_CENTRE_HWC) for each district
  store.phcs = [
    // --- Ranchi (Jharkhand) ---
    { id: 'DH-RAN-01', name: 'Ranchi District Civil Hospital', facility_type: 'DISTRICT_HOSPITAL', district_id: 'DIST-JH-01', latitude: 23.3600, longitude: 85.3250, capacity: 250, status: 'HEALTHY', population_served: 250000 },
    { id: 'PHC-RAN-01', name: 'Ranchi Sadar PHC', facility_type: 'PHC', district_id: 'DIST-JH-01', latitude: 23.3500, longitude: 85.3200, capacity: 50, status: 'HEALTHY', population_served: 18000 },
    { id: 'PHC-RAN-02', name: 'Kanke Rural CHC', facility_type: 'CHC', district_id: 'DIST-JH-01', latitude: 23.4350, longitude: 85.3200, capacity: 60, status: 'HEALTHY', population_served: 35000 },
    { id: 'PHC-RAN-03', name: 'Namkum PHC', facility_type: 'PHC', district_id: 'DIST-JH-01', latitude: 23.3200, longitude: 85.3800, capacity: 40, status: 'CRITICAL', population_served: 15000 },
    { id: 'HWC-RAN-01', name: 'Bundu Ayushman Arogya Mandir', facility_type: 'SUB_CENTRE_HWC', district_id: 'DIST-JH-01', latitude: 23.1800, longitude: 85.5800, capacity: 10, status: 'HEALTHY', population_served: 6000 },

    // --- Dhanbad (Jharkhand) ---
    { id: 'DH-DHN-01', name: 'Dhanbad District Hospital', facility_type: 'DISTRICT_HOSPITAL', district_id: 'DIST-JH-02', latitude: 23.8012, longitude: 86.4278, capacity: 200, status: 'HEALTHY', population_served: 220000 },
    { id: 'PHC-DHN-01', name: 'Jharia Coalfield CHC', facility_type: 'CHC', district_id: 'DIST-JH-02', latitude: 23.7400, longitude: 86.4100, capacity: 55, status: 'WARNING', population_served: 40000 },
    { id: 'PHC-DHN-02', name: 'Baghmara Rural CHC', facility_type: 'CHC', district_id: 'DIST-JH-02', latitude: 23.7850, longitude: 86.2050, capacity: 50, status: 'HEALTHY', population_served: 32000 },
    { id: 'PHC-DHN-03', name: 'Govindpur Primary Health Centre', facility_type: 'PHC', district_id: 'DIST-JH-02', latitude: 23.8340, longitude: 86.5180, capacity: 35, status: 'HEALTHY', population_served: 18000 },
    { id: 'HWC-DHN-01', name: 'Nirsa Ayushman Arogya Mandir', facility_type: 'SUB_CENTRE_HWC', district_id: 'DIST-JH-02', latitude: 23.7850, longitude: 86.7100, capacity: 15, status: 'HEALTHY', population_served: 8000 },

    // --- Patna (Bihar) ---
    { id: 'DH-PAT-01', name: 'Nalanda Medical College & Hospital', facility_type: 'DISTRICT_HOSPITAL', district_id: 'DIST-BR-01', latitude: 25.6025, longitude: 85.1842, capacity: 280, status: 'HEALTHY', population_served: 350000 },
    { id: 'PHC-PAT-01', name: 'Patna City Sub-Divisional Hospital', facility_type: 'CHC', district_id: 'DIST-BR-01', latitude: 25.6000, longitude: 85.1800, capacity: 80, status: 'HEALTHY', population_served: 60000 },
    { id: 'PHC-PAT-02', name: 'Danapur Sub-Divisional Hospital', facility_type: 'CHC', district_id: 'DIST-BR-01', latitude: 25.6300, longitude: 85.0400, capacity: 70, status: 'HEALTHY', population_served: 55000 },
    { id: 'PHC-PAT-03', name: 'Phulwari Sharif Primary Health Centre', facility_type: 'PHC', district_id: 'DIST-BR-01', latitude: 25.5780, longitude: 85.0780, capacity: 40, status: 'WARNING', population_served: 25000 },
    { id: 'HWC-PAT-01', name: 'Bakhtiyarpur Ayushman Arogya Mandir', facility_type: 'SUB_CENTRE_HWC', district_id: 'DIST-BR-01', latitude: 25.4560, longitude: 85.5320, capacity: 15, status: 'HEALTHY', population_served: 9000 },

    // --- Gaya (Bihar) ---
    { id: 'DH-GAY-01', name: 'Jay Prakash Narayan District Hospital', facility_type: 'DISTRICT_HOSPITAL', district_id: 'DIST-BR-02', latitude: 24.7915, longitude: 84.9985, capacity: 180, status: 'HEALTHY', population_served: 180000 },
    { id: 'PHC-GAY-01', name: 'Bodh Gaya PHC', facility_type: 'PHC', district_id: 'DIST-BR-02', latitude: 24.6950, longitude: 84.9910, capacity: 35, status: 'HEALTHY', population_served: 14000 },
    { id: 'PHC-GAY-02', name: 'Sherghati Sub-Divisional Hospital', facility_type: 'CHC', district_id: 'DIST-BR-02', latitude: 24.5710, longitude: 84.7920, capacity: 60, status: 'WARNING', population_served: 42000 },
    { id: 'PHC-GAY-03', name: 'Tekari Community Health Centre', facility_type: 'CHC', district_id: 'DIST-BR-02', latitude: 24.9380, longitude: 84.8320, capacity: 45, status: 'HEALTHY', population_served: 30000 },
    { id: 'HWC-GAY-01', name: 'Manpur Ayushman Arogya Mandir', facility_type: 'SUB_CENTRE_HWC', district_id: 'DIST-BR-02', latitude: 24.7980, longitude: 85.0340, capacity: 15, status: 'HEALTHY', population_served: 8500 },

    // --- Khordha (Odisha) ---
    { id: 'DH-KHO-01', name: 'Capital Hospital & District Civil Hospital', facility_type: 'DISTRICT_HOSPITAL', district_id: 'DIST-OD-01', latitude: 20.2645, longitude: 85.8285, capacity: 260, status: 'HEALTHY', population_served: 300000 },
    { id: 'PHC-KHO-01', name: 'Bhubaneswar Urban CHC', facility_type: 'CHC', district_id: 'DIST-OD-01', latitude: 20.2961, longitude: 85.8245, capacity: 70, status: 'HEALTHY', population_served: 45000 },
    { id: 'PHC-KHO-02', name: 'Jatni Community Health Centre', facility_type: 'CHC', district_id: 'DIST-OD-01', latitude: 20.1600, longitude: 85.7000, capacity: 50, status: 'WARNING', population_served: 35000 },
    { id: 'PHC-KHO-03', name: 'Balianta Primary Health Centre', facility_type: 'PHC', district_id: 'DIST-OD-01', latitude: 20.2580, longitude: 85.9080, capacity: 35, status: 'HEALTHY', population_served: 19000 },
    { id: 'HWC-KHO-01', name: 'Khordha Sadar Ayushman Arogya Mandir', facility_type: 'SUB_CENTRE_HWC', district_id: 'DIST-OD-01', latitude: 20.1800, longitude: 85.6200, capacity: 15, status: 'HEALTHY', population_served: 7500 },

    // --- Pune (Maharashtra) ---
    { id: 'DH-PUN-01', name: 'Aundh District Civil Hospital', facility_type: 'DISTRICT_HOSPITAL', district_id: 'DIST-MH-01', latitude: 18.5602, longitude: 73.8077, capacity: 240, status: 'HEALTHY', population_served: 280000 },
    { id: 'PHC-PUN-01', name: 'Haveli Rural CHC', facility_type: 'CHC', district_id: 'DIST-MH-01', latitude: 18.5100, longitude: 73.8900, capacity: 50, status: 'WARNING', population_served: 32000 },
    { id: 'PHC-PUN-02', name: 'Baramati Sub-District Hospital', facility_type: 'CHC', district_id: 'DIST-MH-01', latitude: 18.1519, longitude: 74.5770, capacity: 75, status: 'HEALTHY', population_served: 55000 },
    { id: 'PHC-PUN-03', name: 'Shirur Primary Health Centre', facility_type: 'PHC', district_id: 'DIST-MH-01', latitude: 18.8286, longitude: 74.3792, capacity: 40, status: 'HEALTHY', population_served: 22000 },
    { id: 'HWC-PUN-01', name: 'Daund Ayushman Arogya Mandir', facility_type: 'SUB_CENTRE_HWC', district_id: 'DIST-MH-01', latitude: 18.4658, longitude: 74.5824, capacity: 15, status: 'HEALTHY', population_served: 9500 },

    // --- Bengaluru Urban (Karnataka) ---
    { id: 'DH-BLR-01', name: 'KC General District Hospital', facility_type: 'DISTRICT_HOSPITAL', district_id: 'DIST-KA-01', latitude: 13.0033, longitude: 77.5684, capacity: 260, status: 'HEALTHY', population_served: 320000 },
    { id: 'PHC-BLR-01', name: 'Anekal Community Health Centre', facility_type: 'CHC', district_id: 'DIST-KA-01', latitude: 12.7100, longitude: 77.6900, capacity: 60, status: 'WARNING', population_served: 38000 },
    { id: 'PHC-BLR-02', name: 'Yelahanka General Hospital', facility_type: 'CHC', district_id: 'DIST-KA-01', latitude: 13.1007, longitude: 77.5963, capacity: 75, status: 'HEALTHY', population_served: 48000 },
    { id: 'PHC-BLR-03', name: 'K.R. Puram Primary Health Centre', facility_type: 'PHC', district_id: 'DIST-KA-01', latitude: 13.0075, longitude: 77.6959, capacity: 45, status: 'HEALTHY', population_served: 26000 },
    { id: 'HWC-BLR-01', name: 'Nelamangala Ayushman Arogya Mandir', facility_type: 'SUB_CENTRE_HWC', district_id: 'DIST-KA-01', latitude: 13.0970, longitude: 77.3917, capacity: 15, status: 'HEALTHY', population_served: 9000 }
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

  // 4. Initial Stock across ALL facilities in ALL districts
  const stockSeed = [];
  let stkIdCounter = 1;

  // Specific preset overrides for realistic demonstrations & test cases
  const specificOverrides = {
    'PHC-RAN-01': { 'MED-001': 650, 'MED-002': 400, 'MED-003': 500, 'MED-004': 45, 'MED-005': 38, 'MED-006': 180, 'MED-007': 210, 'MED-008': 60 },
    'PHC-RAN-02': { 'MED-001': 720, 'MED-002': 450, 'MED-003': 600, 'MED-004': 50, 'MED-005': 40, 'MED-006': 150, 'MED-007': 220, 'MED-008': 75 },
    'PHC-RAN-03': { 'MED-001': 35,  'MED-002': 28,  'MED-003': 20,  'MED-004': 3,  'MED-005': 4,  'MED-006': 12,  'MED-007': 18,  'MED-008': 5 }, // Critical
    'DH-RAN-01':  { 'MED-001': 3500, 'MED-002': 2200, 'MED-003': 2800, 'MED-004': 320, 'MED-005': 280, 'MED-006': 950, 'MED-007': 1100, 'MED-008': 420 },
    'PHC-PUN-01': { 'MED-001': 450, 'MED-002': 220, 'MED-003': 310, 'MED-004': 18, 'MED-005': 12, 'MED-006': 140, 'MED-007': 190, 'MED-008': 65 }, // Pune Haveli: Insulin & ARV critical
    'DH-PUN-01':  { 'MED-001': 4200, 'MED-002': 2600, 'MED-003': 3100, 'MED-004': 380, 'MED-005': 310, 'MED-006': 1200, 'MED-007': 1400, 'MED-008': 500 },
    'PHC-BLR-01': { 'MED-001': 500, 'MED-002': 310, 'MED-003': 420, 'MED-004': 15, 'MED-005': 10, 'MED-006': 160, 'MED-007': 230, 'MED-008': 70 }, // BLR Anekal: low cold chain
    'DH-BLR-01':  { 'MED-001': 4800, 'MED-002': 3100, 'MED-003': 3600, 'MED-004': 410, 'MED-005': 340, 'MED-006': 1400, 'MED-007': 1600, 'MED-008': 550 },
    'PHC-PAT-01': { 'MED-001': 900, 'MED-002': 550, 'MED-003': 700, 'MED-004': 55, 'MED-005': 48, 'MED-006': 220, 'MED-007': 310, 'MED-008': 90 },
    'PHC-KHO-01': { 'MED-001': 820, 'MED-002': 490, 'MED-003': 640, 'MED-004': 50, 'MED-005': 60, 'MED-006': 190, 'MED-007': 280, 'MED-008': 85 }
  };

  store.phcs.forEach(phc => {
    store.medicines.forEach(med => {
      let qty = 250;
      let daily = med.daily_base_consumption;

      if (specificOverrides[phc.id] && specificOverrides[phc.id][med.id] !== undefined) {
        qty = specificOverrides[phc.id][med.id];
      } else if (phc.facility_type === 'DISTRICT_HOSPITAL') {
        qty = med.minimum_stock * 8;
        daily = med.daily_base_consumption * 4;
      } else if (phc.facility_type === 'SUB_CENTRE_HWC') {
        qty = Math.round(med.minimum_stock * 0.6);
        daily = Math.max(1, Math.round(med.daily_base_consumption * 0.25));
      } else if (phc.status === 'WARNING') {
        qty = Math.round(med.minimum_stock * 0.7);
      } else {
        qty = Math.round(med.minimum_stock * 2.2);
      }

      stockSeed.push({
        id: `STK-${String(stkIdCounter++).padStart(4, '0')}`,
        phc_id: phc.id,
        medicine_id: med.id,
        quantity: qty,
        daily_consumption: daily,
        updated_at: new Date()
      });
    });
  });
  store.stock = stockSeed;

  // 5. Batch-Level FEFO Inventory
  const now = new Date();
  const expFar = new Date(now.getFullYear() + 2, now.getMonth(), 1);
  const expNear = new Date(now.getFullYear(), now.getMonth() + 2, 1);
  const expMed = new Date(now.getFullYear() + 1, now.getMonth() + 4, 1);

  store.batches = [
    { id: 'BAT-001', phc_id: 'PHC-RAN-01', medicine_id: 'MED-001', batch_number: 'PCM-2024-B1', quantity: 400, mfg_date: '2024-01-15', expiry_date: expFar.toISOString().split('T')[0], challan_ref: 'CH-JSMSCL-8841' },
    { id: 'BAT-002', phc_id: 'PHC-RAN-01', medicine_id: 'MED-001', batch_number: 'PCM-2023-A9', quantity: 250, mfg_date: '2023-08-10', expiry_date: expNear.toISOString().split('T')[0], challan_ref: 'CH-JSMSCL-6520' },
    { id: 'BAT-003', phc_id: 'PHC-RAN-01', medicine_id: 'MED-005', batch_number: 'ARV-2024-C2', quantity: 38, mfg_date: '2024-03-01', expiry_date: expFar.toISOString().split('T')[0], challan_ref: 'CH-JSMSCL-9102' },
    { id: 'BAT-004', phc_id: 'PHC-RAN-03', medicine_id: 'MED-001', batch_number: 'PCM-2023-A4', quantity: 35, mfg_date: '2023-05-15', expiry_date: expNear.toISOString().split('T')[0], challan_ref: 'CH-JSMSCL-5211' },
    { id: 'BAT-005', phc_id: 'PHC-PUN-01', medicine_id: 'MED-001', batch_number: 'PCM-MH-2024-01', quantity: 300, mfg_date: '2024-02-10', expiry_date: expFar.toISOString().split('T')[0], challan_ref: 'CH-MH-7890' },
    { id: 'BAT-006', phc_id: 'PHC-PUN-01', medicine_id: 'MED-004', batch_number: 'INS-MH-2023-99', quantity: 18, mfg_date: '2023-09-01', expiry_date: expNear.toISOString().split('T')[0], challan_ref: 'CH-MH-4421' },
    { id: 'BAT-007', phc_id: 'PHC-BLR-01', medicine_id: 'MED-001', batch_number: 'PCM-KA-2024-55', quantity: 350, mfg_date: '2024-01-20', expiry_date: expFar.toISOString().split('T')[0], challan_ref: 'CH-KA-1102' },
    { id: 'BAT-008', phc_id: 'PHC-PAT-01', medicine_id: 'MED-001', batch_number: 'PCM-BR-2024-12', quantity: 600, mfg_date: '2024-02-01', expiry_date: expMed.toISOString().split('T')[0], challan_ref: 'CH-BR-9901' },
    { id: 'BAT-009', phc_id: 'PHC-KHO-01', medicine_id: 'MED-005', batch_number: 'ARV-OD-2024-08', quantity: 60, mfg_date: '2024-03-12', expiry_date: expFar.toISOString().split('T')[0], challan_ref: 'CH-OD-5512' }
  ];

  // 6. Industrial Cold-Chain IoT Units (WHO PQS Standard 2°C–8°C Ice-Lined Refrigerators across ALL Districts)
  store.cold_chain_units = [
    // --- Ranchi (Jharkhand) ---
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

    // --- Dhanbad (Jharkhand) ---
    {
      id: 'CCU-DHN-01',
      phc_id: 'PHC-DHN-01',
      model_name: 'Vestfrost VLS 024 GreenLine ILR',
      min_temp_celsius: 2.0,
      max_temp_celsius: 8.0,
      current_temp_celsius: 4.1,
      ambient_temp_celsius: 30.5,
      power_status: 'MAINS_ACTIVE',
      battery_runtime_mins: 460,
      status: 'NORMAL',
      updated_at: new Date()
    },
    {
      id: 'CCU-DHN-02',
      phc_id: 'DH-DHN-01',
      model_name: 'Godrej GVR 50 Lite ILR',
      min_temp_celsius: 2.0,
      max_temp_celsius: 8.0,
      current_temp_celsius: 3.9,
      ambient_temp_celsius: 29.8,
      power_status: 'MAINS_ACTIVE',
      battery_runtime_mins: 540,
      status: 'NORMAL',
      updated_at: new Date()
    },

    // --- Patna (Bihar) ---
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
    },
    {
      id: 'CCU-PAT-02',
      phc_id: 'DH-PAT-01',
      model_name: 'Vestfrost VLS 024 GreenLine ILR',
      min_temp_celsius: 2.0,
      max_temp_celsius: 8.0,
      current_temp_celsius: 3.7,
      ambient_temp_celsius: 30.0,
      power_status: 'MAINS_ACTIVE',
      battery_runtime_mins: 580,
      status: 'NORMAL',
      updated_at: new Date()
    },

    // --- Gaya (Bihar) ---
    {
      id: 'CCU-GAY-01',
      phc_id: 'PHC-GAY-01',
      model_name: 'Godrej GVR 50 Lite ILR',
      min_temp_celsius: 2.0,
      max_temp_celsius: 8.0,
      current_temp_celsius: 4.6,
      ambient_temp_celsius: 33.0,
      power_status: 'MAINS_ACTIVE',
      battery_runtime_mins: 490,
      status: 'NORMAL',
      updated_at: new Date()
    },
    {
      id: 'CCU-GAY-02',
      phc_id: 'DH-GAY-01',
      model_name: 'Haier HBD-116 Deep Freezer / ILR',
      min_temp_celsius: 2.0,
      max_temp_celsius: 8.0,
      current_temp_celsius: 3.5,
      ambient_temp_celsius: 31.5,
      power_status: 'MAINS_ACTIVE',
      battery_runtime_mins: 510,
      status: 'NORMAL',
      updated_at: new Date()
    },

    // --- Khordha (Odisha) ---
    {
      id: 'CCU-KHO-01',
      phc_id: 'PHC-KHO-01',
      model_name: 'Vestfrost VLS 024 GreenLine ILR',
      min_temp_celsius: 2.0,
      max_temp_celsius: 8.0,
      current_temp_celsius: 4.0,
      ambient_temp_celsius: 31.0,
      power_status: 'MAINS_ACTIVE',
      battery_runtime_mins: 500,
      status: 'NORMAL',
      updated_at: new Date()
    },
    {
      id: 'CCU-KHO-02',
      phc_id: 'DH-KHO-01',
      model_name: 'B Medical Systems TCW 40 SDD',
      min_temp_celsius: 2.0,
      max_temp_celsius: 8.0,
      current_temp_celsius: 3.6,
      ambient_temp_celsius: 29.0,
      power_status: 'MAINS_ACTIVE',
      battery_runtime_mins: 620,
      status: 'NORMAL',
      updated_at: new Date()
    },

    // --- Pune (Maharashtra) ---
    {
      id: 'CCU-PUN-01',
      phc_id: 'PHC-PUN-01',
      model_name: 'Godrej GVR 50 Lite ILR',
      min_temp_celsius: 2.0,
      max_temp_celsius: 8.0,
      current_temp_celsius: 4.3,
      ambient_temp_celsius: 28.5,
      power_status: 'MAINS_ACTIVE',
      battery_runtime_mins: 520,
      status: 'NORMAL',
      updated_at: new Date()
    },
    {
      id: 'CCU-PUN-02',
      phc_id: 'DH-PUN-01',
      model_name: 'Vestfrost VLS 024 GreenLine ILR',
      min_temp_celsius: 2.0,
      max_temp_celsius: 8.0,
      current_temp_celsius: 3.8,
      ambient_temp_celsius: 27.5,
      power_status: 'MAINS_ACTIVE',
      battery_runtime_mins: 560,
      status: 'NORMAL',
      updated_at: new Date()
    },
    {
      id: 'CCU-PUN-03',
      phc_id: 'PHC-PUN-02',
      model_name: 'Haier HBD-116 Deep Freezer / ILR',
      min_temp_celsius: 2.0,
      max_temp_celsius: 8.0,
      current_temp_celsius: 4.8,
      ambient_temp_celsius: 31.0,
      power_status: 'MAINS_ACTIVE',
      battery_runtime_mins: 440,
      status: 'NORMAL',
      updated_at: new Date()
    },

    // --- Bengaluru Urban (Karnataka) ---
    {
      id: 'CCU-BLR-01',
      phc_id: 'PHC-BLR-01',
      model_name: 'Vestfrost VLS 024 GreenLine ILR',
      min_temp_celsius: 2.0,
      max_temp_celsius: 8.0,
      current_temp_celsius: 4.1,
      ambient_temp_celsius: 26.5,
      power_status: 'MAINS_ACTIVE',
      battery_runtime_mins: 510,
      status: 'NORMAL',
      updated_at: new Date()
    },
    {
      id: 'CCU-BLR-02',
      phc_id: 'DH-BLR-01',
      model_name: 'B Medical Systems TCW 40 SDD',
      min_temp_celsius: 2.0,
      max_temp_celsius: 8.0,
      current_temp_celsius: 3.5,
      ambient_temp_celsius: 25.5,
      power_status: 'MAINS_ACTIVE',
      battery_runtime_mins: 640,
      status: 'NORMAL',
      updated_at: new Date()
    },
    {
      id: 'CCU-BLR-03',
      phc_id: 'PHC-BLR-02',
      model_name: 'Godrej GVR 50 Lite ILR',
      min_temp_celsius: 2.0,
      max_temp_celsius: 8.0,
      current_temp_celsius: 4.4,
      ambient_temp_celsius: 27.0,
      power_status: 'MAINS_ACTIVE',
      battery_runtime_mins: 490,
      status: 'NORMAL',
      updated_at: new Date()
    }
  ];

  // 7. Dynamic Beds Matrix across ALL facilities in ALL districts
  const bedSeed = [];
  store.phcs.forEach(phc => {
    let genTotal = 25, genOcc = 15;
    let oxyTotal = 10, oxyOcc = 5;
    let icuTotal = 4,  icuOcc = 2;
    let pedTotal = 6,  pedOcc = 2;

    if (phc.facility_type === 'DISTRICT_HOSPITAL') {
      genTotal = 140; genOcc = 100;
      oxyTotal = 45;  oxyOcc = 30;
      icuTotal = 20;  icuOcc = 15;
      pedTotal = 25;  pedOcc = 16;
    } else if (phc.facility_type === 'CHC') {
      genTotal = 35;  genOcc = phc.id === 'PHC-PUN-01' ? 24 : 22;
      oxyTotal = 12;  oxyOcc = phc.id === 'PHC-PUN-01' ? 8 : 7;
      icuTotal = 5;   icuOcc = 2;
      pedTotal = 8;   pedOcc = 4;
    } else if (phc.facility_type === 'SUB_CENTRE_HWC') {
      genTotal = 8;   genOcc = 4;
      oxyTotal = 2;   oxyOcc = 1;
      icuTotal = 0;   icuOcc = 0;
      pedTotal = 2;   pedOcc = 1;
    }

    // Specific preset for Namkum PHC crisis
    if (phc.id === 'PHC-RAN-03') {
      genTotal = 25; genOcc = 24;
      oxyTotal = 10; oxyOcc = 10;
      icuTotal = 5;  icuOcc = 5;
      pedTotal = 5;  pedOcc = 4;
    }

    bedSeed.push(
      { id: `BED-${phc.id}-GEN`, phc_id: phc.id, bed_type: 'GENERAL', total_beds: genTotal, occupied_beds: genOcc, updated_at: new Date() },
      { id: `BED-${phc.id}-OXY`, phc_id: phc.id, bed_type: 'OXYGEN', total_beds: oxyTotal, occupied_beds: oxyOcc, updated_at: new Date() }
    );
    if (icuTotal > 0) {
      bedSeed.push({ id: `BED-${phc.id}-ICU`, phc_id: phc.id, bed_type: 'ICU', total_beds: icuTotal, occupied_beds: icuOcc, updated_at: new Date() });
    }
    if (pedTotal > 0) {
      bedSeed.push({ id: `BED-${phc.id}-PED`, phc_id: phc.id, bed_type: 'PEDIATRIC', total_beds: pedTotal, occupied_beds: pedOcc, updated_at: new Date() });
    }
  });
  store.beds = bedSeed;

  // 8. Medical Staff Roster across ALL facilities
  const staffSeed = [
    { id: 'STF-01', phc_id: 'PHC-RAN-01', staff_name: 'Dr. Priya Sharma', role: 'DOCTOR', shift: 'MORNING', status: 'ON_DUTY', check_in_time: new Date() },
    { id: 'STF-02', phc_id: 'PHC-RAN-01', staff_name: 'Anjali Verma', role: 'NURSE', shift: 'MORNING', status: 'ON_DUTY', check_in_time: new Date() },
    { id: 'STF-03', phc_id: 'PHC-RAN-03', staff_name: 'Dr. Rajesh Oraon', role: 'DOCTOR', shift: 'MORNING', status: 'ON_DUTY', check_in_time: new Date() },
    // Pune
    { id: 'STF-04', phc_id: 'PHC-PUN-01', staff_name: 'Dr. Sachin Deshmukh', role: 'DOCTOR', shift: 'MORNING', status: 'ON_DUTY', check_in_time: new Date() },
    { id: 'STF-05', phc_id: 'PHC-PUN-01', staff_name: 'Sneha Kulkarni', role: 'NURSE', shift: 'MORNING', status: 'ON_DUTY', check_in_time: new Date() },
    { id: 'STF-06', phc_id: 'PHC-PUN-01', staff_name: 'Rohan Patil', role: 'PHARMACIST', shift: 'MORNING', status: 'ON_DUTY', check_in_time: new Date() },
    { id: 'STF-07', phc_id: 'DH-PUN-01', staff_name: 'Dr. Neha Joshi (Chief Medical Officer)', role: 'DOCTOR', shift: 'MORNING', status: 'ON_DUTY', check_in_time: new Date() },
    // Patna
    { id: 'STF-08', phc_id: 'PHC-PAT-01', staff_name: 'Dr. Alok Kumar', role: 'DOCTOR', shift: 'MORNING', status: 'ON_DUTY', check_in_time: new Date() },
    { id: 'STF-09', phc_id: 'PHC-PAT-01', staff_name: 'Sunita Devi', role: 'NURSE', shift: 'MORNING', status: 'ON_DUTY', check_in_time: new Date() },
    { id: 'STF-10', phc_id: 'DH-PAT-01', staff_name: 'Dr. Arvind Sinha', role: 'DOCTOR', shift: 'MORNING', status: 'ON_DUTY', check_in_time: new Date() },
    // Bengaluru
    { id: 'STF-11', phc_id: 'PHC-BLR-01', staff_name: 'Dr. Ramesh Gowda', role: 'DOCTOR', shift: 'MORNING', status: 'ON_DUTY', check_in_time: new Date() },
    { id: 'STF-12', phc_id: 'PHC-BLR-01', staff_name: 'Kavita Rao', role: 'NURSE', shift: 'MORNING', status: 'ON_DUTY', check_in_time: new Date() },
    { id: 'STF-13', phc_id: 'DH-BLR-01', staff_name: 'Dr. Suresh Reddy', role: 'DOCTOR', shift: 'MORNING', status: 'ON_DUTY', check_in_time: new Date() },
    // Dhanbad
    { id: 'STF-14', phc_id: 'PHC-DHN-01', staff_name: 'Dr. Amit Banerjee', role: 'DOCTOR', shift: 'MORNING', status: 'ON_DUTY', check_in_time: new Date() },
    { id: 'STF-15', phc_id: 'DH-DHN-01', staff_name: 'Meena Soren', role: 'NURSE', shift: 'MORNING', status: 'ON_DUTY', check_in_time: new Date() },
    // Gaya
    { id: 'STF-16', phc_id: 'PHC-GAY-01', staff_name: 'Dr. Manoj Yadav', role: 'DOCTOR', shift: 'MORNING', status: 'ON_DUTY', check_in_time: new Date() },
    { id: 'STF-17', phc_id: 'DH-GAY-01', staff_name: 'Rekha Kumari', role: 'NURSE', shift: 'MORNING', status: 'ON_DUTY', check_in_time: new Date() },
    // Khordha
    { id: 'STF-18', phc_id: 'PHC-KHO-01', staff_name: 'Dr. Subrat Mohanty', role: 'DOCTOR', shift: 'MORNING', status: 'ON_DUTY', check_in_time: new Date() },
    { id: 'STF-19', phc_id: 'DH-KHO-01', staff_name: 'Nibedita Dash', role: 'NURSE', shift: 'MORNING', status: 'ON_DUTY', check_in_time: new Date() }
  ];
  store.staff_attendance = staffSeed;

  // 9. Users across roles & districts
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  store.users = [
    { id: 'USR-ADMIN', name: 'National Director AI Ops', email: 'admin@arogyagrid.gov.in', password_hash: passwordHash, role: 'ADMIN' },
    { id: 'USR-DO-RAN', name: 'District Health Officer (Ranchi)', email: 'district.ranchi@arogyagrid.gov.in', password_hash: passwordHash, role: 'DISTRICT_OFFICER', district_id: 'DIST-JH-01' },
    { id: 'USR-DO-PUN', name: 'District Health Officer (Pune)', email: 'district.pune@arogyagrid.gov.in', password_hash: passwordHash, role: 'DISTRICT_OFFICER', district_id: 'DIST-MH-01' },
    { id: 'USR-DO-PAT', name: 'District Health Officer (Patna)', email: 'district.patna@arogyagrid.gov.in', password_hash: passwordHash, role: 'DISTRICT_OFFICER', district_id: 'DIST-BR-01' },
    { id: 'USR-DO-BLR', name: 'District Health Officer (Bengaluru)', email: 'district.bengaluru@arogyagrid.gov.in', password_hash: passwordHash, role: 'DISTRICT_OFFICER', district_id: 'DIST-KA-01' },
    { id: 'USR-DOC-RAN01', name: 'Dr. Priya Sharma (Medical Officer)', email: 'doctor.ranchi@arogyagrid.gov.in', password_hash: passwordHash, role: 'DOCTOR', district_id: 'DIST-JH-01', phc_id: 'PHC-RAN-01' },
    { id: 'USR-PHC-RAN01', name: 'Sadar PHC Frontline Staff', email: 'phc.ranchi01@arogyagrid.gov.in', password_hash: passwordHash, role: 'PHC_STAFF', district_id: 'DIST-JH-01', phc_id: 'PHC-RAN-01' },
    { id: 'USR-PHC-PUN01', name: 'Haveli CHC Frontline Staff', email: 'phc.pune01@arogyagrid.gov.in', password_hash: passwordHash, role: 'PHC_STAFF', district_id: 'DIST-MH-01', phc_id: 'PHC-PUN-01' }
  ];

  // 10. Initial Rebalance Escrows & ICMR Drone Flights
  store.transfers = [
    {
      id: 'TRF-DRONE-01',
      source_phc_id: 'PHC-RAN-02',
      destination_phc_id: 'PHC-RAN-03',
      medicine_id: 'MED-004',
      quantity: 50,
      status: 'APPROVED',
      transport_mode: 'ICMR_DRONE',
      route_distance_km: 14.2,
      drone_telemetry: {
        aerial_distance_km: 14.2,
        road_distance_km: 21.0,
        drone_flight_time_mins: 14,
        road_transit_time_mins: 55,
        time_saved_mins: 41,
        drone_feasible: true,
        recommended_mode: 'ICMR_DRONE_VTOL'
      },
      requested_by: 'district.ranchi@arogyagrid.gov.in',
      approved_by: 'admin@arogyagrid.gov.in',
      created_at: new Date(Date.now() - 3600000),
      updated_at: new Date()
    },
    {
      id: 'TRF-ROAD-02',
      source_phc_id: 'DH-RAN-01',
      destination_phc_id: 'PHC-RAN-01',
      medicine_id: 'MED-001',
      quantity: 200,
      status: 'PENDING',
      transport_mode: 'ROAD_ESCROW',
      route_distance_km: 6.5,
      drone_telemetry: {
        aerial_distance_km: 6.5,
        road_distance_km: 9.0,
        drone_flight_time_mins: 8,
        road_transit_time_mins: 22,
        time_saved_mins: 14,
        drone_feasible: true,
        recommended_mode: 'ROAD_ESCROW'
      },
      requested_by: 'doctor.ranchi@arogyagrid.gov.in',
      approved_by: null,
      created_at: new Date(Date.now() - 1800000),
      updated_at: new Date()
    }
  ];

  console.log('[Seed] Database seeded with multi-state districts, facilities, NLEM/WHO drugs, cold-chain units, and batches.');
}

module.exports = { seedDatabase };
