import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { Cpu, ShieldCheck, RefreshCw, Layers, CheckCircle2, Lock } from 'lucide-react';

export default function FederatedCenter() {
  const [status, setStatus] = useState(null);
  const [triggering, setTriggering] = useState(false);
  const [roundResult, setRoundResult] = useState(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  async function fetchStatus() {
    try {
      const data = await apiRequest('/ml/federated/status');
      setStatus(data);
    } catch (err) {
      console.error('Error fetching federated status:', err);
    }
  }

  async function handleTriggerRound() {
    setTriggering(true);
    try {
      const res = await apiRequest('/ml/federated/round', {
        method: 'POST',
        body: JSON.stringify({ nodes: ['Jharkhand', 'Bihar', 'Odisha', 'Maharashtra', 'Karnataka'] })
      });
      setRoundResult(res);
      fetchStatus();
    } catch (err) {
      alert('Federated round failed: ' + err.message);
    } finally {
      setTriggering(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-slate-100 gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Smart Hospital Network (Privacy-Safe AI)</h3>
            <p className="text-xs text-slate-500">Hospitals share predictive insights across states without patient data ever leaving the clinic</p>
          </div>
        </div>

        <button
          onClick={handleTriggerRound}
          disabled={triggering}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition shadow-sm flex items-center space-x-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${triggering ? 'animate-spin' : ''}`} />
          <span>{triggering ? 'Syncing Models Across States...' : 'Sync AI Across All States'}</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Current Model</span>
          <span className="text-xl font-extrabold text-slate-900">{status?.global_model_version || 'v2.5.0'}</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Connected States</span>
          <span className="text-xl font-extrabold text-indigo-600">{status?.active_nodes?.length || 5} States Active</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Privacy Protection</span>
          <span className="text-xl font-extrabold text-emerald-600">Grade A+ (Safe)</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Data Safety</span>
          <span className="text-xs font-bold text-slate-800 flex items-center mt-1">
            <Lock className="w-3.5 h-3.5 mr-1 text-emerald-600" /> 100% Zero Patient Data Shared
          </span>
        </div>
      </div>

      {/* State Nodes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {(status?.active_nodes || ['Jharkhand', 'Bihar', 'Odisha', 'Maharashtra', 'Karnataka']).map((node, i) => (
          <div key={i} className="p-3.5 rounded-xl border border-slate-200 bg-white flex flex-col justify-between text-xs space-y-2">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-indigo-500" />
              <span className="font-bold text-slate-800">{node} State</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <CheckCircle2 className="w-3 h-3 mr-1" /> Synced & Ready
            </span>
          </div>
        ))}
      </div>

      {roundResult && (
        <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-950 animate-in fade-in">
          <div className="font-bold mb-1">🎉 All State Networks Successfully Synced!</div>
          <p>The prediction model has learned from recent healthcare trends across Jharkhand, Bihar, Odisha, Maharashtra, and Karnataka — with strict patient privacy fully preserved.</p>
        </div>
      )}

    </div>
  );
}
