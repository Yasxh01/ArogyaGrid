const db = require('../config/db');

exports.getDistricts = (req, res) => {
  res.json({ districts: db.memoryStore.districts });
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
