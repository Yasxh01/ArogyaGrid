const stockService = require('../services/stockService');
const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const { broadcastEvent } = require('../services/socketService');

exports.getStock = async (req, res, next) => {
  try {
    const phc_id = req.params.phcId || (req.user ? req.user.phc_id : null);
    const stock = await stockService.getStockByPHC(phc_id);
    res.json({ phc_id, stock });
  } catch (err) {
    next(err);
  }
};

exports.getMedicines = (req, res) => {
  res.json({ medicines: db.memoryStore.medicines });
};

exports.createMedicine = (req, res) => {
  const { name, category, unit, minimum_stock, daily_base_consumption } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Medicine name is required', code: 'INVALID_INPUT' });
  }

  const nextId = 'MED-' + String(db.memoryStore.medicines.length + 1).padStart(3, '0');
  const newMed = {
    id: nextId,
    name,
    category: category || 'General',
    unit: unit || 'strips',
    minimum_stock: parseInt(minimum_stock, 10) || 50,
    daily_base_consumption: parseFloat(daily_base_consumption) || 10.0,
    created_at: new Date()
  };

  db.memoryStore.medicines.push(newMed);

  // Automatically initialize stock for all existing PHCs
  db.memoryStore.phcs.forEach(p => {
    db.memoryStore.stock.push({
      id: `STK-${Date.now().toString(36)}-${Math.floor(Math.random()*1000)}`,
      phc_id: p.id,
      medicine_id: newMed.id,
      quantity: 100, // Initial baseline stock
      daily_consumption: newMed.daily_base_consumption,
      updated_at: new Date()
    });
  });

  broadcastEvent('medicine:created', { medicine: newMed });

  res.status(201).json({ success: true, medicine: newMed });
};

exports.submitTransaction = async (req, res, next) => {
  try {
    const result = await stockService.processTransaction({
      ...req.body,
      created_by: req.user ? req.user.email : 'OFFLINE_SYNC'
    });
    res.status(result.duplicate ? 200 : 201).json(result);
  } catch (err) {
    next(err);
  }
};

exports.getBatches = (req, res) => {
  const phc_id = req.params.phcId || (req.user ? req.user.phc_id : null);
  const store = db.memoryStore;
  let batches = store.batches || [];
  if (phc_id && phc_id !== 'ALL') {
    batches = batches.filter(b => b.phc_id === phc_id);
  }
  const now = new Date();
  const enriched = batches.map(b => {
    const med = (store.medicines || []).find(m => m.id === b.medicine_id) || {};
    const phc = (store.phcs || []).find(p => p.id === b.phc_id) || {};
    const exp = new Date(b.expiry_date);
    const diffDays = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
    let status = 'SAFE';
    if (diffDays <= 30) status = 'CRITICAL_EXPIRY';
    else if (diffDays <= 60) status = 'NEAR_EXPIRY';

    return {
      ...b,
      medicine_name: med.name || b.medicine_id,
      category: med.category || 'General',
      storage_type: med.storage_type || 'AMBIENT',
      phc_name: phc.name || b.phc_id,
      days_to_expiry: diffDays,
      status,
      fefo_priority: diffDays <= 30 ? 1 : (diffDays <= 60 ? 2 : 3)
    };
  }).sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date));

  res.json({ count: enriched.length, batches: enriched });
};

exports.createBatch = (req, res) => {
  const { phc_id, medicine_id, batch_number, quantity, mfg_date, expiry_date, challan_ref } = req.body;
  if (!phc_id || !medicine_id || !batch_number || !quantity || !expiry_date) {
    return res.status(400).json({ error: 'phc_id, medicine_id, batch_number, quantity, expiry_date are required', code: 'INVALID_INPUT' });
  }

  const store = db.memoryStore;
  const newBatch = {
    id: `BAT-${Date.now().toString(36).toUpperCase()}`,
    phc_id,
    medicine_id,
    batch_number,
    quantity: parseInt(quantity, 10),
    mfg_date: mfg_date || new Date().toISOString().split('T')[0],
    expiry_date,
    challan_ref: challan_ref || `CH-JSMSCL-${Math.floor(1000 + Math.random() * 9000)}`,
    created_at: new Date()
  };

  store.batches.push(newBatch);
  broadcastEvent('stock:updated', { phc_id, medicine_id, batch_number, quantity: newBatch.quantity });

  res.status(201).json({ success: true, batch: newBatch });
};

