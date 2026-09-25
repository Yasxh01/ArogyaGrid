const db = require('../config/db');

exports.getDistricts = (req, res) => {
  res.json({ districts: db.memoryStore.districts });
};

exports.createDistrict = (req, res) => {
  const { id, name, state, latitude, longitude } = req.body;
  if (!name || !state) {
    return res.status(400).json({ error: 'name and state are required', code: 'INVALID_INPUT' });
  }

  const store = db.memoryStore;
  const districtId = id || `DIST-${state.substring(0, 2).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

  const newDistrict = {
    id: districtId,
    name,
    state,
    latitude: latitude ? parseFloat(latitude) : 23.3441,
    longitude: longitude ? parseFloat(longitude) : 85.3096,
    created_at: new Date()
  };

  store.districts.push(newDistrict);
  res.status(201).json({ success: true, district: newDistrict });
};

exports.createFacility = (req, res) => {
  const { districtId } = req.params;
  const { id, name, facility_type, latitude, longitude, capacity, population_served } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'facility name is required', code: 'INVALID_INPUT' });
  }

  const store = db.memoryStore;
  const facilityId = id || `FAC-${Date.now().toString(36).toUpperCase()}`;

  const newFacility = {
    id: facilityId,
    name,
    facility_type: facility_type || 'PHC',
    district_id: districtId,
    latitude: latitude ? parseFloat(latitude) : 23.3500,
    longitude: longitude ? parseFloat(longitude) : 85.3200,
    capacity: capacity ? parseInt(capacity, 10) : 50,
    status: 'HEALTHY',
    population_served: population_served ? parseInt(population_served, 10) : 15000,
    created_at: new Date()
  };

  store.phcs.push(newFacility);

  // Initialize baseline beds
  store.beds.push(
    { id: `BED-${facilityId}-GEN`, phc_id: facilityId, bed_type: 'GENERAL', total_beds: 20, occupied_beds: 0, updated_at: new Date() },
    { id: `BED-${facilityId}-OXY`, phc_id: facilityId, bed_type: 'OXYGEN', total_beds: 5, occupied_beds: 0, updated_at: new Date() }
  );

  res.status(201).json({ success: true, facility: newFacility });
};

exports.getDistrictMapTelemetry = (req, res) => {
  const { districtId } = req.params;
  const store = db.memoryStore;
  const district = store.districts.find(d => d.id === districtId);

  const phcs = store.phcs.filter(p => !districtId || p.district_id === districtId);

  const features = phcs.map(phc => {
    const stockList = store.stock.filter(s => s.phc_id === phc.id);
    const bedList = store.beds.filter(b => b.phc_id === phc.id);
    const staffList = store.staff_attendance.filter(s => s.phc_id === phc.id && s.status === 'ON_DUTY');

    const totalBeds = bedList.reduce((acc, b) => acc + b.total_beds, 0);
    const occupiedBeds = bedList.reduce((acc, b) => acc + b.occupied_beds, 0);
    const bedOccupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
    const criticalStocks = stockList.filter(s => s.quantity < 50);

    return {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [phc.longitude, phc.latitude]
      },
      properties: {
        id: phc.id,
        name: phc.name,
        facility_type: phc.facility_type || 'PHC',
        district_id: phc.district_id,
        status: criticalStocks.length > 0 ? 'CRITICAL' : (bedOccupancyRate > 80 ? 'WARNING' : 'HEALTHY'),
        capacity: phc.capacity,
        population_served: phc.population_served,
        total_medicines_tracked: stockList.length,
        critical_medicines_count: criticalStocks.length,
        bed_occupancy_percentage: bedOccupancyRate,
        staff_on_duty_count: staffList.length
      }
    };
  });

  res.json({
    type: 'FeatureCollection',
    district: district || { id: districtId, name: 'All Districts' },
    features
  });
};

exports.getDistrictFacilities = (req, res) => {
  const { districtId } = req.params;
  const store = db.memoryStore;
  const facilities = store.phcs.filter(p => !districtId || p.district_id === districtId);
  res.json({ facilities });
};

exports.getDistrictStats = (req, res) => {
  const { districtId } = req.params;
  const store = db.memoryStore;
  const phcs = store.phcs.filter(p => !districtId || p.district_id === districtId);
  const phcIds = phcs.map(p => p.id);

  const stockList = store.stock.filter(s => phcIds.includes(s.phc_id));
  const criticalStockouts = stockList.filter(s => s.quantity < 50).length;

  const bedList = store.beds.filter(b => phcIds.includes(b.phc_id));
  const totalBeds = bedList.reduce((acc, b) => acc + b.total_beds, 0);
  const occupiedBeds = bedList.reduce((acc, b) => acc + b.occupied_beds, 0);
  const bedUtilization = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  const activeStaff = store.staff_attendance.filter(s => phcIds.includes(s.phc_id) && s.status === 'ON_DUTY').length;

  res.json({
    district_id: districtId,
    monitored_phcs_count: phcs.length,
    critical_stockouts_count: criticalStockouts,
    bed_utilization_percentage: bedUtilization,
    active_staff_count: activeStaff,
    federated_version: 'v2.5.0'
  });
};
