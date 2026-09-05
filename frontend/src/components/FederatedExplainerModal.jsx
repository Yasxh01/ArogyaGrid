import React from 'react';
import { X, ShieldCheck, Lock, Cpu, Network, Database, CheckCircle2, Zap } from 'lucide-react';

export default function FederatedExplainerModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600">
            <Cpu className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-extrabold text-xl text-slate-900">Why Federated AI is Essential</h3>
            <p className="text-xs text-slate-500 font-medium">Privacy-Preserving Machine Learning for India's Healthcare Network</p>
          </div>
        </div>

        {/* Architecture Visual */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-slate-50 to-emerald-50/40 border border-indigo-100/80 mb-6 text-xs">
          <div className="font-bold text-slate-800 mb-3 flex items-center justify-between">
            <span>Federated Aggregation Pipeline (FedAvg + Differential Privacy):</span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-extrabold">DPDP Act 2023 Compliant</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center mb-3">
            <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
              <span className="font-extrabold text-slate-900 block">Bihar State Node</span>
              <span className="text-[10px] text-slate-500">Trains on Patna & Gaya data</span>
              <span className="inline-block mt-1 text-[10px] font-bold text-indigo-600">Local Gradient ΔW₁</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
              <span className="font-extrabold text-slate-900 block">Jharkhand State Node</span>
              <span className="text-[10px] text-slate-500">Trains on Ranchi & Dhanbad</span>
              <span className="inline-block mt-1 text-[10px] font-bold text-indigo-600">Local Gradient ΔW₂</span>
            </div>
            <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm">
              <span className="font-extrabold text-slate-900 block">Odisha State Node</span>
              <span className="text-[10px] text-slate-500">Trains on Khordha & Cuttack</span>
              <span className="inline-block mt-1 text-[10px] font-bold text-indigo-600">Local Gradient ΔW₃</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-indigo-600 text-white text-center font-bold">
            Central Coordinator aggregates weights: <span className="font-mono text-emerald-200">W_global = FedAvg(ΔW) + Laplace(ε=1.0)</span>
          </div>
        </div>

        {/* Core Pillars */}
        <div className="space-y-3.5 text-xs text-slate-700 mb-6">
          <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <Lock className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 block text-xs mb-0.5">1. 100% Patient Privacy & Legal Compliance</strong>
              Raw patient health records, diagnostic tests, and granular prescription logs never leave the state. Only anonymous model parameters are transmitted.
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <Zap className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 block text-xs mb-0.5">2. Extreme Rural Bandwidth Efficiency</strong>
              Uploading gigabytes of raw database tables over rural 2G/3G connections causes sync failures. Sending a tiny 50 KB model gradient file takes less than a second.
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <Network className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-900 block text-xs mb-0.5">3. Multi-State Epidemic Early Warning</strong>
              When an infectious disease surge (e.g. Dengue or Malaria) begins in Odisha, the updated model parameters broadcast to Bihar and Jharkhand, adjusting medicine demand forecasts before the surge crosses borders.
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-slate-900 hover:bg-black text-white font-bold rounded-xl text-xs transition shadow-sm"
        >
          Got it, Close Explainer
        </button>

      </div>
    </div>
  );
}
