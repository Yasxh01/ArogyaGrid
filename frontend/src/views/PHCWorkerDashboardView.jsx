import React, { useState } from 'react';
import StockManager from '../components/StockManager';
import BedMatrix from '../components/BedMatrix';
import ChallanScannerModal from '../components/ChallanScannerModal';
import { Pill, Mic, Wifi, WifiOff, RefreshCw, Sparkles, Bed, Camera } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

export default function PHCWorkerDashboardView({ activeTab, onOpenVoice, pendingCount, onSyncPending }) {
  const { isOnline } = useSocket();
  const { user } = useAuth();
  const phcId = user?.phc_id || 'PHC-RAN-01';
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  if (activeTab === 'stock') {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-black text-lg text-slate-900">Frontline Stock Dispense & Inventory</h2>
              <p className="text-xs text-slate-500 font-medium">Assigned Facility: {phcId} &bull; Log daily medicine consumption & patient dispensing</p>
            </div>
          </div>
        </div>
        <StockManager selectedPHC={phcId} />
      </div>
    );
  }

  if (activeTab === 'beds') {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600">
              <Bed className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-black text-lg text-slate-900">PHC Bed Capacity & Occupancy Status</h2>
              <p className="text-xs text-slate-500 font-medium">Assigned Facility: {phcId} &bull; Monitor real-time ward availability</p>
            </div>
          </div>
        </div>
        <BedMatrix selectedPHC={phcId} />
      </div>
    );
  }

  // Default 'dashboard' (Frontline Kiosk Mode)
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Big Kiosk Action Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 mb-2 flex-wrap gap-y-1">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-sm inline-block">
              🏥 {phcId} Frontline Touch Kiosk
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-900/40 text-emerald-100 border border-emerald-400/30">
              👤 {user?.name || 'Frontline Staff'}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black">Daily Medicine & Patient Intake</h2>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1">
            Logged in as <span className="font-semibold text-white">{user?.email || 'staff@arogyagrid.gov.in'}</span> &bull; Tap Hindi voice or scan paper challans below.
          </p>
        </div>

        {/* Quick Kiosk Actions: Gemini Vision Scan + Hindi Voice */}
        <div className="flex items-center space-x-3 flex-wrap gap-y-2 shrink-0">
          <button
            onClick={() => setIsScannerOpen(true)}
            className="px-5 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl text-xs sm:text-sm transition shadow-md flex items-center space-x-2 transform active:scale-95"
          >
            <Camera className="w-5 h-5 text-indigo-200" />
            <span>📷 Scan Delivery Challan</span>
          </button>

          <button
            onClick={onOpenVoice}
            className="px-5 py-3.5 bg-white hover:bg-emerald-50 text-emerald-800 font-black rounded-2xl text-xs sm:text-sm transition shadow-md flex items-center space-x-2 transform active:scale-95"
          >
            <Mic className="w-5 h-5 text-emerald-600" />
            <span>🎙️ बोलकर दर्ज करें (Hindi)</span>
          </button>
        </div>
      </div>

      {/* Offline Status Card */}
      {!isOnline && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs text-amber-900 font-bold">
          <div className="flex items-center space-x-2">
            <WifiOff className="w-5 h-5 text-amber-600" />
            <span>Operating in Offline Resilient Mode. All transactions are saved safely in your device storage.</span>
          </div>
          {pendingCount > 0 && (
            <button
              onClick={onSyncPending}
              className="px-3 py-1.5 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition"
            >
              Sync Queue ({pendingCount})
            </button>
          )}
        </div>
      )}

      {/* Medicine & Bed Intake Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StockManager selectedPHC={phcId} />
        <BedMatrix selectedPHC={phcId} />
      </div>

      {/* Challan Scanner Modal */}
      <ChallanScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        phcId={phcId}
        onStockIngested={() => {
          window.dispatchEvent(new Event('stock:updated'));
        }}
      />
    </div>
  );
}
