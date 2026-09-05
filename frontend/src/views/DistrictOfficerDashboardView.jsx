import React, { useState } from 'react';
import StatsBanner from '../components/StatsBanner';
import MapView from '../components/MapView';
import TransferDashboard from '../components/TransferDashboard';
import StockManager from '../components/StockManager';
import BedMatrix from '../components/BedMatrix';

export default function DistrictOfficerDashboardView({ activeTab, setActiveTab }) {
  const [selectedPHC, setSelectedPHC] = useState('PHC-RAN-03');

  function handleQuickTransfer(phcId) {
    setSelectedPHC(phcId);
    setActiveTab('transfers');
  }

  if (activeTab === 'transfers') {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <TransferDashboard />
      </div>
    );
  }

  if (activeTab === 'stock') {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <StockManager selectedPHC={selectedPHC} />
      </div>
    );
  }

  if (activeTab === 'beds') {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <BedMatrix selectedPHC={selectedPHC} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <StatsBanner />
      <MapView onSelectPHC={(id) => setSelectedPHC(id)} onQuickTransfer={handleQuickTransfer} />
    </div>
  );
}
