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
        className={`fixed top-0 bottom-0 left-0 z-40 bg-white border-r border-slate-200/80 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col select-none will-change-[width,box-shadow] ${
          isHovered 
            ? 'w-64 shadow-2xl' 
            : 'w-16 shadow-2xs'
        }`}
      >
        <div className="flex-1 flex flex-col pt-3 pb-4 overflow-y-auto overflow-x-hidden no-scrollbar">
          
          {/* Top Role Selector Card */}
          <div className="px-2 mb-2">
            <div className={`rounded-2xl border transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${
              isHovered 
                ? 'p-2.5 bg-gradient-to-b from-blue-50/90 to-indigo-50/60 border-blue-200/70 shadow-2xs' 
                : 'p-1.5 bg-blue-50/60 border-blue-200/60'
            }`}>
              {/* Header Label: You're viewing as */}
              <div className={`transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${
                isHovered ? 'max-h-6 opacity-100 mb-1.5' : 'max-h-0 opacity-0 mb-0 pointer-events-none'
              }`}>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between whitespace-nowrap">
                  <span>You're viewing as</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                </p>
              </div>

              {/* Selector Row */}
              <div className="flex items-center">
                <div 
                  title={!isHovered ? `Viewing as: ${PRESET_USERS.find(u => u.role === user?.role)?.label || user?.role}` : undefined}
                  className="w-9 h-9 rounded-xl bg-indigo-500 text-white flex items-center justify-center shrink-0 shadow-xs cursor-pointer"
                >
                  <User className="w-4 h-4" />
                </div>

                <div className={`ml-2 flex-1 min-w-0 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${
                  isHovered ? 'opacity-100 max-w-[180px] translate-x-0' : 'opacity-0 max-w-0 -translate-x-3 pointer-events-none'
                }`}>
                  <div className="relative">
                    <select
                      value={user?.role}
                      onChange={(e) => {
                        switchRole(e.target.value);
                        setIsHovered(false);
                      }}
                      className="w-full bg-white border border-blue-200 text-xs font-extrabold text-slate-800 rounded-xl pl-2.5 pr-6 py-1.5 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer appearance-none shadow-2xs truncate"
                    >
                      {PRESET_USERS.map((u, i) => (
                        <option key={i} value={u.role}>
                          {u.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section Divider */}
          <div className="px-2.5 mb-2">
            <div className="border-t border-slate-100" />
            <div className={`overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isHovered ? 'max-h-6 opacity-100 pt-2' : 'max-h-0 opacity-0 pt-0 pointer-events-none'
            }`}>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1.5 whitespace-nowrap">
                Dashboards & Views
              </p>
            </div>
          </div>

          {/* Navigation Items */}
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
                  className={`w-full flex items-center h-12 px-1.5 rounded-xl transition-all duration-200 cursor-pointer text-left group ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/80 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 font-semibold border border-transparent'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-200 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-500 group-hover:text-slate-800'
                  }`}>
                    <Icon className="w-4.5 h-4.5 stroke-[2.2]" />
                  </div>

                  <div className={`ml-2.5 flex-1 min-w-0 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] whitespace-nowrap overflow-hidden ${
                    isHovered 
                      ? 'opacity-100 max-w-[175px] translate-x-0' 
                      : 'opacity-0 max-w-0 -translate-x-3 pointer-events-none'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold truncate text-slate-900">{tab.label}</span>
                      {isActive && (
                        <ChevronRight className="w-3 h-3 text-emerald-600 shrink-0 ml-1" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">
                      {tab.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Bottom Compliance Tag */}
          <div className={`mx-2 mt-auto overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isHovered ? 'max-h-12 opacity-100 translate-y-0' : 'max-h-0 opacity-0 translate-y-2 pointer-events-none'
          }`}>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[10px] text-slate-500 flex items-center space-x-2 whitespace-nowrap">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">ABDM M3 & DPDP Compliant</span>
            </div>
          </div>

        </div>
      </aside>
    </>
  );
}
