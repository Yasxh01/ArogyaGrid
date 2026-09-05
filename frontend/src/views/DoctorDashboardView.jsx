import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { HeartPulse, Bed, UserPlus, UserMinus, PlusCircle, AlertTriangle, ShieldCheck, Clock, Users, Pill } from 'lucide-react';
import StaffRoster from '../components/StaffRoster';
import StockManager from '../components/StockManager';
import { useAuth } from '../context/AuthContext';

export default function DoctorDashboardView({ activeTab }) {
  const { user } = useAuth();
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const phcId = user?.phc_id || 'PHC-RAN-01';

  useEffect(() => {
    fetchBeds();
  }, [phcId]);

  async function fetchBeds() {
    try {
      setLoading(true);
      const data = await apiRequest(`/beds/phc/${phcId}`);
      setBeds(data.beds || []);
    } catch (err) {
      console.error('Failed to load beds:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdmit(bedType) {
    try {
      setMessage(null);
      const res = await apiRequest('/beds/admit', {
        method: 'POST',
        body: JSON.stringify({ phc_id: phcId, bed_type: bedType, count: 1 })
      });
      setMessage({ type: 'success', text: `Admitted patient to ${bedType} bed!` });
      fetchBeds();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  }

  async function handleDischarge(bedType) {
    try {
      setMessage(null);
      const res = await apiRequest('/beds/discharge', {
        method: 'POST',
        body: JSON.stringify({ phc_id: phcId, bed_type: bedType, count: 1 })
      });
      setMessage({ type: 'success', text: `Discharged patient from ${bedType} bed!` });
      fetchBeds();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  }

  if (activeTab === 'staff') {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-black text-lg text-slate-900">Medical & Nursing Duty Roster</h2>
              <p className="text-xs text-slate-500 font-medium">Facility: {phcId} &bull; Check-in active shifts and duty verification</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            ● Staffing Synced
          </span>
        </div>
        <StaffRoster selectedPHC={phcId} />
      </div>
    );
  }

  if (activeTab === 'stock') {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-black text-lg text-slate-900">Clinical Emergency Drug Reserves</h2>
              <p className="text-xs text-slate-500 font-medium">Facility: {phcId} &bull; Emergency life-saving stocks and reorder levels</p>
            </div>
          </div>
        </div>
        <StockManager selectedPHC={phcId} />
      </div>
    );
  }

  // Default 'dashboard' (Clinical Beds Console)
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 shrink-0">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap">
              <h2 className="font-black text-lg text-slate-900">Medical Officer Clinical Console</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                👤 {user?.name || 'Dr. Priya Sharma'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Facility: {phcId} &bull; Logged in as <span className="font-semibold text-slate-700">{user?.email || 'doctor.ranchi@arogyagrid.gov.in'}</span></p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-auto">
          ● Clinical Duty Active
        </span>
      </div>

      {message && (
        <div className={`p-3 rounded-xl text-xs font-bold text-center ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Dynamic Bed Admission Console */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 flex items-center">
              <Bed className="w-5 h-5 mr-2 text-indigo-600" /> Dynamic Patient Bed Admitting & Discharge Console
            </h3>
            <p className="text-xs text-slate-500 font-medium">Admit patients in real time to update district triage gauges and emergency escalation.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {beds.map((b) => {
            const rate = Math.round((b.occupied_beds / Math.max(1, b.total_beds)) * 100);
            const isFull = b.occupied_beds >= b.total_beds;
            const isCritical = rate >= 85;

            return (
              <div key={b.id} className={`p-4 rounded-2xl border transition-all ${
                isCritical ? 'bg-rose-50/40 border-rose-200' : 'bg-slate-50/50 border-slate-200'
              }`}>
                <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-2">
                  <span>{b.bed_type} BEDS</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    isCritical ? 'bg-rose-200 text-rose-900' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {rate}%
                  </span>
                </div>

                <div className="flex items-baseline justify-between mb-3">
                  <span className="text-3xl font-black text-slate-900">{b.occupied_beds}</span>
                  <span className="text-xs text-slate-500 font-semibold">/ {b.total_beds} Total</span>
                </div>

                {/* Progress Meter */}
                <div className="w-full h-2 rounded-full bg-slate-200 mb-4 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isCritical ? 'bg-rose-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${rate}%` }}
                  ></div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleAdmit(b.bed_type)}
                    disabled={isFull}
                    className="py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition flex items-center justify-center space-x-1 disabled:opacity-40"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Admit</span>
                  </button>

                  <button
                    onClick={() => handleDischarge(b.bed_type)}
                    disabled={b.occupied_beds <= 0}
                    className="py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition flex items-center justify-center space-x-1 disabled:opacity-40"
                  >
                    <UserMinus className="w-3.5 h-3.5" />
                    <span>Discharge</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Staff Duty Roster Summary */}
      <StaffRoster selectedPHC={phcId} />

    </div>
  );
}
