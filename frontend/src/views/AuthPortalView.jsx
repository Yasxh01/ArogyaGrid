import React, { useState } from 'react';
import { useAuth, PRESET_USERS } from '../context/AuthContext';
import { Activity, UserPlus, LogIn, ArrowRight, UserCheck, Cpu, Sparkles } from 'lucide-react';
import FederatedExplainerModal from '../components/FederatedExplainerModal';

export default function AuthPortalView() {
  const { login, register } = useAuth();
  const [activeTab, setActiveTab] = useState('presets');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isExplainerOpen, setIsExplainerOpen] = useState(false);

  // Manual Login Form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('DOCTOR');
  const [regDistrict, setRegDistrict] = useState('DIST-JH-01');
  const [regPHC, setRegPHC] = useState('PHC-RAN-01');

  async function handlePresetLogin(preset) {
    setLoading(true);
    setError(null);
    try {
      await login(preset.email, 'password123');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  async function handleManualLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(loginEmail, loginPassword);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register({
        name: regName,
        email: regEmail,
        password: regPassword,
        role: regRole,
        district_id: regDistrict,
        phc_id: regRole === 'ADMIN' ? null : regPHC
      });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 py-4 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Activity className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900">Arogya<span className="text-emerald-600">Grid</span></span>
              <span className="ml-2 px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full">National PHC Portal</span>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => setIsExplainerOpen(true)}
              className="text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3.5 py-1.5 rounded-xl border border-indigo-200/60 transition flex items-center space-x-1.5"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Why Federated AI?</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 w-full flex-1 flex flex-col justify-center">
        
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 mb-3 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Role-Based Public Health Supply Chain
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight mb-2">
            Secure Authentication & Portal Access
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium">
            Each role accesses strictly scoped telemetry, bed management, and logistics tools.
          </p>
        </div>

        <div className="flex justify-center mb-6">
          <div className="inline-flex p-1 bg-slate-200/80 rounded-2xl border border-slate-300/60">
            <button
              onClick={() => { setActiveTab('presets'); setError(null); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'presets' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ⚡ 1-Click Role Presets
            </button>
            <button
              onClick={() => { setActiveTab('login'); setError(null); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'login' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🔑 Sign In
            </button>
            <button
              onClick={() => { setActiveTab('register'); setError(null); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'register' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ✨ Create Account
            </button>
          </div>
        </div>

        {error && (
          <div className="max-w-md mx-auto mb-6 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl text-center">
            {error}
          </div>
        )}

        {/* 1-Click Role Cards */}
        {activeTab === 'presets' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PRESET_USERS.map((preset) => (
              <div
                key={preset.role}
                onClick={() => handlePresetLogin(preset)}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-500 transition-all cursor-pointer flex flex-col justify-between group transform hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                      {preset.badge}
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-slate-50 group-hover:bg-emerald-50 text-slate-400 group-hover:text-emerald-600 flex items-center justify-center transition">
                      <UserCheck className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-base mb-1 group-hover:text-emerald-700 transition">
                    {preset.label}
                  </h3>
                  <p className="text-[11px] font-bold text-emerald-600 mb-1.5">
                    {preset.scope}
                  </p>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4">
                    {preset.description}
                  </p>
                </div>

                <button
                  disabled={loading}
                  className="w-full py-2 bg-slate-900 group-hover:bg-emerald-600 text-white font-bold rounded-xl text-xs transition flex items-center justify-center space-x-1.5"
                >
                  <span>{loading ? 'Entering...' : 'Enter Dashboard'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Sign In Form */}
        {activeTab === 'login' && (
          <div className="max-w-md mx-auto w-full bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl">
            <h2 className="font-extrabold text-lg text-slate-900 mb-1">Sign In to ArogyaGrid</h2>
            <p className="text-xs text-slate-500 mb-6 font-medium">Access your assigned role and health telemetry console</p>

            <form onSubmit={handleManualLogin} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="doctor.ranchi@arogyagrid.gov.in"
                  className="w-full font-semibold bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Password</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full font-semibold bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-md disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>
          </div>
        )}

        {/* Create Account Form */}
        {activeTab === 'register' && (
          <div className="max-w-md mx-auto w-full bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl">
            <h2 className="font-extrabold text-lg text-slate-900 mb-1">Create ArogyaGrid Account</h2>
            <p className="text-xs text-slate-500 mb-6 font-medium">Register as a Healthcare Officer, Doctor, or PHC Staff</p>

            <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name & Title</label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Dr. Amit Kumar / Officer"
                  className="w-full font-semibold bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="amit.kumar@arogyagrid.gov.in"
                  className="w-full font-semibold bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Password</label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full font-semibold bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Designated Role</label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  className="w-full font-semibold bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="DOCTOR">Medical Officer / Doctor</option>
                  <option value="PHC_STAFF">PHC Frontline Staff / Worker</option>
                  <option value="DISTRICT_OFFICER">District Health Officer</option>
                  <option value="ADMIN">National Director / Admin</option>
                </select>
              </div>

              {regRole !== 'ADMIN' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">District</label>
                    <select
                      value={regDistrict}
                      onChange={(e) => setRegDistrict(e.target.value)}
                      className="w-full font-semibold bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none"
                    >
                      <option value="DIST-JH-01">Ranchi (Jharkhand)</option>
                      <option value="DIST-JH-02">Dhanbad (Jharkhand)</option>
                      <option value="DIST-BR-01">Patna (Bihar)</option>
                      <option value="DIST-OD-01">Khordha (Odisha)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Assigned PHC</label>
                    <select
                      value={regPHC}
                      onChange={(e) => setRegPHC(e.target.value)}
                      className="w-full font-semibold bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none"
                    >
                      <option value="PHC-RAN-01">Ranchi Sadar PHC</option>
                      <option value="PHC-RAN-02">Kanke Rural PHC</option>
                      <option value="PHC-RAN-03">Namkum PHC</option>
                      <option value="PHC-PAT-01">Patna City PHC</option>
                    </select>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-md disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Create Account & Sign In'}
              </button>
            </form>
          </div>
        )}

      </main>

      <footer className="border-t border-slate-200/80 bg-white py-4 text-center text-xs text-slate-500 font-medium">
        ArogyaGrid Platform &bull; Built for India's 150,000+ Primary Health Centre Network
      </footer>

      <FederatedExplainerModal
        isOpen={isExplainerOpen}
        onClose={() => setIsExplainerOpen(false)}
      />

    </div>
  );
}
