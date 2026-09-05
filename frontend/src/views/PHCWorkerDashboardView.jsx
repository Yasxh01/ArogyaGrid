import React from 'react';
import StockManager from '../components/StockManager';
import BedMatrix from '../components/BedMatrix';
import { Pill, Mic, Wifi, WifiOff, RefreshCw, Sparkles, Bed } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

export default function PHCWorkerDashboardView({ activeTab, onOpenVoice, pendingCount, onSyncPending }) {
  const { isOnline } = useSocket();
  const { user } = useAuth();
  const phcId = user?.phc_id || 'PHC-RAN-01';

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
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-sm inline-block mb-2">
            🏥 {phcId} Frontline Touch Kiosk
          </span>
          <h2 className="text-2xl sm:text-3xl font-black">Daily Medicine & Patient Intake</h2>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1">Tap the microphone to record in Hindi or log manual transactions below.</p>
        </div>

        <button
          onClick={onOpenVoice}
          className="px-6 py-3.5 bg-white hover:bg-emerald-50 text-emerald-800 font-black rounded-2xl text-sm transition shadow-md flex items-center space-x-2 shrink-0 transform active:scale-95"
        >
          <Mic className="w-5 h-5 text-emerald-600" />
          <span>🎙️ बोलकर दर्ज करें (Hindi Voice)</span>
        </button>
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

    </div>
  );
}
