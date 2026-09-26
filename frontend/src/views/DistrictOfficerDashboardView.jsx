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
import FacilityDetailModal from '../components/FacilityDetailModal';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { apiRequest } from '../api/client';
import { 
  Map, 
  ShieldCheck, 
  Smartphone, 
  Flame, 
  ArrowRight, 
  CheckCircle2,
  ChevronRight,
  Activity,
  MapPin,
  Thermometer,
  Truck,
  Package,
  Bed,
  Network,
  BarChart3
} from 'lucide-react';

export default function DistrictOfficerDashboardView({ activeTab, setActiveTab, selectedDistrictId: propDistrictId, onSelectDistrict }) {
  const { user } = useAuth();
  const { on, off } = useSocket();
  const [selectedPHC, setSelectedPHC] = useState('PHC-RAN-01');
  const [districts, setDistricts] = useState([]);
  const [selectedDistrictId, setSelectedDistrictId] = useState(propDistrictId || user?.district_id || 'DIST-JH-01');
  const [internalTab, setInternalTab] = useState('map');
  const [epidemicAlerts, setEpidemicAlerts] = useState([]);
  const [isNotifModalOpen, setIsNotifModalOpen] = useState(false);
  const [inspectPHCId, setInspectPHCId] = useState(null);
  const [resolvedBanner, setResolvedBanner] = useState(null);

  useEffect(() => {
    if (propDistrictId && propDistrictId !== selectedDistrictId) {
      setSelectedDistrictId(propDistrictId);
    }
  }, [propDistrictId]);

  useEffect(() => {
    fetchDistricts();
  }, []);

  useEffect(() => {
    fetchEpidemicAlerts();
    updateDistrictFacility();
  }, [selectedDistrictId]);

  useEffect(() => {
    if (!on || !off) return;
    const handleSync = () => {
      fetchEpidemicAlerts();
    };
    on('stock:updated', handleSync);
    on('transfer:approved', handleSync);
    on('transfer:dispatched', handleSync);
    on('epidemic:resolved', handleSync);

    return () => {
      off('stock:updated', handleSync);
      off('transfer:approved', handleSync);
      off('transfer:dispatched', handleSync);
      off('epidemic:resolved', handleSync);
    };
  }, [on, off, selectedDistrictId]);

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

  async function handleDismissAlert(alertId) {
    try {
      await apiRequest(`/epidemic/alerts/${alertId}/resolve`, { method: 'POST' });
    } catch (e) {
      console.warn('Alert dismissed locally:', e);
    }
    setEpidemicAlerts(prev => prev.filter(a => a.id !== alertId));
    setResolvedBanner('✓ Outbreak alert marked mitigated & recorded in district registry.');
    setTimeout(() => setResolvedBanner(null), 5000);
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

  // Tab metadata for clean sub-view breadcrumbs
  const TAB_META = {
    dashboard: { title: 'Live Map & Surveillance', icon: Map },
    map: { title: 'Live Map & Surveillance', icon: Map },
    coldchain: { title: 'Vaccine Cold-Chain Telemetry (2°C–8°C)', icon: Thermometer },
    transfers: { title: 'Inter-Facility Transfers & Drone Routes', icon: Truck },
    stock: { title: 'Medicine Stock & Expiry Ledger', icon: Package },
    beds: { title: 'Real-Time Hospital Bed Allocation', icon: Bed },
    abdm: { title: 'ABDM & National Health Portals', icon: Network },
    xai: { title: 'Explainable AI Epidemic Forecasts', icon: BarChart3 }
  };

  const currentMeta = TAB_META[effectiveTab] || TAB_META.map;
  const TabIcon = currentMeta.icon;

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Streamlined District Command Bar */}
      <div className="bg-white rounded-2xl px-5 py-3.5 border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        
        {/* Left: Section Context & Breadcrumb */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100">
            <TabIcon className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-semibold">
              <span>District Operations</span>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span className="font-extrabold text-slate-800">{currentMeta.title}</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Supervising <span className="font-bold text-slate-700">{currentDistrict.name}</span> ({currentDistrict.state}) &bull; Active Facilities: <strong className="font-semibold text-slate-700">5 Monitored PHCs/CHCs</strong>
            </p>
          </div>
        </div>

        {/* Right: Unified Controls Cluster */}
        <div className="flex items-center space-x-2.5 flex-wrap self-start sm:self-auto">
          
          {/* Authoritative Single District Switcher */}
          <div className="flex items-center space-x-1.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 px-2.5 py-1.5 rounded-xl transition">
            <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <select
              value={selectedDistrictId}
              onChange={(e) => {
                const newId = e.target.value;
                setSelectedDistrictId(newId);
                if (onSelectDistrict) onSelectDistrict(newId);
              }}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer pr-1"
              title="Select District"
            >
              {districts.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name}, {d.state}
                </option>
              ))}
            </select>
          </div>

          {/* Quick WhatsApp ASHA Alerts Simulator Trigger */}
          <button
            onClick={() => setIsNotifModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100/90 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200/80 transition shadow-2xs shrink-0"
            title="Dispatch simulated WhatsApp/SMS alerts to frontline ASHA workers"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
            <span>ASHA Alerts</span>
          </button>

          {/* DPDP Privacy Badge */}
          <span className="hidden md:inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200/70 shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 mr-1" />
            <span>DPDP Protected</span>
          </span>

          {/* Return to Map shortcut if on another tab */}
          {effectiveTab !== 'map' && effectiveTab !== 'dashboard' && (
            <button
              onClick={() => {
                setInternalTab('map');
                if (setActiveTab) setActiveTab('dashboard');
              }}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200/70 text-slate-700 font-bold text-xs rounded-xl border border-slate-200/70 transition shrink-0"
            >
              ← Back to Map
            </button>
          )}

        </div>
      </div>

      {/* Resolution Notification Banner */}
      {resolvedBanner && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center space-x-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{resolvedBanner}</span>
        </div>
      )}

      {/* MoHFW IDSP Disease Surveillance Epidemic Alert Ribbon */}
      {epidemicAlerts.length > 0 && (
        <div className="p-3.5 sm:p-4 bg-rose-50/90 border border-rose-200 rounded-2xl shadow-2xs text-xs flex flex-col md:flex-row md:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center space-x-3">
            <span className="p-2 rounded-xl bg-rose-500 text-white shrink-0 shadow-xs">
              <Flame className="w-4 h-4 animate-pulse" />
            </span>
            <div>
              <div className="flex items-center space-x-2 flex-wrap">
                <span className="font-black text-rose-950 uppercase tracking-wide text-xs">
                  🚨 Outbreak Warning: {epidemicAlerts[0].outbreak_type}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                  {epidemicAlerts[0].burn_rate_spike}
                </span>
              </div>
              <p className="text-[11px] text-rose-800 font-medium mt-0.5">
                Surge detected at <strong className="font-bold">{epidemicAlerts[0].phc_name}</strong> &bull; ~{epidemicAlerts[0].affected_population_estimate.toLocaleString('en-IN')} citizens at risk &bull; <span className="italic">{epidemicAlerts[0].recommended_action}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0 self-end md:self-auto">
            <button
              onClick={() => handleDismissAlert(epidemicAlerts[0].id)}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 font-bold border border-slate-200 rounded-xl transition text-xs shadow-2xs flex items-center space-x-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mr-1" />
              <span>Mitigate</span>
            </button>
            <button
              onClick={() => handleQuickTransfer(epidemicAlerts[0].phc_id)}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition shadow-xs flex items-center space-x-1"
            >
              <span>⚡ Send Supplies</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* Primary KPI Metrics Bar (Rendered on Overview/Map) */}
      {(effectiveTab === 'map' || effectiveTab === 'dashboard') && (
        <StatsBanner districtId={selectedDistrictId} />
      )}

      {/* Main Tab Views */}
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
        <TransferDashboard
          initialDestination={selectedPHC}
          onTransferSuccess={() => {
            fetchEpidemicAlerts();
            setResolvedBanner('⚡ Emergency transfer dispatched! Outbreak alert mitigated.');
            setTimeout(() => setResolvedBanner(null), 5000);
          }}
        />
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
          onSelectPHC={(id) => {
            setSelectedPHC(id);
            setInspectPHCId(id);
          }} 
          onQuickTransfer={handleQuickTransfer} 
        />
      )}

      {/* Facility Inspection Detail Modal */}
      <FacilityDetailModal
        isOpen={!!inspectPHCId}
        onClose={() => setInspectPHCId(null)}
        phcId={inspectPHCId}
        onNavigateToTransfer={(phcId) => handleQuickTransfer(phcId)}
        onNavigateToStock={(phcId) => {
          setSelectedPHC(phcId);
          if (setActiveTab) setActiveTab('stock');
          setInternalTab('stock');
        }}
      />

      {/* ASHA WhatsApp & SMS Dispatch Modal */}
      <NotificationSimulatorModal
        isOpen={isNotifModalOpen}
        onClose={() => setIsNotifModalOpen(false)}
      />
    </div>
  );
}
