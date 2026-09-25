const db = require('../config/db');

class EpidemicService {
  constructor() {
    this.resolvedAlerts = new Set();
  }

  resolveAlert(alertId) {
    this.resolvedAlerts.add(alertId);
    try {
      const { broadcastEvent } = require('./socketService');
      broadcastEvent('epidemic:resolved', { alertId });
    } catch (e) {}
  }

  resolveOutbreakForPHC(phcId, medicineId = null) {
    if (!medicineId || medicineId === 'MED-003') {
      this.resolvedAlerts.add(`EPI-CHOL-${phcId}`);
    }
    if (!medicineId || medicineId === 'MED-001') {
      this.resolvedAlerts.add(`EPI-FEV-${phcId}`);
    }
    if (!medicineId || medicineId === 'MED-005') {
      this.resolvedAlerts.add(`EPI-RAB-${phcId}`);
    }
    try {
      const { broadcastEvent } = require('./socketService');
      broadcastEvent('epidemic:resolved', { phcId, medicineId });
    } catch (e) {}
  }

  /**
   * Analyzes real-time consumption anomalies against baseline burn rates
   * to detect early epidemic clusters (MoHFW IDSP / DEWS standard).
   * Once stock is replenished (>= 50 units) or emergency transfer is dispatched,
   * the alert is resolved.
   */
  detectOutbreakClusters(districtId = null) {
    const store = db.memoryStore;
    const phcs = store.phcs.filter(p => !districtId || p.district_id === districtId);
    const alerts = [];

    phcs.forEach(phc => {
      const stockList = store.stock.filter(s => s.phc_id === phc.id);

      // 1. Water-Borne / Acute Diarrheal / Cholera Outbreak Detection
      const cholId = `EPI-CHOL-${phc.id}`;
      const orsStock = stockList.find(s => s.medicine_id === 'MED-003');
      if (!this.resolvedAlerts.has(cholId) && orsStock && orsStock.quantity < 50 && orsStock.daily_consumption >= 20.0) {
        alerts.push({
          id: cholId,
          phc_id: phc.id,
          phc_name: phc.name,
          district_id: phc.district_id,
          outbreak_type: 'Acute Diarrheal Disease (ADD) / Suspected Cholera',
          trigger_medicine: 'Oral Rehydration Salts (ORS) & Zinc',
          medicine_id: 'MED-003',
          burn_rate_spike: `+${Math.round(((orsStock.daily_consumption - 15) / 15) * 100)}% above baseline`,
          daily_consumption: orsStock.daily_consumption,
          current_stock: orsStock.quantity,
          risk_level: orsStock.quantity < 30 ? 'CRITICAL_OUTBREAK' : 'HIGH_SURGE',
          affected_population_estimate: Math.round((phc.population_served || 15000) * 0.08),
          recommended_action: 'Dispatch 500 sachets ORS & IV Ringer Lactate buffer via fast-track transfer; notify District Epidemiologist.',
          detected_at: new Date().toISOString()
        });
      }

      // 2. Vector-Borne / Dengue / Chikungunya / Malaria Fever Cluster
      const fevId = `EPI-FEV-${phc.id}`;
      const pcmStock = stockList.find(s => s.medicine_id === 'MED-001');
      if (!this.resolvedAlerts.has(fevId) && pcmStock && pcmStock.quantity < 50 && pcmStock.daily_consumption >= 25.0) {
        alerts.push({
          id: fevId,
          phc_id: phc.id,
          phc_name: phc.name,
          district_id: phc.district_id,
          outbreak_type: 'Vector-Borne Viral Fever / Suspected Dengue Cluster',
          trigger_medicine: 'Paracetamol 500mg Tablets',
          medicine_id: 'MED-001',
          burn_rate_spike: `+${Math.round(((pcmStock.daily_consumption - 20) / 20) * 100)}% above baseline`,
          daily_consumption: pcmStock.daily_consumption,
          current_stock: pcmStock.quantity,
          risk_level: pcmStock.quantity < 40 ? 'CRITICAL_OUTBREAK' : 'HIGH_SURGE',
          affected_population_estimate: Math.round((phc.population_served || 15000) * 0.12),
          recommended_action: 'Pre-position 1,000 strips Paracetamol & NS saline; initiate door-to-door ASHA fever surveys.',
          detected_at: new Date().toISOString()
        });
      }

      // 3. Animal Bite / Rabies Emergency Cluster
      const rabId = `EPI-RAB-${phc.id}`;
      const arvStock = stockList.find(s => s.medicine_id === 'MED-005');
      if (!this.resolvedAlerts.has(rabId) && arvStock && arvStock.quantity < 10) {
        alerts.push({
          id: rabId,
          phc_id: phc.id,
          phc_name: phc.name,
          district_id: phc.district_id,
          outbreak_type: 'Stray Canine Bites / Rabies Vulnerability Cluster',
          trigger_medicine: 'Anti-Rabies Vaccine (ARV 2.5 IU)',
          medicine_id: 'MED-005',
          burn_rate_spike: 'Critical stock deficit below emergency threshold',
          daily_consumption: arvStock.daily_consumption || 3.5,
          current_stock: arvStock.quantity,
          risk_level: 'CRITICAL_OUTBREAK',
          affected_population_estimate: Math.round((phc.population_served || 15000) * 0.05),
          recommended_action: 'Immediate cold-chain transfer of 25 ARV vials from District Hospital cold room.',
          detected_at: new Date().toISOString()
        });
      }
    });

    return alerts;
  }
}

module.exports = new EpidemicService();
