import React, { useState } from 'react';
import { useAuth, PRESET_USERS } from '../context/AuthContext';
import { Activity, ShieldCheck, HeartPulse, Truck, Cpu, ArrowRight, Lock, Sparkles, Building2, UserCircle2 } from 'lucide-react';
import FederatedExplainerModal from '../components/FederatedExplainerModal';

export default function LandingPageView() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showManualLogin, setShowManualLogin] = useState(false);
  const [loadingRole, setLoadingRole] = useState(null);
  const [error, setError] = useState(null);
  const [isExplainerOpen, setIsExplainerOpen] = useState(false);

  async function handleQuickLogin(preset) {
    setLoadingRole(preset.role);
    setError(null);
    try {
      await login(preset.email, 'password123');
    } catch (err) {
      setError(err.message);
      setLoadingRole(null);
    }
  }

  async function handleManualSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 py-4 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Activity className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900">Arogya<span className="text-emerald-600">Grid</span></span>
              <span className="ml-2 px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full">GovTech Platform</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsExplainerOpen(true)}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-1.5 rounded-xl border border-indigo-200/60 transition flex items-center space-x-1.5"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Why Federated AI?</span>
            </button>
            <button
              onClick={() => setShowManualLogin(!showManualLogin)}
              className="text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-1.5 rounded-xl transition"
            >
              {showManualLogin ? 'Show 1-Click Roles' : 'Custom Credentials'}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 flex flex-col justify-center">
        
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 mr-1 text-emerald-600" /> India's National Primary Health Centre Intelligence Grid
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">
            Resilient, Offline-First & Federated <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Healthcare Supply Logistics</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
            Real-time Tri-Resource tracking for <strong>Medicines</strong>, <strong>Beds</strong>, and <strong>Medical Staff</strong> with predictive stockout warnings and automated cross-district rebalancing.
          </p>
        </div>

        {error && (
          <div className="max-w-md mx-auto mb-6 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl text-center">
            {error}
          </div>
        )}

        {/* 1-Click Role Login Cards */}
        {!showManualLogin ? (
          <div className="max-w-5xl mx-auto w-full">
            <div className="text-center mb-6">
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Select Role for Instant Demonstration</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {PRESET_USERS.map((preset) => {
                const isLoading = loadingRole === preset.role;
                return (
                  <div
                    key={preset.role}
                    onClick={() => handleQuickLogin(preset)}
                    className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-emerald-500/80 transition-all duration-200 cursor-pointer flex flex-col justify-between group transform hover:-translate-y-1"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/50">
                          {preset.badge}
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-slate-50 group-hover:bg-emerald-50 text-slate-400 group-hover:text-emerald-600 flex items-center justify-center transition">
                          <UserCircle2 className="w-5 h-5" />
                        </div>
                      </div>

                      <h3 className="font-extrabold text-slate-900 text-base mb-1 group-hover:text-emerald-700 transition">
                        {preset.label}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4">
                        {preset.description}
                      </p>
                    </div>

                    <button
                      disabled={isLoading}
                      className="w-full py-2 bg-slate-900 group-hover:bg-emerald-600 text-white font-bold rounded-xl text-xs transition flex items-center justify-center space-x-1.5 shadow-sm"
                    >
                      <span>{isLoading ? 'Authenticating...' : 'Enter Dashboard'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Manual Login Form */
          <div className="max-w-md mx-auto w-full bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl">
            <h2 className="font-extrabold text-lg text-slate-900 mb-1">Custom Account Login</h2>
            <p className="text-xs text-slate-500 mb-6 font-medium">Enter your registered ArogyaGrid credentials</p>

            <form onSubmit={handleManualSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@arogyagrid.gov.in"
                  className="w-full font-semibold bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full font-semibold bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-md"
              >
                Sign In to Dashboard
              </button>
            </form>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-4 text-center text-xs text-slate-500 font-medium">
        ArogyaGrid Platform &bull; Built for India's 150,000+ Primary Health Centre Network
      </footer>

      {/* Federated AI Explainer Modal */}
      <FederatedExplainerModal
        isOpen={isExplainerOpen}
        onClose={() => setIsExplainerOpen(false)}
      />

    </div>
  );
}
