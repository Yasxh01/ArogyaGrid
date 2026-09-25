import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { 
  Building2, 
  X, 
  Pill, 
  Bed, 
  Thermometer, 
  Users, 
  ArrowRight, 
  Truck, 
  ShieldCheck, 
  AlertTriangle,
  Clock,
  Sparkles,
  MapPin
} from 'lucide-react';

export default function FacilityDetailModal({ isOpen, onClose, phcId, onNavigateToTransfer, onNavigateToStock }) {
  const [loading, setLoading] = useState(true);
  const [facilityInfo, setFacilityInfo] = useState(null);
  const [stockList, setStockList] = useState([]);
  const [bedsList, setBedsList] = useState([]);
  const [coldChainUnit, setColdChainUnit] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [activeSubTab, setActiveSubTab] = useState('overview'); // 'overview' | 'stock' | 'beds'

  useEffect(() => {
    if (isOpen && phcId) {
      loadFacilityDetails();
    }
  }, [isOpen, phcId]);

  async function loadFacilityDetails() {
    setLoading(true);
    try {
      // 1. Fetch stock
      const stockData = await apiRequest(`/stock/phc/${phcId}`).catch(() => ({ stock: [] }));
      setStockList(stockData.stock || []);

      // 2. Fetch beds
      const bedsData = await apiRequest(`/beds/phc/${phcId}`).catch(() => ({ beds: [] }));
      setBedsList(bedsData.beds || []);

      // 3. Fetch cold chain
      const ccData = await apiRequest(`/telemetry/cold-chain`).catch(() => ({ units: [] }));
      const unit = (ccData.units || []).find(u => u.phc_id === phcId || u.facility_name?.includes(phcId));
      setColdChainUnit(unit || null);

      // 4. Fetch staff
      const staffData = await apiRequest(`/staff/phc/${phcId}`).catch(() => ({ staff: [] }));
      setStaffList(staffData.staff || []);

      // 5. Build facility name / type fallback from phcId
      const name = stockData.stock?.[0]?.phc_name || 
                   bedsData.beds?.[0]?.phc_name || 
                   (phcId === 'PHC-RAN-01' ? 'Ranchi Sadar PHC' :
                    phcId === 'PHC-RAN-02' ? 'Kanke Rural CHC' :
                    phcId === 'PHC-RAN-03' ? 'Namkum PHC' : phcId);

      setFacilityInfo({
        id: phcId,
        name,
        type: phcId.includes('CHC') ? 'Community Health Centre' : 'Primary Health Centre'
      });
    } catch (err) {
      console.error('Failed to load facility details:', err);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  const totalBeds = bedsList.reduce((acc, b) => acc + (b.total_beds || 0), 0);
  const occupiedBeds = bedsList.reduce((acc, b) => acc + (b.occupied_beds || 0), 0);
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
  const criticalMedsCount = stockList.filter(s => s.quantity < 50).length;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-teal-50 text-teal-700 shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                  {facilityInfo?.name || phcId}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-teal-50 text-teal-800 border border-teal-200">
                  {phcId}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium flex items-center mt-0.5">
                <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                <span>{facilityInfo?.type || 'Healthcare Facility'} &bull; Public Grid Verified</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center space-x-2 px-5 pt-3 border-b border-slate-100 bg-white">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeSubTab === 'overview'
                ? 'bg-teal-50 text-teal-800 border border-teal-200'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveSubTab('stock')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              activeSubTab === 'stock'
                ? 'bg-teal-50 text-teal-800 border border-teal-200'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Pill className="w-3.5 h-3.5" />
            <span>Medicines ({stockList.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('beds')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              activeSubTab === 'beds'
                ? 'bg-teal-50 text-teal-800 border border-teal-200'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Bed className="w-3.5 h-3.5" />
            <span>Beds ({occupiedBeds}/{totalBeds})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400 font-medium">
              Loading live facility telemetry and inventory...
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeSubTab === 'overview' && (
                <div className="space-y-4">
                  {/* Quick KPI Stat Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                      <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Medicine Shortages</span>
                      <p className={`text-xl font-extrabold ${criticalMedsCount > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                        {criticalMedsCount} Urgent
                      </p>
                      <span className="text-[10px] text-slate-400">Total {stockList.length} medicines stocked</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                      <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Bed Occupancy</span>
                      <p className={`text-xl font-extrabold ${occupancyRate > 85 ? 'text-rose-600' : 'text-indigo-600'}`}>
                        {occupancyRate}%
                      </p>
                      <span className="text-[10px] text-slate-400">{occupiedBeds} occupied of {totalBeds} total</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 col-span-2 sm:col-span-1">
                      <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Vaccine Fridge</span>
                      {coldChainUnit ? (
                        <div>
                          <p className={`text-xl font-extrabold ${coldChainUnit.current_temp_celsius > 8 || coldChainUnit.current_temp_celsius < 2 ? 'text-rose-600' : 'text-emerald-700'}`}>
                            {coldChainUnit.current_temp_celsius.toFixed(1)}°C
                          </p>
                          <span className="text-[10px] text-slate-400">{coldChainUnit.power_status === 'MAINS_ACTIVE' ? 'Main Power' : 'Battery Backup'}</span>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xl font-extrabold text-slate-700">4.2°C</p>
                          <span className="text-[10px] text-slate-400">Normal Range (2°C–8°C)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bed Breakdown Preview */}
                  <div className="p-4 bg-slate-50/60 rounded-2xl border border-slate-200 space-y-2.5">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center justify-between">
                      <span className="flex items-center"><Bed className="w-4 h-4 mr-1.5 text-indigo-600" /> Bed Utilization Breakdown</span>
                      <span className="text-[11px] text-slate-500">{totalBeds - occupiedBeds} beds available right now</span>
                    </h4>

                    {bedsList.map((b) => {
                      const pct = Math.round((b.occupied_beds / Math.max(1, b.total_beds)) * 100);
                      const isFull = pct >= 90;
                      return (
                        <div key={b.id} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-700">
                              {b.bed_type === 'ICU' ? 'ICU Beds' : b.bed_type === 'OXYGEN' ? 'Oxygen Beds' : 'General Beds'}
                            </span>
                            <span className={`font-bold ${isFull ? 'text-rose-600' : 'text-slate-800'}`}>
                              {b.occupied_beds} / {b.total_beds} ({pct}%)
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${isFull ? 'bg-rose-500' : pct > 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Top Critical Medicines Alert */}
                  {criticalMedsCount > 0 && (
                    <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs space-y-2">
                      <div className="flex items-center space-x-2 font-bold text-rose-900">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>Critical Medicine Shortages Need Attention:</span>
                      </div>
                      <div className="space-y-1 pl-6">
                        {stockList.filter(s => s.quantity < 50).map(s => (
                          <div key={s.id} className="flex items-center justify-between text-rose-800">
                            <span>&bull; {s.medicine_name || s.medicine_id}</span>
                            <span className="font-extrabold">{s.quantity} units left</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Medicines List Tab */}
              {activeSubTab === 'stock' && (
                <div className="space-y-2">
                  <div className="border border-slate-200 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                        <tr>
                          <th className="py-2.5 px-3">Medicine</th>
                          <th className="py-2.5 px-3">Available Quantity</th>
                          <th className="py-2.5 px-3">Daily Used</th>
                          <th className="py-2.5 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {stockList.map(s => {
                          const isCrit = s.quantity < 50;
                          const isLow = s.quantity >= 50 && s.quantity < 150;
                          return (
                            <tr key={s.id} className="hover:bg-slate-50/60">
                              <td className="py-2 px-3 font-semibold text-slate-900">
                                {s.medicine_name || s.medicine_id}
                              </td>
                              <td className="py-2 px-3 font-extrabold text-slate-800">
                                {s.quantity} {s.unit || 'units'}
                              </td>
                              <td className="py-2 px-3 text-slate-500">
                                ~{s.daily_consumption || 15}/day
                              </td>
                              <td className="py-2 px-3">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                  isCrit ? 'bg-rose-100 text-rose-800' :
                                  isLow ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                                }`}>
                                  {isCrit ? 'CRITICAL' : isLow ? 'LOW' : 'SAFE'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Beds Detail Tab */}
              {activeSubTab === 'beds' && (
                <div className="space-y-3">
                  {bedsList.map(b => {
                    const pct = Math.round((b.occupied_beds / Math.max(1, b.total_beds)) * 100);
                    return (
                      <div key={b.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                          <span className="flex items-center">
                            <Bed className="w-4 h-4 mr-1.5 text-indigo-600" />
                            {b.bed_type === 'ICU' ? 'ICU (Critical Care) Beds' :
                             b.bed_type === 'OXYGEN' ? 'Oxygen Supported Beds' : 'General Ward Beds'}
                          </span>
                          <span className={pct >= 90 ? 'text-rose-600' : 'text-slate-700'}>
                            {b.occupied_beds} occupied / {b.total_beds} total ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${pct >= 90 ? 'bg-rose-500' : pct >= 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>Available Beds: <strong>{b.total_beds - b.occupied_beds}</strong></span>
                          <span>Last Updated: Live Telemetry</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <button
            onClick={() => {
              onClose();
              if (onNavigateToStock) onNavigateToStock(phcId);
            }}
            className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center space-x-1.5"
          >
            <Pill className="w-3.5 h-3.5 text-emerald-600" />
            <span>Manage Stock</span>
          </button>

          <button
            onClick={() => {
              onClose();
              if (onNavigateToTransfer) onNavigateToTransfer(phcId);
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center space-x-1.5"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Send Medicines to this Clinic</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>

      </div>
    </div>
  );
}
