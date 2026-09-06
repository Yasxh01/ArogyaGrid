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
