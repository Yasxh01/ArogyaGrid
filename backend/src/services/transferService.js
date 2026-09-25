const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const { broadcastEvent } = require('./socketService');

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

class TransferService {
  async createTransfer({ source_phc_id, destination_phc_id, medicine_id, quantity, requested_by }) {
    const store = db.memoryStore;
    const src = store.phcs.find(p => p.id === source_phc_id);
    const dst = store.phcs.find(p => p.id === destination_phc_id);

    const distance = (src && dst) ? calculateDistance(src.latitude, src.longitude, dst.latitude, dst.longitude) : 15.0;
    const droneAnalysis = (src && dst) ? this.calculateDroneRoute({
      sourceLat: src.latitude,
      sourceLon: src.longitude,
      destLat: dst.latitude,
      destLon: dst.longitude,
      payloadKg: (quantity * 0.05)
    }) : null;

    const transfer = {
      id: `TRF-${uuidv4().substring(0, 8)}`,
      source_phc_id,
      destination_phc_id,
      medicine_id,
      quantity: parseInt(quantity, 10),
      status: 'PENDING',
      transport_mode: (droneAnalysis && droneAnalysis.drone_feasible && (droneAnalysis.time_saved_mins > 30)) ? 'ICMR_DRONE' : 'ROAD_ESCROW',
      route_distance_km: distance,
      drone_telemetry: droneAnalysis,
      requested_by: requested_by || 'SYSTEM',
      approved_by: null,
      created_at: new Date(),
      updated_at: new Date()
    };

    store.transfers.push(transfer);
    broadcastEvent('transfer:requested', transfer);
    return transfer;
  }

  calculateDroneRoute({ sourceLat, sourceLon, destLat, destLon, payloadKg = 2.0 }) {
    const aerialKm = calculateDistance(sourceLat, sourceLon, destLat, destLon);
    const roadKm = Math.round(aerialKm * 1.45 * 10) / 10;
    const roadMinutes = Math.round((roadKm / 28) * 60);
    const droneMinutes = Math.round((aerialKm / 75) * 60) + 4;
    const minutesSaved = Math.max(0, roadMinutes - droneMinutes);
    const isFeasible = aerialKm <= 40 && payloadKg <= 5.0;

    return {
      aerial_distance_km: aerialKm,
      road_distance_km: roadKm,
      road_time_mins: roadMinutes,
      drone_flight_time_mins: droneMinutes,
      time_saved_mins: minutesSaved,
      time_reduction_percentage: Math.round((minutesSaved / Math.max(1, roadMinutes)) * 100),
      drone_feasible: isFeasible,
      spec: 'ICMR i-Drone VTOL Medical UAV (Payload: 5kg, Cruising: 75km/h, Insulated Cold Box 2°C–8°C)',
      status: isFeasible ? 'OPTIMAL_FOR_DRONE' : 'ROAD_ESCROW_RECOMMENDED'
    };
  }


  async updateStatus(transfer_id, { status, approved_by }) {
    const store = db.memoryStore;
    const transfer = store.transfers.find(t => t.id === transfer_id);
    if (!transfer) throw new Error('Transfer record not found');

    transfer.status = status;
    if (approved_by) transfer.approved_by = approved_by;
    transfer.updated_at = new Date();

    if (status === 'APPROVED') {
      broadcastEvent('transfer:approved', transfer);
    } else if (status === 'DISPATCHED') {
      broadcastEvent('transfer:dispatched', transfer);
    }

    return transfer;
  }

  async getTransfers(filter = {}) {
    let list = [...db.memoryStore.transfers];
    if (filter.district_id) {
      const phcIds = db.memoryStore.phcs.filter(p => p.district_id === filter.district_id).map(p => p.id);
      list = list.filter(t => phcIds.includes(t.source_phc_id) || phcIds.includes(t.destination_phc_id));
    }
    return list;
  }
}

module.exports = new TransferService();
