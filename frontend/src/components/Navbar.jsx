import React, { useState } from 'react';
import { useAuth, getDistrictName } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { 
  Activity, 
  WifiOff, 
  RefreshCw, 
  LogOut, 
  Cloud, 
  User, 
  X,
  AlertTriangle
} from 'lucide-react';

export default function Navbar({ 
  onOpenCopilot, 
  onOpenVoice, 
  onOpenExplainer, 
  onOpenCloud, 
  activeTab, 
  setActiveTab, 
  pendingCount, 
  onSyncPending,
  onGoToLanding
}) {
  const { user, logout } = useAuth();
  const { isOnline } = useSocket();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  function getRoleBadge() {
    switch (user?.role) {
      case 'ADMIN':
        return { label: 'National Admin', icon: null, color: 'bg-purple-50 text-purple-800 border-purple-200' };
      case 'DOCTOR':
        return { label: 'Medical Officer', icon: '🩺', color: 'bg-sky-50 text-sky-800 border-sky-200' };
      case 'DISTRICT_OFFICER':
        return { label: 'District Officer', icon: '🛡️', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      default:
        return { label: 'PHC Staff', icon: '🏥', color: 'bg-teal-50 text-teal-800 border-teal-200' };
    }
  }

  const roleInfo = getRoleBadge();

  function handleLogoClick() {
    if (setActiveTab) {
      setActiveTab('dashboard');
    }
  }

  return (
    <>
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/90 sticky top-0 z-30 shadow-xs h-20 pl-16 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full">
            
            {/* Brand Logo & Platform Title (Tapping brings the 4-level own role dashboard) */}
            <div 
              onClick={() => setActiveTab && setActiveTab('dashboard')}
              className="flex items-center space-x-3.5 cursor-pointer group select-none"
              title={`Go to ${roleInfo.label} Dashboard`}
            >
              <img 
                src="/logo.jpg" 
                alt="ArogyaGrid Logo" 
                className="w-11 h-11 object-contain rounded-2xl shadow-sm border border-slate-200/80 bg-white p-0.5 transform group-hover:scale-105 transition shrink-0" 
              />

              <div className="flex flex-col">
                <div className="flex items-center space-x-2.5">
                  <span 
                    className="font-black text-xl tracking-tight text-slate-900 group-hover:text-emerald-700 transition"
                  >
                    Arogya<span className="text-emerald-600">Grid</span>
                  </span>
                  
                  {/* Role Pill */}
                  <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 text-xs font-black uppercase tracking-wider rounded-lg border shadow-2xs ${roleInfo.color}`}>
                    {roleInfo.icon && <span>{roleInfo.icon}</span>}
                    <span>{roleInfo.label}</span>
                  </span>
                </div>

                <div className="flex items-center space-x-2 mt-0.5 text-[11px] text-slate-500 font-medium">
                  <span className="hidden sm:inline">National Health Logistics & Resilient AI Network</span>
                  {user?.district_id && (
                    <span className="hidden md:inline-flex items-center text-slate-600 font-bold bg-slate-100 px-2 py-0.2 rounded-md border border-slate-200/70">
                      📍 {getDistrictName(user.district_id)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right Action & Utility Cluster (Clean layout without extra landing page button) */}
            <div className="flex items-center space-x-3 shrink-0">
              
              {/* Live Socket Status */}
              <div className="hidden sm:flex items-center">
                {isOnline ? (
                  <span className="inline-flex items-center px-2.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                    <span className="relative flex h-2 w-2 mr-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Online
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
                    <WifiOff className="w-3.5 h-3.5 mr-1.5" /> Offline
                  </span>
                )}
              </div>

              {/* Offline Pending Transactions Sync Button */}
              {pendingCount > 0 && (
                <button
                  onClick={onSyncPending}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-600 text-white shadow-xs transition-all cursor-pointer animate-pulse"
                >
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Sync ({pendingCount})</span>
                </button>
              )}

              {/* Demand & Supply Intelligence Modal Button */}
              <button
                onClick={onOpenCloud}
                className="flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 border border-blue-200/90 shadow-2xs transition cursor-pointer"
                title="Inspect AI Demand & Supply Intelligence Console"
              >
                <Cloud className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="hidden sm:inline font-black">Demand & Supply</span>
                <span className="hidden xl:inline text-blue-500 font-semibold">Intelligence</span>
              </button>

              {/* User Profile Capsule */}
              <div className="hidden lg:flex items-center space-x-2 pl-2 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs shadow-2xs">
                  {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                </div>
                <div className="text-left text-xs leading-tight">
                  <p className="font-extrabold text-slate-800 truncate max-w-[120px]">{user?.name || 'User'}</p>
                  <p className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">{user?.email}</p>
                </div>
              </div>

              {/* Sign Out Button (Opens Confirmation Modal) */}
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="p-2.5 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200/80 hover:border-rose-200 transition cursor-pointer shadow-2xs"
                title="Sign Out"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>

            </div>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Popup Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 text-center relative">
            
            <button
              onClick={() => setShowLogoutConfirm(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-13 h-13 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3.5 border border-rose-100 shadow-sm">
              <LogOut className="w-6 h-6 stroke-[2.5]" />
            </div>

            <h3 className="font-black text-slate-900 text-lg mb-1">
              Do you want to log out?
            </h3>
            
            <p className="text-xs text-slate-500 font-medium mb-6 leading-relaxed">
              Are you sure you want to end your <span className="font-bold text-slate-700">{roleInfo.label}</span> session?
            </p>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  logout();
                }}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-black text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/25 transition cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Yes, Log Out</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
