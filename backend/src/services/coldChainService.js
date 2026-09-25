const db = require('../config/db');
const { broadcastEvent } = require('./socketService');

class ColdChainService {
  /**
   * Retrieves all monitored cold-chain units with facility metadata.
   */
  async getAllUnits({ district_id, state } = {}) {
    const store = db.memoryStore;
    let units = [...store.cold_chain_units];

    if (district_id) {
      const phcIdsInDistrict = store.phcs.filter(p => p.district_id === district_id).map(p => p.id);
      units = units.filter(u => phcIdsInDistrict.includes(u.phc_id));
    } else if (state) {
      const districtIdsInState = store.districts.filter(d => d.state.toLowerCase() === state.toLowerCase()).map(d => d.id);
      const phcIdsInState = store.phcs.filter(p => districtIdsInState.includes(p.district_id)).map(p => p.id);
      units = units.filter(u => phcIdsInState.includes(u.phc_id));
    }

    return units.map(u => {
      const phc = store.phcs.find(p => p.id === u.phc_id);
      const district = phc ? store.districts.find(d => d.id === phc.district_id) : null;
      return {
        ...u,
        facility_name: phc ? phc.name : u.phc_id,
        facility_type: phc ? phc.facility_type : 'PHC',
        district_name: district ? district.name : 'Unknown',
        state: district ? district.state : 'Unknown'
      };
    });
  }

  /**
   * Ingests real-time IoT sensor telemetry from Ice-Lined Refrigerators.
   */
  async recordTelemetry({ unit_id, temperature_celsius, ambient_temp_celsius, power_status, battery_runtime_mins }) {
    const store = db.memoryStore;
    const unit = store.cold_chain_units.find(u => u.id === unit_id);

    if (!unit) {
      throw new Error(`Cold chain unit ${unit_id} not found`);
    }

    const temp = parseFloat(temperature_celsius);
    const ambient = ambient_temp_celsius !== undefined ? parseFloat(ambient_temp_celsius) : unit.ambient_temp_celsius;
    const power = power_status || unit.power_status;
    const battery = battery_runtime_mins !== undefined ? parseInt(battery_runtime_mins, 10) : unit.battery_runtime_mins;

    unit.current_temp_celsius = temp;
    unit.ambient_temp_celsius = ambient;
    unit.power_status = power;
    unit.battery_runtime_mins = battery;
    unit.updated_at = new Date();

    // Determine status: WHO PQS Standard (+2°C to +8°C)
    let status = 'NORMAL';
    let breachType = null;
    if (temp > unit.max_temp_celsius) {
      status = 'BREACH';
      breachType = 'HEAT_EXCURSION';
    } else if (temp < unit.min_temp_celsius) {
      status = 'BREACH';
      breachType = 'FREEZE_RISK';
    } else if (power === 'BATTERY_BACKUP' && battery < 60) {
      status = 'WARNING';
      breachType = 'LOW_BATTERY';
    }

    unit.status = status;

    // Log telemetry
    store.cold_chain_telemetry_logs.push({
      id: `LOG-CCU-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      unit_id,
      temperature_celsius: temp,
      ambient_temp_celsius: ambient,
      power_status: power,
      timestamp: new Date()
    });

    // Broadcast if breach occurs
    if (status === 'BREACH' || status === 'WARNING') {
      const phc = store.phcs.find(p => p.id === unit.phc_id);
      broadcastEvent('coldchain:alert', {
        unit_id,
        phc_id: unit.phc_id,
        facility_name: phc ? phc.name : unit.phc_id,
        temperature: temp,
        status,
        breach_type: breachType,
        power_status: power,
        battery_runtime_mins: battery,
        timestamp: new Date().toISOString()
      });
    }

    return {
      success: true,
      unit,
      status,
      breachType
    };
  }

  /**
   * Evaluates thermal spoilage hazard and computes time-to-decay using Newton's cooling law.
   */
  async assessThermalSpoilageRisk(unit_id) {
    const store = db.memoryStore;
    const unit = store.cold_chain_units.find(u => u.id === unit_id);
    if (!unit) throw new Error(`Unit ${unit_id} not found`);

    const phc = store.phcs.find(p => p.id === unit.phc_id);
    const temp = unit.current_temp_celsius;
    const ambient = unit.ambient_temp_celsius || 32.0;

    let riskLevel = 'LOW';
    let hoursToSpoilage = 24.0;
    let recommendation = 'Storage temperatures optimal within 2°C–8°C standard range.';

    if (temp > 8.0) {
      riskLevel = temp > 12.0 ? 'CRITICAL' : 'HIGH';
      const delta = Math.max(0.5, ambient - temp);
      hoursToSpoilage = Math.max(0.5, parseFloat(((15.0 - temp) * 1.8 / (delta * 0.15)).toFixed(1)));
      recommendation = `Thermal breach detected (${temp}°C). Vaccines will lose viability in approximately ${hoursToSpoilage} hours. Activate mobile cold-boxes or evacuate supplies to nearest central hub.`;
    } else if (temp < 2.0) {
      riskLevel = 'CRITICAL';
      hoursToSpoilage = 0.5;
      recommendation = `Sub-zero freezing danger detected (${temp}°C). Liquid vaccines (Pentavalent, Hepatitis-B, Tetanus) face irreversible freezing damage. Relocate to intermediate shelf immediately.`;
    } else if (unit.power_status === 'BATTERY_BACKUP') {
      riskLevel = 'MODERATE';
      hoursToSpoilage = (unit.battery_runtime_mins / 60.0).toFixed(1);
      recommendation = `Operating on backup battery. Estimated runtime remaining: ${unit.battery_runtime_mins} minutes before refrigeration ceases.`;
    }

    return {
      unit_id,
      phc_id: unit.phc_id,
      facility_name: phc ? phc.name : unit.phc_id,
      current_temp_celsius: temp,
      status: unit.status,
      power_status: unit.power_status,
      risk_level: riskLevel,
      hours_to_spoilage: hoursToSpoilage,
      recommendation
    };
  }

  /**
   * Operations drill simulator: simulates grid failure or temperature breach.
   */
  async simulateDrill({ unit_id, event_type = 'GRID_FAILURE' }) {
    const store = db.memoryStore;
    const unit = store.cold_chain_units.find(u => u.id === unit_id);
    if (!unit) throw new Error(`Unit ${unit_id} not found`);

    if (event_type === 'GRID_FAILURE') {
      unit.power_status = 'BATTERY_BACKUP';
      unit.current_temp_celsius = 8.6;
      unit.status = 'BREACH';
      unit.battery_runtime_mins = 90;
    } else if (event_type === 'POWER_RESTORED') {
      unit.power_status = 'MAINS_ACTIVE';
      unit.current_temp_celsius = 4.2;
      unit.status = 'NORMAL';
      unit.battery_runtime_mins = 480;
    } else if (event_type === 'FREEZING_SPIKE') {
      unit.current_temp_celsius = 1.1;
      unit.status = 'BREACH';
    }

    unit.updated_at = new Date();

    const phc = store.phcs.find(p => p.id === unit.phc_id);
    broadcastEvent('coldchain:alert', {
      unit_id,
      phc_id: unit.phc_id,
      facility_name: phc ? phc.name : unit.phc_id,
      temperature: unit.current_temp_celsius,
      status: unit.status,
      power_status: unit.power_status,
      simulated_event: event_type,
      timestamp: new Date().toISOString()
    });

    return {
      message: `Drill event ${event_type} applied successfully to unit ${unit_id}`,
      unit
    };
  }
}

module.exports = new ColdChainService();
