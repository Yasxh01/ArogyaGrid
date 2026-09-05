import React from 'react';
import { useAuth, PRESET_USERS } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Activity, Wifi, WifiOff, Bot, RefreshCw, ChevronDown, LogOut, Cpu, MapPin } from 'lucide-react';

export default function Navbar({ onOpenCopilot, onOpenVoice, onOpenExplainer, activeTab, setActiveTab, pendingCount, onSyncPending }) {
  const { user, switchRole, logout } = useAuth();
  const { isOnline } = useSocket();

  function getTabsForRole(role) {
    if (role === 'ADMIN') {
      return [
        { id: 'dashboard', label: 'Formulary & Catalog' },
        { id: 'federated', label: 'Nationwide Federated AI' }
      ];
    }
    if (role === 'DISTRICT_OFFICER') {
      return [
        { id: 'dashboard', label: 'Command Map' },
        { id: 'transfers', label: 'Logistics & Escrow' },
        { id: 'stock', label: 'District Stock' },
        { id: 'beds', label: 'Bed Matrix' }
      ];
    }
    if (role === 'DOCTOR') {
      return [
        { id: 'dashboard', label: 'Clinical Beds' },
        { id: 'staff', label: 'Staff Roster' },
        { id: 'stock', label: 'Emergency Stock' }
      ];
    }
    return [
      { id: 'dashboard', label: 'Frontline Kiosk' },
      { id: 'stock', label: 'Stock Dispense' },
      { id: 'beds', label: 'Bed Status' }
    ];
  }

  const roleTabs = getTabsForRole(user?.role);

  return (
    <header className="bg-white/85 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/15">
              <Activity className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">Arogya<span className="text-emerald-600">Grid</span></span>
                <span className="px-2 py-0.5 text-[10px] font-extrabold tracking-wide uppercase bg-emerald-50 text-emerald-800 border border-emerald-200/60 rounded-full">
                  {user?.role === 'ADMIN' ? 'National Admin' : user?.role === 'DOCTOR' ? 'Medical Officer' : user?.role === 'DISTRICT_OFFICER' ? 'District Officer' : 'PHC Staff'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:flex items-center font-semibold">
                <MapPin className="w-3 h-3 mr-0.5 text-emerald-600" />
                {user?.phc_id ? `Assigned: ${user.phc_id}` : user?.district_id ? `Assigned: Ranchi District` : `National Network`}
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center p-1 bg-slate-100/90 rounded-xl border border-slate-200/50">
            {roleTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                  activeTab === tab.id
                    ? 'bg-white text-emerald-700 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center space-x-2.5">
            
            <div className="flex items-center">
              {isOnline ? (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Online
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200/60">
                  <WifiOff className="w-3 h-3 mr-1" /> Offline
                </span>
              )}
            </div>

            {pendingCount > 0 && (
              <button
                onClick={onSyncPending}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition-all"
              >
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Sync ({pendingCount})</span>
              </button>
            )}

            {(user?.role === 'ADMIN' || user?.role === 'DISTRICT_OFFICER') && (
              <button
                onClick={onOpenExplainer}
                className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/60 transition"
                title="Why Federated AI is essential"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>AI Info</span>
              </button>
            )}

            {(user?.role === 'PHC_STAFF' || user?.role === 'DOCTOR') && (
              <button
                onClick={onOpenVoice}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-sm transition-all"
                title="Speak in Hindi/English for quick voice intake"
              >
                <span>🎙️ Voice</span>
              </button>
            )}

            {user?.role === 'DISTRICT_OFFICER' && (
              <button
                onClick={onOpenCopilot}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/60 transition-all flex items-center justify-center"
                title="Open AI Copilot"
              >
                <Bot className="w-4 h-4 text-indigo-600" />
              </button>
            )}

            <div className="relative">
              <select
                value={user?.role}
                onChange={(e) => switchRole(e.target.value)}
                className="bg-slate-100 hover:bg-slate-200/80 border border-slate-200/60 text-xs font-bold rounded-xl pl-2.5 pr-6 py-1.5 text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer appearance-none"
              >
                {PRESET_USERS.map((u, i) => (
                  <option key={i} value={u.role}>
                    👤 {u.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
            </div>

            <button
              onClick={logout}
              className="p-2 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200/60 transition"
              title="Sign Out / Back to Login Portal"
            >
              <LogOut className="w-4 h-4" />
            </button>

          </div>
        </div>
      </div>
    </header>
  );
}
