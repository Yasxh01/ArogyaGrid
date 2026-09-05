import React from 'react';
import { Building2, AlertTriangle, BedDouble, Users2, ShieldCheck } from 'lucide-react';

export default function StatsBanner() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 mb-6">
      
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <Building2 className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">PHCs Monitored</p>
          <p className="text-lg font-extrabold text-slate-900">7 Centres</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Critical Alerts</p>
          <p className="text-lg font-extrabold text-rose-600">2 Stockouts</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <BedDouble className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Bed Utilization</p>
          <p className="text-lg font-extrabold text-slate-900">73% Occupied</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
          <Users2 className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Active Staff</p>
          <p className="text-lg font-extrabold text-slate-900">18 on Duty</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm col-span-2 lg:col-span-1 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Federated AI</p>
          <p className="text-lg font-extrabold text-purple-700">v2.5.0 Synced</p>
        </div>
      </div>

    </div>
  );
}
