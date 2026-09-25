import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { useSocket } from '../context/SocketContext';
import { 
  Thermometer, 
  Zap, 
  BatteryCharging, 
  AlertTriangle, 
  ShieldCheck, 
  RefreshCw, 
  Flame, 
  Snowflake,
  Play
} from 'lucide-react';

export default function ColdChainTelemetryView({ districtId = 'DIST-JH-01' }) {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drillLoading, setDrillLoading] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [spoilageAssessment, setSpoilageAssessment] = useState(null);
  const { alerts } = useSocket();

  useEffect(() => {
    fetchColdChainUnits();
  }, [districtId]);

  // Refetch when cold chain alerts arrive
  useEffect(() => {
    if (alerts.length > 0) {
      fetchColdChainUnits();
    }
  }, [alerts]);

  async function fetchColdChainUnits() {
    setLoading(true);
    try {
      const data = await apiRequest(`/telemetry/cold-chain?district_id=${districtId}`);
      const fetchedUnits = data.units || [];
      setUnits(fetchedUnits);
      if (fetchedUnits.length > 0) {
        const stillExists = fetchedUnits.find(u => u.id === selectedUnit?.id);
        const active = stillExists || fetchedUnits[0];
        setSelectedUnit(active);
        fetchSpoilageRisk(active.id);
      } else {
        setSelectedUnit(null);
        setSpoilageAssessment(null);
      }
    } catch (err) {
      console.error('Failed to fetch cold-chain units:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchSpoilageRisk(unitId) {
    try {
      const res = await apiRequest(`/telemetry/cold-chain/${unitId}/spoilage-risk`);
      setSpoilageAssessment(res.assessment);
    } catch (err) {
      console.error('Failed to get spoilage risk:', err);
    }
  }

  async function handleSimulateDrill(unitId, eventType) {
    setDrillLoading(true);
    try {
      await apiRequest(`/telemetry/cold-chain/${unitId}/simulate`, {
        method: 'POST',
        body: JSON.stringify({ event_type: eventType })
      });
      await fetchColdChainUnits();
      await fetchSpoilageRisk(unitId);
    } catch (err) {
      alert('Drill simulation failed: ' + err.message);
    } finally {
      setDrillLoading(false);
    }
  }

  function getTempColor(temp) {
    if (temp > 8.0) return 'text-rose-600 bg-rose-50 border-rose-200';
    if (temp < 2.0) return 'text-sky-600 bg-sky-50 border-sky-200';
    return 'text-emerald-700 bg-emerald-50 border-emerald-200';
  }

  function getDialAngle(temp) {
    // Maps -5°C to 15°C across a 180-degree gauge (-90deg to +90deg)
    const clamped = Math.max(-5, Math.min(15, temp));
    const percentage = (clamped + 5) / 20.0;
    return -90 + percentage * 180;
  }

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
              <Thermometer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">Vaccine Refrigerator Monitor</h2>
              <p className="text-xs text-slate-500 font-medium">
                Real-time temperature tracking for government vaccine fridges &bull; Safe storage zone: 2°C to 8°C
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchColdChainUnits}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Readings</span>
          </button>
        </div>
      </div>

      {/* Grid of Refrigerator Gauge Dials */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {units.map((unit) => {
          const isBreach = unit.current_temp_celsius > 8.0 || unit.current_temp_celsius < 2.0;
          const isSelected = selectedUnit?.id === unit.id;
          const dialRotation = getDialAngle(unit.current_temp_celsius);

          return (
            <div
              key={unit.id}
              onClick={() => {
                setSelectedUnit(unit);
                fetchSpoilageRisk(unit.id);
              }}
              className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'border-teal-500 ring-2 ring-teal-500/20 shadow-lg'
                  : 'border-slate-200 hover:border-slate-300 shadow-sm'
              }`}
            >
              {/* Status Ribbon */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {unit.facility_type || 'PHC'}
                  </span>
                  <h3 className="text-sm font-extrabold text-slate-900 mt-1">{unit.facility_name}</h3>
                  <p className="text-[11px] text-slate-500">{unit.model_name}</p>
                </div>

                <div className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase flex items-center space-x-1 border ${
                  unit.status === 'BREACH'
                    ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                    : unit.status === 'WARNING'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  {unit.status === 'BREACH' ? (
                    unit.current_temp_celsius > 8.0 ? <Flame className="w-3 h-3 text-rose-600" /> : <Snowflake className="w-3 h-3 text-sky-600" />
                  ) : (
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  )}
                  <span>{unit.status}</span>
                </div>
              </div>

              {/* Gauge Dial Graphic */}
              <div className="flex flex-col items-center my-3">
                <div className="relative w-44 h-24 flex items-end justify-center overflow-hidden">
                  {/* Gauge Arc Background */}
                  <div className="absolute w-40 h-40 rounded-full border-[12px] border-slate-100 top-0" style={{
                    borderTopColor: '#38bdf8', // Blue < 2°C
                    borderRightColor: '#10b981', // Green 2-8°C
                    borderBottomColor: '#f43f5e', // Red > 8°C
                    borderLeftColor: '#f43f5e',
                    transform: 'rotate(-45deg)'
                  }} />

                  {/* Gauge Needle */}
                  <div
                    className="absolute w-1.5 h-16 bg-slate-800 rounded-full origin-bottom transition-transform duration-700"
                    style={{
                      transform: `rotate(${dialRotation}deg)`,
                      bottom: '0px'
                    }}
                  />
                  <div className="w-5 h-5 bg-slate-900 rounded-full z-10 -mb-2 border-2 border-white shadow" />
                </div>

                {/* Digital Reading */}
                <div className="text-center mt-2">
                  <div className="flex items-baseline justify-center space-x-1">
                    <span className="text-3xl font-black text-slate-900 tracking-tight">
                      {unit.current_temp_celsius.toFixed(1)}
                    </span>
                    <span className="text-sm font-bold text-slate-500">°C</span>
                  </div>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold border ${getTempColor(unit.current_temp_celsius)}`}>
                    {unit.current_temp_celsius > 8.0
                      ? '⚠️ TOO WARM! (Above 8°C)'
                      : unit.current_temp_celsius < 2.0
                      ? '❄️ TOO COLD! (Below 2°C)'
                      : '✅ SAFE STORAGE (2°C–8°C)'}
                  </span>
                </div>
              </div>

              {/* Power and Battery Status Footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1.5 text-slate-600">
                  <Zap className={`w-3.5 h-3.5 ${unit.power_status === 'MAINS_ACTIVE' ? 'text-amber-500' : 'text-slate-400'}`} />
                  <span className="text-[11px] font-semibold">
                    {unit.power_status === 'MAINS_ACTIVE' ? 'Main Power Running' : 'Battery Backup Active'}
                  </span>
                </div>

                <div className="flex items-center space-x-1 text-slate-500">
                  <BatteryCharging className="w-3.5 h-3.5 text-teal-600" />
                  <span className="text-[11px] font-bold">{unit.battery_runtime_mins}m battery remaining</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Unit Details & Gemini Spoilage Assessment Card */}
      {selectedUnit && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">Fridge Safety & Spoilage Watchdog</span>
              <h3 className="text-base font-black text-slate-900">
                {selectedUnit.model_name} &bull; {selectedUnit.facility_name}
              </h3>
            </div>

            {/* Operations Drill Simulator Buttons */}
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Test Scenarios:</span>
              <button
                disabled={drillLoading}
                onClick={() => handleSimulateDrill(selectedUnit.id, 'GRID_FAILURE')}
                className="px-3 py-1.5 text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl transition flex items-center space-x-1"
              >
                <AlertTriangle className="w-3 h-3" />
                <span>Simulate Power Cut (Heats up)</span>
              </button>
              <button
                disabled={drillLoading}
                onClick={() => handleSimulateDrill(selectedUnit.id, 'POWER_RESTORED')}
                className="px-3 py-1.5 text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition flex items-center space-x-1"
              >
                <ShieldCheck className="w-3 h-3" />
                <span>Restore Normal (Cools down)</span>
              </button>
            </div>
          </div>

          {/* Gemini Thermal Spoilage Assessment Box */}
          {spoilageAssessment && (
            <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
              spoilageAssessment.risk_level === 'CRITICAL' || spoilageAssessment.risk_level === 'HIGH'
                ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                : spoilageAssessment.risk_level === 'MODERATE'
                ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-1.5 font-bold">
                  <Thermometer className="w-4 h-4" />
                  <span className="uppercase tracking-wider">AI Vaccine Safety & Spoilage Advisory</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-white/80 border border-current">
                  Risk Level: {spoilageAssessment.risk_level}
                </span>
              </div>

              <p className="font-medium mb-2">{spoilageAssessment.recommendation}</p>

              <div className="flex items-center space-x-6 text-[11px] font-semibold opacity-90">
                <span>Fridge Temp: <strong>{spoilageAssessment.current_temp_celsius}°C</strong></span>
                <span>Time Before Medicines Spoil: <strong>{spoilageAssessment.hours_to_spoilage} hrs</strong></span>
                <span>Power Source: <strong>{spoilageAssessment.power_status}</strong></span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
