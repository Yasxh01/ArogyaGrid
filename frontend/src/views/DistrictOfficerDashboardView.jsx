import React, { useState, useEffect } from 'react';
import StatsBanner from '../components/StatsBanner';
import MapView from '../components/MapView';
import TransferDashboard from '../components/TransferDashboard';
import StockManager from '../components/StockManager';
import BedMatrix from '../components/BedMatrix';
import ColdChainTelemetryView from '../components/ColdChainTelemetryView';
import ABDMInteroperabilityView from '../components/ABDMInteroperabilityView';
import MLModelExplainabilityView from '../components/MLModelExplainabilityView';
import NotificationSimulatorModal from '../components/NotificationSimulatorModal';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../api/client';
import { 
  Map, 
  ShieldCheck, 
  Thermometer, 
  Truck, 
  Package, 
  Bed, 
  Globe,
  AlertTriangle,
  Smartphone,
  Flame,
  ArrowRight,
  Network,
  BarChart3
} from 'lucide-react';

export default function DistrictOfficerDashboardView({ activeTab, setActiveTab }) {
  const { user } = useAuth();
  const [selectedPHC, setSelectedPHC] = useState('PHC-RAN-01');
  const [districts, setDistricts] = useState([]);
  const [selectedDistrictId, setSelectedDistrictId] = useState(user?.district_id || 'DIST-JH-01');
  const [internalTab, setInternalTab] = useState('map');
  const [epidemicAlerts, setEpidemicAlerts] = useState([]);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);

  useEffect(() => {
    fetchDistricts();
  }, []);

  useEffect(() => {
    fetchEpidemicAlerts();
    updateDistrictFacility();
  }, [selectedDistrictId]);

  async function updateDistrictFacility() {
    try {
      const data = await apiRequest(`/districts/${selectedDistrictId}/facilities`);
      if (data.facilities && data.facilities.length > 0) {
        setSelectedPHC(data.facilities[0].id);
      }
    } catch (err) {
      console.error('Failed to update district facility:', err);
    }
  }

  async function fetchDistricts() {
    try {
      const data = await apiRequest('/districts');
      setDistricts(data.districts || []);
    } catch (err) {
      console.error('Failed to load districts:', err);
    }
  }

  async function fetchEpidemicAlerts() {
    try {
      const data = await apiRequest(`/epidemic/alerts/${selectedDistrictId}`);
      setEpidemicAlerts(data.alerts || []);
    } catch (err) {
      console.error('Failed to load epidemic alerts:', err);
    }
  }

  function handleQuickTransfer(phcId) {
    setSelectedPHC(phcId);
    if (setActiveTab) setActiveTab('transfers');
    setInternalTab('transfers');
  }

  const currentDistrict = districts.find(d => d.id === selectedDistrictId) || {
    id: selectedDistrictId,
    name: 'Ranchi',
    state: 'Jharkhand'
  };


  const effectiveTab = activeTab && activeTab !== 'dashboard' ? activeTab : internalTab;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Officer Header with Dynamic Multi-District Switcher */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-teal-50 text-teal-600 shrink-0">
            <Map className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap">
              <h2 className="font-black text-lg text-slate-900">District Healthcare Dashboard</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
                👤 {user?.name || 'District Health Officer'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Connected across all clinics &bull; Viewing <span className="font-bold text-slate-800">{currentDistrict.name}</span> ({currentDistrict.state})
            </p>
          </div>
        </div>

        {/* Dynamic District Selector */}
        <div className="flex items-center space-x-3 self-start lg:self-auto">
          <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <Globe className="w-4 h-4 text-teal-600" />
            <span className="text-xs font-bold text-slate-600">Switch District:</span>
            <select
              value={selectedDistrictId}
              onChange={(e) => setSelectedDistrictId(e.target.value)}
              className="bg-transparent font-bold text-xs text-slate-800 focus:outline-none cursor-pointer"
            >
              {districts.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.state})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsNotifModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 transition shrink-0"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>📱 ASHA WhatsApp Alerts</span>
          </button>

          <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1 shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
            <span>🔒 Patient Data Protected</span>
          </span>
        </div>
      </div>

      {/* Internal Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => { setInternalTab('map'); if (setActiveTab) setActiveTab('dashboard'); }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            effectiveTab === 'map' || effectiveTab === 'dashboard'
              ? 'bg-teal-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Map className="w-3.5 h-3.5" />
          <span>Live Map</span>
        </button>

        <button
          onClick={() => { setInternalTab('coldchain'); if (setActiveTab) setActiveTab('coldchain'); }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            effectiveTab === 'coldchain'
              ? 'bg-teal-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Thermometer className="w-3.5 h-3.5" />
          <span>Vaccine Fridges (2°C-8°C)</span>
        </button>

        <button
          onClick={() => { setInternalTab('transfers'); if (setActiveTab) setActiveTab('transfers'); }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            effectiveTab === 'transfers'
              ? 'bg-teal-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>Send Medicines & Drones</span>
        </button>

        <button
          onClick={() => { setInternalTab('stock'); if (setActiveTab) setActiveTab('stock'); }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            effectiveTab === 'stock'
              ? 'bg-teal-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Medicine Stock & Expiry</span>
        </button>

        <button
          onClick={() => { setInternalTab('beds'); if (setActiveTab) setActiveTab('beds'); }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            effectiveTab === 'beds'
              ? 'bg-teal-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Bed className="w-3.5 h-3.5" />
          <span>Hospital Beds</span>
        </button>

        <button
          onClick={() => { setInternalTab('abdm'); if (setActiveTab) setActiveTab('abdm'); }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            effectiveTab === 'abdm'
              ? 'bg-teal-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Network className="w-3.5 h-3.5" />
          <span>Govt Portals & ABHA</span>
        </button>

        <button
          onClick={() => { setInternalTab('xai'); if (setActiveTab) setActiveTab('xai'); }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            effectiveTab === 'xai'
              ? 'bg-teal-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>AI Forecasts & Charts</span>
        </button>
      </div>

      {/* MoHFW IDSP Disease Surveillance Epidemic Alert Banner */}
      {epidemicAlerts.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-rose-50 via-amber-50 to-rose-50 border-2 border-rose-300 rounded-2xl shadow-sm text-xs space-y-2 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2.5">
              <span className="p-2 rounded-xl bg-rose-600 text-white animate-pulse shrink-0">
                <Flame className="w-5 h-5" />
              </span>
              <div>
                <span className="font-black text-rose-950 uppercase tracking-wide text-xs">
                  🚨 Disease Outbreak Warning &bull; {epidemicAlerts[0].outbreak_type}
                </span>
                <p className="text-[11px] text-rose-800 font-semibold mt-0.5">
                  Unusual patient surge at <strong>{epidemicAlerts[0].phc_name}</strong> ({epidemicAlerts[0].burn_rate_spike})
                </p>
              </div>
            </div>

            <button
              onClick={() => handleQuickTransfer(epidemicAlerts[0].phc_id)}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl transition shadow-sm flex items-center justify-center space-x-1 self-start sm:self-auto shrink-0"
            >
              <span>⚡ Send Emergency Medicines Now</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-600 pt-2 border-t border-rose-200/60 gap-2">
            <span><strong>Estimated Population at Risk:</strong> ~{epidemicAlerts[0].affected_population_estimate.toLocaleString('en-IN')} citizens</span>
            <span className="text-slate-500 italic">{epidemicAlerts[0].recommended_action}</span>
          </div>
        </div>
      )}

      <StatsBanner districtId={selectedDistrictId} />

      {effectiveTab === 'xai' && (
        <MLModelExplainabilityView districtId={selectedDistrictId} />
      )}

      {effectiveTab === 'abdm' && (
        <ABDMInteroperabilityView districtId={selectedDistrictId} />
      )}

      {effectiveTab === 'coldchain' && (
        <ColdChainTelemetryView districtId={selectedDistrictId} />
      )}

      {effectiveTab === 'transfers' && (
        <TransferDashboard />
      )}

      {effectiveTab === 'stock' && (
        <StockManager selectedPHC={selectedPHC} districtId={selectedDistrictId} />
      )}

      {effectiveTab === 'beds' && (
        <BedMatrix selectedPHC={selectedPHC} districtId={selectedDistrictId} />
      )}

      {(effectiveTab === 'map' || effectiveTab === 'dashboard') && (
        <MapView 
          districtId={selectedDistrictId}
          onSelectPHC={(id) => setSelectedPHC(id)} 
          onQuickTransfer={handleQuickTransfer} 
        />
      )}

      {/* ASHA WhatsApp & SMS Dispatch Modal */}
      <NotificationSimulatorModal
        isOpen={isNotifModalOpen}
        onClose={() => setIsNotifModalOpen(false)}
      />
    </div>
  );
}

