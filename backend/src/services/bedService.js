const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const { broadcastEvent } = require('./socketService');

class BedService {
  async getBedsByPHC(phc_id) {
    return db.memoryStore.beds.filter(b => b.phc_id === phc_id);
  }

  async updateBedOccupancy({ phc_id, bed_type, total_beds, occupied_beds }) {
    const store = db.memoryStore;
    let bedRecord = store.beds.find(b => b.phc_id === phc_id && b.bed_type === bed_type);

    if (!bedRecord) {
      bedRecord = {
        id: `BED-${uuidv4().substring(0, 8)}`,
        phc_id,
        bed_type,
        total_beds: total_beds || 10,
        occupied_beds: occupied_beds || 0,
        updated_at: new Date()
      };
      store.beds.push(bedRecord);
    } else {
      if (total_beds !== undefined) bedRecord.total_beds = parseInt(total_beds, 10);
      if (occupied_beds !== undefined) bedRecord.occupied_beds = parseInt(occupied_beds, 10);
      bedRecord.updated_at = new Date();
    }

    const occupancyRate = (bedRecord.occupied_beds / Math.max(1, bedRecord.total_beds)) * 100;

    broadcastEvent('beds:updated', {
      phc_id,
      bed_type,
      total_beds: bedRecord.total_beds,
      occupied_beds: bedRecord.occupied_beds,
      occupancy_percentage: Math.round(occupancyRate)
    });

    if (occupancyRate >= 85) {
      broadcastEvent('alert:critical', {
        phc_id,
        resource_type: 'BED',
        resource_name: `${bed_type} Beds`,
        risk_level: occupancyRate >= 95 ? 'CRITICAL' : 'HIGH',
        occupancy_percentage: Math.round(occupancyRate)
      });
    }

    return bedRecord;
  }
}

module.exports = new BedService();
