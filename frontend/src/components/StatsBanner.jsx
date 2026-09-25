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
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 mb-6">
      
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-3 transition hover:shadow-md">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Clinics Monitored</p>
          <p className="text-lg font-extrabold text-slate-900">{stats.monitored_phcs_count} Health Centres</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-3 transition hover:shadow-md">
        <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Shortage Alerts</p>
          <p className="text-lg font-extrabold text-rose-600">{stats.critical_stockouts_count} Need Restock</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-3 transition hover:shadow-md">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
          <BedDouble className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Hospital Beds</p>
          <p className="text-lg font-extrabold text-slate-900">{stats.bed_utilization_percentage}% Occupied</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-3 transition hover:shadow-md">
        <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
          <Users2 className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Healthcare Staff</p>
          <p className="text-lg font-extrabold text-slate-900">{stats.active_staff_count} on Duty</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm col-span-2 lg:col-span-1 flex items-center space-x-3 transition hover:shadow-md">
        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Vaccine Cold-Chain</p>
          <p className="text-lg font-extrabold text-purple-700">{stats.vaccine_coldchain_status || '2°C–8°C Safe'}</p>
        </div>
      </div>

    </div>
  );
}
