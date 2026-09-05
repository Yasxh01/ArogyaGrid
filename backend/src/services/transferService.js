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

    const transfer = {
      id: `TRF-${uuidv4().substring(0, 8)}`,
      source_phc_id,
      destination_phc_id,
      medicine_id,
      quantity: parseInt(quantity, 10),
      status: 'PENDING',
      route_distance_km: distance,
      requested_by: requested_by || 'SYSTEM',
      approved_by: null,
      created_at: new Date(),
      updated_at: new Date()
    };

    store.transfers.push(transfer);
    broadcastEvent('transfer:requested', transfer);
    return transfer;
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
