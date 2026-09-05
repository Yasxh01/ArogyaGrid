import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider, useSocket } from './context/SocketContext';
import Navbar from './components/Navbar';
import AuthPortalView from './views/AuthPortalView';
import AdminDashboardView from './views/AdminDashboardView';
import DistrictOfficerDashboardView from './views/DistrictOfficerDashboardView';
import DoctorDashboardView from './views/DoctorDashboardView';
import PHCWorkerDashboardView from './views/PHCWorkerDashboardView';
import VoiceIntakeModal from './components/VoiceIntakeModal';
import AICopilotDrawer from './components/AICopilotDrawer';
import FederatedExplainerModal from './components/FederatedExplainerModal';
import { getPendingTransactions, clearPendingTransactions } from './api/offlineQueue';
import { apiRequest } from './api/client';
import { ShieldAlert, X } from 'lucide-react';

function AppContent() {
  const { user, loading } = useAuth();
  const { alerts, dismissAlert } = useSocket();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isExplainerOpen, setIsExplainerOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    checkOfflineQueue();
  }, []);

  useEffect(() => {
    setActiveTab('dashboard');
  }, [user?.role]);

  async function checkOfflineQueue() {
    const list = await getPendingTransactions();
    setPendingCount(list.length);
  }

  async function handleSyncPending() {
    const list = await getPendingTransactions();
    if (list.length === 0) return;

    try {
      await apiRequest('/telemetry/intake', {
        method: 'POST',
        body: JSON.stringify({ transactions: list })
      });
      await clearPendingTransactions(list.map(t => t.transaction_uuid));
      setPendingCount(0);
      alert(`Successfully synchronized ${list.length} offline transactions!`);
    } catch (err) {
      alert('Sync failed: ' + err.message);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-bold text-sm">
        Initializing ArogyaGrid...
      </div>
    );
  }

  if (!user) {
    return <AuthPortalView />;
  }

  function renderRoleDashboard() {
    if (user.role === 'ADMIN') {
      return <AdminDashboardView activeTab={activeTab} />;
    }
    if (user.role === 'DOCTOR') {
      return <DoctorDashboardView activeTab={activeTab} />;
    }
    if (user.role === 'PHC_STAFF') {
      return (
        <PHCWorkerDashboardView
          activeTab={activeTab}
          onOpenVoice={() => setIsVoiceOpen(true)}
          pendingCount={pendingCount}
          onSyncPending={handleSyncPending}
        />
      );
    }
    return (
      <DistrictOfficerDashboardView
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenVoice={() => setIsVoiceOpen(true)}
        onOpenCopilot={() => setIsCopilotOpen(true)}
        onOpenExplainer={() => setIsExplainerOpen(true)}
        pendingCount={pendingCount}
        onSyncPending={handleSyncPending}
      />

      {alerts.length > 0 && (
        <div className="bg-rose-600 text-white px-4 py-2.5 shadow-md flex items-center justify-between text-xs font-bold animate-in slide-in-from-top">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 animate-bounce" />
            <span>
              CRITICAL HEALTH ALERT: {alerts[0].phc_id} ({alerts[0].resource_type || 'RESOURCE'}) - {alerts[0].risk_level} Risk Level detected!
            </span>
          </div>
          <button onClick={() => dismissAlert(0)} className="p-1 hover:bg-rose-700 rounded transition">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderRoleDashboard()}
      </main>

      <VoiceIntakeModal isOpen={isVoiceOpen} onClose={() => setIsVoiceOpen(false)} />
      <AICopilotDrawer isOpen={isCopilotOpen} onClose={() => setIsCopilotOpen(false)} />
      <FederatedExplainerModal isOpen={isExplainerOpen} onClose={() => setIsExplainerOpen(false)} />

      <footer className="border-t border-slate-200/80 bg-white py-4 text-center text-xs text-slate-500 font-medium">
        ArogyaGrid Platform &bull; Role-Based Health Logistics & Resilient AI Network
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <AppContent />
      </SocketProvider>
    </AuthProvider>
  );
}
