import React, { useState, useEffect } from 'react';
import StatsBanner from '../components/StatsBanner';
import MapView from '../components/MapView';
import TransferDashboard from '../components/TransferDashboard';
import StockManager from '../components/StockManager';
import BedMatrix from '../components/BedMatrix';
import ColdChainTelemetryView from '../components/ColdChainTelemetryView';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../api/client';
import { 
  Map, 
  ShieldCheck, 
  Thermometer, 
  Truck, 
  Package, 
  Bed, 
  Globe 
} from 'lucide-react';

export default function DistrictOfficerDashboardView({ activeTab, setActiveTab }) {
  const { user } = useAuth();
  const [selectedPHC, setSelectedPHC] = useState('PHC-RAN-01');
  const [districts, setDistricts] = useState([]);
  const [selectedDistrictId, setSelectedDistrictId] = useState(user?.district_id || 'DIST-JH-01');
  const [internalTab, setInternalTab] = useState('map');

  useEffect(() => {
    fetchDistricts();
  }, []);

  async function fetchDistricts() {
    try {
      const data = await apiRequest('/districts');
      setDistricts(data.districts || []);
    } catch (err) {
      console.error('Failed to load districts:', err);
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
              <h2 className="font-black text-lg text-slate-900">District Health Command Console</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
                👤 {user?.name || 'District Health Officer'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Nationwide Multi-Tier Grid &bull; Currently commanding <span className="font-bold text-slate-800">{currentDistrict.name}</span> ({currentDistrict.state})
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

          <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1 shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" />
            <span>DPDP Verified</span>
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
          <span>GIS Command Map</span>
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
          <span>Cold-Chain IoT Hub</span>
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
          <span>Logistics Escrow Transfers</span>
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
          <span>NLEM Stock & Batches</span>
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
          <span>Clinical Bed Matrix</span>
        </button>
      </div>

      <StatsBanner />

      {effectiveTab === 'coldchain' && (
        <ColdChainTelemetryView districtId={selectedDistrictId} />
      )}

      {effectiveTab === 'transfers' && (
        <TransferDashboard />
      )}

      {effectiveTab === 'stock' && (
        <StockManager selectedPHC={selectedPHC} />
      )}

      {effectiveTab === 'beds' && (
        <BedMatrix selectedPHC={selectedPHC} />
      )}

      {(effectiveTab === 'map' || effectiveTab === 'dashboard') && (
        <MapView 
          districtId={selectedDistrictId}
          onSelectPHC={(id) => setSelectedPHC(id)} 
          onQuickTransfer={handleQuickTransfer} 
        />
      )}
    </div>
  );
}
