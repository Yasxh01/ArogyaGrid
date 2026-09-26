import React, { useState, useEffect } from 'react';
import { Building2, AlertTriangle, BedDouble, Users2, ShieldCheck } from 'lucide-react';
import { apiRequest } from '../api/client';
import { useSocket } from '../context/SocketContext';

export default function StatsBanner({ districtId = 'DIST-JH-01' }) {
  const { on, off } = useSocket();
  const [stats, setStats] = useState({
    monitored_phcs_count: 5,
    critical_stockouts_count: 2,
    bed_utilization_percentage: 71,
    active_staff_count: 14,
    vaccine_coldchain_status: '2°C–8°C Safe'
  });

  useEffect(() => {
    fetchStats();
  }, [districtId]);

  useEffect(() => {
    const handleUpdate = () => {
      fetchStats();
    };

    on('stock:updated', handleUpdate);
    on('beds:updated', handleUpdate);
    on('staff:updated', handleUpdate);
    on('alert:critical', handleUpdate);

    return () => {
      off('stock:updated', handleUpdate);
      off('beds:updated', handleUpdate);
      off('staff:updated', handleUpdate);
      off('alert:critical', handleUpdate);
    };
  }, [districtId, on, off]);

  async function fetchStats() {
    try {
      const data = await apiRequest(`/districts/${districtId}/stats`);
      if (data) {
        setStats(data);
      }
    } catch (err) {
      console.warn('Could not fetch dynamic district stats, using default fallback:', err);
    }
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      
      {/* Monitored Facilities */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center space-x-3 transition hover:border-slate-300">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100/60">
          <Building2 className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">Facilities Monitored</p>
          <p className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-tight mt-0.5">
            {stats.monitored_phcs_count} <span className="text-xs font-semibold text-slate-500">Centres</span>
          </p>
        </div>
      </div>

      {/* Shortage Alerts */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center space-x-3 transition hover:border-slate-300">
        <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100/60">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">Shortage Alerts</p>
          <p className="text-base sm:text-lg font-extrabold text-rose-600 tracking-tight leading-tight mt-0.5">
            {stats.critical_stockouts_count} <span className="text-xs font-semibold text-rose-500">Restock</span>
          </p>
        </div>
      </div>

      {/* Bed Utilization */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center space-x-3 transition hover:border-slate-300">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100/60">
          <BedDouble className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">Hospital Beds</p>
          <p className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-tight mt-0.5">
            {stats.bed_utilization_percentage}% <span className="text-xs font-semibold text-slate-500">Occupied</span>
          </p>
        </div>
      </div>

      {/* Staff on Duty */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center space-x-3 transition hover:border-slate-300">
        <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 border border-teal-100/60">
          <Users2 className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">Healthcare Staff</p>
          <p className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-tight mt-0.5">
            {stats.active_staff_count} <span className="text-xs font-semibold text-slate-500">on Duty</span>
          </p>
        </div>
      </div>

      {/* Vaccine Cold-Chain */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs col-span-2 sm:col-span-1 lg:col-span-1 flex items-center space-x-3 transition hover:border-slate-300">
        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100/60">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">Vaccine Cold-Chain</p>
          <p className="text-base sm:text-lg font-extrabold text-purple-700 tracking-tight leading-tight mt-0.5 truncate">
            {stats.vaccine_coldchain_status || '2°C–8°C Safe'}
          </p>
        </div>
      </div>

    </div>
  );
}
