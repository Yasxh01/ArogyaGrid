import React, { useState } from 'react';
import { useAuth, PRESET_USERS } from '../context/AuthContext';
import { 
  Map, 
  Thermometer, 
  Truck, 
  Package, 
  Bed, 
  Network, 
  BarChart3, 
  Users, 
  Activity, 
  ChevronDown, 
  User, 
  ChevronRight,
  ShieldCheck,
  Home
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { user, switchRole } = useAuth();
  const [isHovered, setIsHovered] = useState(false);

  function getTabsForRole(role) {
    if (role === 'ADMIN') {
      return [
        { id: 'dashboard', label: 'Medicine Catalog', icon: Package, desc: 'National Drug Formulary' },
        { id: 'abdm', label: 'Govt Portals & ABHA', icon: Network, desc: 'National Health APIs' },
        { id: 'xai', label: 'AI Health Forecasts', icon: BarChart3, desc: 'Epidemic Models & SHAP' }
      ];
    }
    if (role === 'DISTRICT_OFFICER') {
      return [
        { id: 'dashboard', label: 'Live Map', icon: Map, desc: 'Surveillance & Drone Telemetry' },
        { id: 'coldchain', label: 'Vaccine Fridges', icon: Thermometer, desc: '2°C–8°C Thermal Sensors' },
        { id: 'transfers', label: 'Send Medicines', icon: Truck, desc: 'Inter-Facility & Airway' },
        { id: 'stock', label: 'Medicine Stock', icon: Package, desc: 'FEFO Expiry & Shortages' },
        { id: 'beds', label: 'Hospital Beds', icon: Bed, desc: 'Capacity & Occupancy Matrix' },
        { id: 'abdm', label: 'Govt Portals & ABHA', icon: Network, desc: 'MoHFW Registry & Sync' },
        { id: 'xai', label: 'AI Forecasts', icon: BarChart3, desc: 'Explainable AI Surges' }
      ];
    }
    if (role === 'DOCTOR') {
      return [
        { id: 'dashboard', label: 'Hospital Beds', icon: Bed, desc: 'Patient Admissions & Wards' },
        { id: 'staff', label: 'Duty Roster', icon: Users, desc: 'Doctor & Nursing Shifts' },
        { id: 'stock', label: 'Emergency Medicines', icon: Package, desc: 'Critical Drug Inventory' }
      ];
    }
    return [
      { id: 'dashboard', label: 'Frontline Counter', icon: Activity, desc: 'Quick Voice Dispensing' },
      { id: 'stock', label: 'Give Medicines', icon: Package, desc: 'Stock Issuance & Intake' },
      { id: 'beds', label: 'Bed Status', icon: Bed, desc: 'Ward Check & Triage' }
    ];
  }

  const roleTabs = getTabsForRole(user?.role);

  return (
    <>
      {/* Sidebar Rail: Resting at w-16, Smoothly Expands to w-64 purely on hover like Unstop */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`fixed top-0 bottom-0 left-0 z-40 bg-white border-r border-slate-200/80 transition-all duration-300 ease-in-out flex flex-col select-none ${
          isHovered 
            ? 'w-64 shadow-2xl' 
            : 'w-16 shadow-2xs'
        }`}
      >
        <div className="flex-1 flex flex-col pt-3 pb-4 overflow-y-auto overflow-x-hidden no-scrollbar">
          
          {/* Top Role Selector Card (Matching Image 2 / Image 3) */}
          <div className="px-2 mb-2">
            {isHovered ? (
              <div className="bg-gradient-to-b from-blue-50/90 to-indigo-50/60 border border-blue-200/70 rounded-2xl p-3 animate-in fade-in duration-200 shadow-2xs">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>You're viewing as</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                </p>
                <div className="relative">
                  <select
                    value={user?.role}
                    onChange={(e) => {
                      switchRole(e.target.value);
                      setIsHovered(false);
                    }}
                    className="w-full bg-white border border-blue-200 text-xs font-extrabold text-slate-800 rounded-xl pl-8 pr-7 py-2 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer appearance-none shadow-2xs truncate"
                  >
                    {PRESET_USERS.map((u, i) => (
                      <option key={i} value={u.role}>
                        {u.label}
                      </option>
                    ))}
                  </select>
                  <div className="w-5 h-5 rounded-lg bg-indigo-500 text-white flex items-center justify-center absolute left-2 top-2 pointer-events-none">
                    <User className="w-3 h-3" />
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              </div>
            ) : (
              /* Collapsed Avatar Pill (Centered without arrow) */
              <div className="flex justify-center">
                <div
                  title={`Viewing as: ${user?.role}`}
                  className="w-11 h-11 rounded-2xl bg-blue-50 hover:bg-blue-100 border border-blue-200/80 flex items-center justify-center text-blue-600 transition shadow-2xs cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-xl bg-indigo-500 text-white flex items-center justify-center shadow-xs">
                    <User className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section Divider */}
          <div className="px-2.5 mb-2">
            <div className="border-t border-slate-100" />
            {isHovered && (
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 pt-2 animate-in fade-in">
                Dashboards & Views
              </p>
            )}
          </div>

          {/* Navigation Items (Cleanly aligned directly below avatar) */}
          <nav className="flex-1 px-2 space-y-1">
            {roleTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setIsHovered(false);
                  }}
                  title={!isHovered ? tab.label : undefined}
                  className={`w-full flex items-center rounded-xl transition-all duration-150 cursor-pointer ${
                    isHovered 
                      ? 'px-3 py-2.5 space-x-3 text-left' 
                      : 'p-2.5 justify-center'
                  } ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/80 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 font-semibold'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg shrink-0 transition ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-500'
                  }`}>
                    <Icon className="w-4 h-4 stroke-[2.2]" />
                  </div>

                  {isHovered && (
                    <div className="flex-1 min-w-0 animate-in fade-in duration-150">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold truncate">{tab.label}</span>
                        {isActive && (
                          <ChevronRight className="w-3 h-3 text-emerald-600 shrink-0" />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                        {tab.desc}
                      </p>
                    </div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom Compliance Tag (only when hovered) */}
          {isHovered && (
            <div className="p-2.5 mx-2 mt-auto bg-slate-50 rounded-xl border border-slate-100 text-[10px] text-slate-500 flex items-center space-x-2 animate-in fade-in">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">ABDM M3 & DPDP Compliant</span>
            </div>
          )}

        </div>
      </aside>
    </>
  );
}
