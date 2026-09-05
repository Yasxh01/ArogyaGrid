import React, { useState } from 'react';
import StatsBanner from '../components/StatsBanner';
import MapView from '../components/MapView';
import TransferDashboard from '../components/TransferDashboard';
import StockManager from '../components/StockManager';
import BedMatrix from '../components/BedMatrix';
import { useAuth } from '../context/AuthContext';
import { Map, ShieldCheck } from 'lucide-react';

export default function DistrictOfficerDashboardView({ activeTab, setActiveTab }) {
  const { user } = useAuth();
  const [selectedPHC, setSelectedPHC] = useState('PHC-RAN-03');

  function handleQuickTransfer(phcId) {
    setSelectedPHC(phcId);
    setActiveTab('transfers');
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Officer Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-teal-50 text-teal-600 shrink-0">
            <Map className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap">
              <h2 className="font-black text-lg text-slate-900">District Health Command Console</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
                👤 {user?.name || 'Ranchi District Officer'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">District: {user?.district_id || 'DIST-JH-01'} &bull; Logged in as <span className="font-semibold text-slate-700">{user?.email || 'district.ranchi@arogyagrid.gov.in'}</span></p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-auto flex items-center space-x-1">
          <ShieldCheck className="w-3.5 h-3.5 mr-1" />
          <span>District Escrow Active</span>
        </span>
      </div>

      <StatsBanner />

      {activeTab === 'transfers' && <TransferDashboard />}
      {activeTab === 'stock' && <StockManager selectedPHC={selectedPHC} />}
      {activeTab === 'beds' && <BedMatrix selectedPHC={selectedPHC} />}
      {(!activeTab || activeTab === 'dashboard') && (
        <MapView onSelectPHC={(id) => setSelectedPHC(id)} onQuickTransfer={handleQuickTransfer} />
      )}
    </div>
  );
}
