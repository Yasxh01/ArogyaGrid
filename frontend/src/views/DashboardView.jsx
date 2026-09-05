import React, { useState } from 'react';
import StatsBanner from '../components/StatsBanner';
import MapView from '../components/MapView';
import StockManager from '../components/StockManager';
import BedMatrix from '../components/BedMatrix';
import StaffRoster from '../components/StaffRoster';
import TransferDashboard from '../components/TransferDashboard';
import FederatedCenter from '../components/FederatedCenter';

export default function DashboardView({ activeTab, setActiveTab }) {
  const [selectedPHC, setSelectedPHC] = useState('PHC-RAN-01');

  function handleQuickTransfer(phcId) {
    setSelectedPHC(phcId);
    setActiveTab('transfers');
  }

  if (activeTab === 'stock') return <StockManager selectedPHC={selectedPHC} />;
  if (activeTab === 'beds') return <BedMatrix selectedPHC={selectedPHC} />;
  if (activeTab === 'staff') return <StaffRoster selectedPHC={selectedPHC} />;
  if (activeTab === 'transfers') return <TransferDashboard />;
  if (activeTab === 'federated') return <FederatedCenter />;

  return (
    <div className="space-y-6">
      <StatsBanner />
      <MapView onSelectPHC={(id) => setSelectedPHC(id)} onQuickTransfer={handleQuickTransfer} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StockManager selectedPHC={selectedPHC} />
        <BedMatrix selectedPHC={selectedPHC} />
        <StaffRoster selectedPHC={selectedPHC} />
      </div>
    </div>
  );
}
