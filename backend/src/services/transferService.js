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
  async createTransfer({ source_phc_id, destination_phc_id, medicine_id, quantity, requested_by, transport_mode, auto_approve }) {
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
    }) : {
      aerial_distance_km: distance,
      road_distance_km: Math.round(distance * 1.45 * 10) / 10,
      drone_flight_time_mins: Math.round((distance / 65) * 60) + 4,
      road_transit_time_mins: Math.round(((distance * 1.45) / 28) * 60),
      time_saved_mins: Math.max(5, Math.round(((distance * 1.45) / 28) * 60) - (Math.round((distance / 65) * 60) + 4)),
      drone_feasible: true,
      recommended_mode: 'ICMR_DRONE_VTOL'
    };

    let selectedMode = 'ROAD_ESCROW';
    if (transport_mode === 'ICMR_DRONE') {
      selectedMode = 'ICMR_DRONE';
    } else if (transport_mode === 'ROAD_ESCROW') {
      selectedMode = 'ROAD_ESCROW';
    } else if (droneAnalysis && droneAnalysis.drone_feasible) {
      selectedMode = 'ICMR_DRONE';
    }

    const transfer = {
      id: `TRF-${uuidv4().substring(0, 8)}`,
      source_phc_id,
      destination_phc_id,
      medicine_id,
      quantity: parseInt(quantity, 10),
      status: auto_approve ? 'APPROVED' : 'PENDING',
      transport_mode: selectedMode,
      route_distance_km: distance,
      drone_telemetry: droneAnalysis,
      requested_by: requested_by || 'SYSTEM',
      approved_by: auto_approve ? (requested_by || 'DISTRICT_OFFICER') : null,
      created_at: new Date(),
      updated_at: new Date()
    };

    store.transfers.push(transfer);

    if (auto_approve) {
      await this.executeStockMovement(transfer);
      broadcastEvent('transfer:approved', transfer);
    } else {
      broadcastEvent('transfer:requested', transfer);
    }

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

  async executeStockMovement(transfer) {
    const store = db.memoryStore;
    const qty = parseInt(transfer.quantity, 10);

    // 1. Decrement source PHC stock
    let srcStock = store.stock.find(s => s.phc_id === transfer.source_phc_id && s.medicine_id === transfer.medicine_id);
    if (srcStock) {
      srcStock.quantity = Math.max(0, srcStock.quantity - qty);
      srcStock.updated_at = new Date();
      broadcastEvent('stock:updated', {
        phc_id: transfer.source_phc_id,
        medicine_id: transfer.medicine_id,
        new_quantity: srcStock.quantity,
        transaction_type: 'TRANSFER_OUT'
      });
    }

    // 2. Increment destination PHC stock
    let dstStock = store.stock.find(s => s.phc_id === transfer.destination_phc_id && s.medicine_id === transfer.medicine_id);
    if (!dstStock) {
      dstStock = {
        id: `STK-${uuidv4().substring(0, 8)}`,
        phc_id: transfer.destination_phc_id,
        medicine_id: transfer.medicine_id,
        quantity: 0,
        daily_consumption: 15.0,
        updated_at: new Date()
      };
      store.stock.push(dstStock);
    }
    dstStock.quantity += qty;
    dstStock.updated_at = new Date();

    // 3. Add fresh batch entry at destination so Expiry Tracker updates
    store.batches = store.batches || [];
    const expDate = new Date();
    expDate.setFullYear(expDate.getFullYear() + 1);

    store.batches.push({
      id: `BAT-TRF-${uuidv4().substring(0, 6).toUpperCase()}`,
      phc_id: transfer.destination_phc_id,
      medicine_id: transfer.medicine_id,
      batch_number: `TRF-${Date.now().toString(36).toUpperCase()}`,
      quantity: qty,
      mfg_date: new Date().toISOString().split('T')[0],
      expiry_date: expDate.toISOString().split('T')[0],
      challan_ref: `CH-TRANSFER-${transfer.id}`
    });

    broadcastEvent('stock:updated', {
      phc_id: transfer.destination_phc_id,
      medicine_id: transfer.medicine_id,
      new_quantity: dstStock.quantity,
      transaction_type: 'TRANSFER_IN'
    });

    // 4. Resolve epidemic outbreak alert for destination PHC & medicine
    try {
      const epidemicService = require('./epidemicService');
      epidemicService.resolveOutbreakForPHC(transfer.destination_phc_id, transfer.medicine_id);
    } catch (e) {
      console.warn('Could not resolve epidemic outbreak automatically:', e);
    }

    // 5. Stream transfer & drone flight mission to Google BigQuery
    try {
      const bigqueryService = require('./bigqueryService');
      bigqueryService.streamDroneFlightEvent({
        transfer_id: transfer.id,
        source_phc: transfer.source_phc_id,
        destination_phc: transfer.destination_phc_id,
        payload_kg: (qty * 0.05).toFixed(2),
        flight_mins: transfer.drone_telemetry?.drone_flight_time_mins || 14,
        time_saved_mins: transfer.drone_telemetry?.time_saved_mins || 55,
        transport_mode: transfer.transport_mode
      });
    } catch (e) {}
  }

  async updateStatus(transfer_id, { status, approved_by }) {
    const store = db.memoryStore;
    const transfer = store.transfers.find(t => t.id === transfer_id);
    if (!transfer) throw new Error('Transfer record not found');

    transfer.status = status;
    if (approved_by) transfer.approved_by = approved_by;
    transfer.updated_at = new Date();

    if (status === 'APPROVED') {
      await this.executeStockMovement(transfer);
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
