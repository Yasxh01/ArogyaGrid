const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');
const { broadcastEvent } = require('./socketService');
const mlService = require('./mlService');

class StockService {
  async processTransaction({ transaction_uuid, phc_id, medicine_id, quantity, transaction_type, created_by }) {
    const store = db.memoryStore;
    
    // Idempotency Deduplication Check
    const existing = store.stock_transactions.find(t => t.transaction_uuid === transaction_uuid);
    if (existing) {
      return { status: 'ALREADY_PROCESSED', transaction: existing, duplicate: true };
    }

    let stockItem = store.stock.find(s => s.phc_id === phc_id && s.medicine_id === medicine_id);
    if (!stockItem) {
      stockItem = {
        id: `STK-${uuidv4().substring(0, 8)}`,
        phc_id,
        medicine_id,
        quantity: 0,
        daily_consumption: 15.0,
        updated_at: new Date()
      };
      store.stock.push(stockItem);
    }

    const qty = parseInt(quantity, 10);
    if (['INTAKE', 'TRANSFER_IN'].includes(transaction_type)) {
      stockItem.quantity += qty;
    } else if (['DISPENSE', 'TRANSFER_OUT'].includes(transaction_type)) {
      if (stockItem.quantity < qty) {
        throw new Error(`Insufficient stock: Requested ${qty}, available ${stockItem.quantity}`);
      }
      stockItem.quantity -= qty;
    }
    stockItem.updated_at = new Date();

    const transaction = {
      id: `TX-${uuidv4().substring(0, 8)}`,
      transaction_uuid,
      phc_id,
      medicine_id,
      quantity: qty,
      transaction_type,
      created_by: created_by || 'SYSTEM',
      created_at: new Date()
    };
    store.stock_transactions.push(transaction);

    broadcastEvent('stock:updated', {
      phc_id,
      medicine_id,
      new_quantity: stockItem.quantity,
      transaction_type
    });

    const prediction = await mlService.predictStockout({
      phc_id,
      medicine_id,
      current_stock: stockItem.quantity,
      daily_consumption: stockItem.daily_consumption,
      footfall_surge_factor: 1.0
    });

    if (['CRITICAL', 'HIGH'].includes(prediction.risk_level)) {
      broadcastEvent('alert:critical', {
        phc_id,
        resource_type: 'MEDICINE',
        medicine_id,
        risk_level: prediction.risk_level,
        days_to_stockout: prediction.days_to_stockout
      });
    }

    return { status: 'SUCCESS', transaction, current_stock: stockItem.quantity, prediction, duplicate: false };
  }

  async getStockByPHC(phc_id) {
    const store = db.memoryStore;
    const items = store.stock.filter(s => s.phc_id === phc_id);
    return items.map(s => {
      const med = store.medicines.find(m => m.id === s.medicine_id) || {};
      return { ...s, medicine_name: med.name, category: med.category, unit: med.unit };
    });
  }
}

module.exports = new StockService();
