import React, { useState } from 'react';
import { useAuth, PRESET_USERS, ALL_DISTRICTS, ALL_FACILITIES } from '../context/AuthContext';
import { 
  ShieldCheck, 
  Truck, 
  Mic, 
  ThermometerSnowflake, 
  Sparkles, 
  ArrowRight, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Building2, 
  UserCheck, 
  AlertCircle, 
  CheckCircle2, 
  Zap, 
  Shield, 
  Activity,
  Layers,
  ChevronRight
} from 'lucide-react';

export default function AuthPortalView() {
  const { login, register } = useAuth();
  const [activeTab, setActiveTab] = useState('presets'); // 'presets' | 'login' | 'register'
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  function handleRegDistrictChange(e) {
    const newDist = e.target.value;
    setRegDistrict(newDist);
    const facilitiesForDistrict = ALL_FACILITIES.filter(f => f.district_id === newDist);
    if (facilitiesForDistrict.length > 0) {
      setRegPHC(facilitiesForDistrict[0].id);
    }
  }

  const availablePHCs = ALL_FACILITIES.filter(f => !regDistrict || f.district_id === regDistrict);

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
    <div className="min-h-screen bg-slate-100/90 text-slate-800 flex items-center justify-center p-3 sm:p-6 lg:p-10 font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Outer Card with Split Design (Pinterest Reference Style) */}
      <div className="w-full max-w-6xl bg-white rounded-3xl sm:rounded-[2.5rem] shadow-2xl border border-slate-200/90 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[720px] transition-all">
        
        {/* LEFT PANEL: ArogyaGrid Brand Showcase (Replaces the picture with ArogyaGrid information) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-950 text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          
          {/* Decorative fluid abstract shapes & glow */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/3 w-60 h-60 rounded-full bg-teal-400/10 blur-2xl pointer-events-none" />

          {/* Top Brand Header */}
          <div className="relative z-10 space-y-4">
            <div className="flex items-center space-x-3.5">
              <img 
                src="/logo.jpg" 
                alt="ArogyaGrid Logo" 
                className="w-12 h-12 object-contain rounded-2xl shadow-lg border-2 border-emerald-400/40 bg-white p-0.5 shrink-0" 
              />
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-black text-2xl tracking-tight text-white">
                    Arogya<span className="text-emerald-400">Grid</span>
                  </span>
                  <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full">
                    PUBLIC HEALTH
                  </span>
                </div>
                <p className="text-[11px] text-emerald-200/70 font-medium">
                  National Supply Chain & Telemetry Grid
                </p>
              </div>
            </div>
          </div>

          {/* Middle Story & Information */}
          <div className="relative z-10 py-6 sm:py-8 space-y-5">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-emerald-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Resilient Healthcare for India</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-snug">
              Eliminating Medicine Stockouts Across 1,50,000+ PHCs
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              ArogyaGrid bridges rural physical paper registers with advanced Google Cloud intelligence. 
              Connecting Primary Health Centres with real-time stock availability, vernacular voice intake, and autonomous emergency airways.
            </p>

            {/* Feature Pills */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center space-x-3 p-2.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-300 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-white block">99.4% Drug Availability</span>
                  <span className="text-slate-400 text-[11px]">Vertex AI 14-day predictive stockout prevention</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-2.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-300 shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-white block">14-Min Drone Airway Transit</span>
                  <span className="text-slate-400 text-[11px]">ICMR BVLOS emergency antivenom escrow</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-2.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-300 shrink-0">
                  <Mic className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-white block">Vernacular Voice Telemetry</span>
                  <span className="text-slate-400 text-[11px]">7 Indian regional languages for frontline ASHA workers</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-2.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-300 shrink-0">
                  <ThermometerSnowflake className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-white block">IoT Cold-Chain Guardian</span>
                  <span className="text-slate-400 text-[11px]">2°C–8°C active vaccine thermal monitoring</span>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Security & Compliance Footer */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center space-x-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>ABDM & DPDP Act 2023 Compliant</span>
            </div>
            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-slate-300">
              Zero-Trust Architecture
            </span>
          </div>

        </div>

        {/* RIGHT PANEL: Sign In / Role Selection Interface */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
          
          <div>
            
            {/* Header Title */}
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Sign in to your Portal
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Select your designated healthcare echelon or enter credentials to access live telemetry.
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex p-1 bg-slate-100 rounded-2xl border border-slate-200/80 mb-6">
              <button
                onClick={() => { setActiveTab('presets'); setError(null); }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                  activeTab === 'presets'
                    ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/60 font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-emerald-600" />
                <span>1-Click Role Access</span>
              </button>
              
              <button
                onClick={() => { setActiveTab('login'); setError(null); }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                  activeTab === 'login'
                    ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/60 font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Sign In</span>
              </button>

              <button
                onClick={() => { setActiveTab('register'); setError(null); }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                  activeTab === 'register'
                    ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/60 font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Create Account</span>
              </button>
            </div>

            {/* Error Message Alert */}
            {error && (
              <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-2xl flex items-center shadow-xs">
                <AlertCircle className="w-4 h-4 mr-2.5 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* TAB 1: 1-Click Role Presets (4 Roles Stack) */}
            {activeTab === 'presets' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
                  <span>SELECT PRESET ROLE FOR DEMO ACCESS</span>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                    Instant 1-Click
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PRESET_USERS.map((preset) => (
                    <div
                      key={preset.role}
                      onClick={() => handlePresetLogin(preset)}
                      className="bg-slate-50 hover:bg-emerald-50/50 rounded-2xl p-4 border border-slate-200/90 hover:border-emerald-500/80 transition-all cursor-pointer flex flex-col justify-between group shadow-xs hover:shadow-md transform hover:-translate-y-0.5"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-white text-emerald-800 border border-emerald-200 shadow-2xs">
                            {preset.badge}
                          </span>
                          <span className="text-[11px] font-bold text-slate-400 group-hover:text-emerald-700">
                            {preset.role === 'ADMIN' ? 'National' : preset.role === 'DISTRICT_OFFICER' ? 'District' : preset.role === 'DOCTOR' ? 'Clinical' : 'Frontline'}
                          </span>
                        </div>

                        <h3 className="font-extrabold text-slate-900 text-sm mb-0.5 group-hover:text-emerald-800 transition">
                          {preset.label}
                        </h3>
                        <p className="text-[11px] font-bold text-emerald-600 mb-1">
                          {preset.scope}
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed line-clamp-2">
                          {preset.description}
                        </p>
                      </div>

                      <div className="pt-3 mt-2 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-slate-700 group-hover:text-emerald-700">
                        <span>{loading ? 'Entering...' : 'Enter Dashboard'}</span>
                        <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: Sign In Form */}
            {activeTab === 'login' && (
              <div className="space-y-4">
                
                {/* Quick Autofill Selector */}
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
                  <span className="text-[10px] font-black text-slate-500 block mb-2 uppercase tracking-wider">
                    Quick Autofill Credentials:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: 'Admin', email: 'admin@arogyagrid.gov.in' },
                      { label: 'District Officer', email: 'district.ranchi@arogyagrid.gov.in' },
                      { label: 'Doctor', email: 'doctor.ranchi@arogyagrid.gov.in' },
                      { label: 'PHC Staff', email: 'phc.ranchi01@arogyagrid.gov.in' }
                    ].map((item) => (
                      <button
                        key={item.email}
                        type="button"
                        onClick={() => { 
                          setLoginEmail(item.email); 
                          setLoginPassword('password123'); 
                          setError(null); 
                        }}
                        className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 shadow-2xs transition cursor-pointer"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleManualLogin} className="space-y-3.5 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                      <input
                        type="email"
                        list="login-emails"
                        value={loginEmail}
                        onChange={(e) => { setLoginEmail(e.target.value); setError(null); }}
                        placeholder="doctor.ranchi@arogyagrid.gov.in"
                        className="w-full font-semibold bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3.5 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition text-xs"
                        required
                      />
                      <datalist id="login-emails">
                        {PRESET_USERS.map((p) => (
                          <option key={p.email} value={p.email}>{p.name} - {p.label}</option>
                        ))}
                      </datalist>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-slate-700 block">Password</label>
                      <span className="text-[10px] text-slate-400 font-semibold">Demo: password123</span>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => { setLoginPassword(e.target.value); setError(null); }}
                        placeholder="••••••••"
                        className="w-full font-semibold bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition text-xs"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl transition shadow-md shadow-emerald-600/20 disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer mt-2"
                  >
                    <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

              </div>
            )}

            {/* TAB 3: Register Form */}
            {activeTab === 'register' && (
              <div className="space-y-3">
                <form onSubmit={handleRegister} className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Full Name & Title</label>
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Dr. Amit Kumar / Medical Officer"
                      className="w-full font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Official Email Address</label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="amit.kumar@arogyagrid.gov.in"
                      className="w-full font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
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
                      className="w-full font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Designated Healthcare Role</label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value)}
                      className="w-full font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                    >
                      <option value="DOCTOR">Medical Officer / Doctor</option>
                      <option value="PHC_STAFF">PHC Frontline Staff / Worker</option>
                      <option value="DISTRICT_OFFICER">District Health Officer</option>
                      <option value="ADMIN">National Director / Admin</option>
                    </select>
                  </div>

                  {regRole !== 'ADMIN' && (
                    <div className="space-y-2.5 pt-1">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">State & District</label>
                        <select
                          value={regDistrict}
                          onChange={handleRegDistrictChange}
                          className="w-full font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                          required
                        >
                          {ALL_DISTRICTS.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name} ({d.state})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">
                          {regRole === 'DISTRICT_OFFICER' ? 'Headquarters Facility' : 'Assigned Health Centre'}
                        </label>
                        <select
                          value={regPHC}
                          onChange={(e) => setRegPHC(e.target.value)}
                          className="w-full font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500 text-xs"
                          required
                        >
                          {availablePHCs.map((f) => (
                            <option key={f.id} value={f.id}>
                              {f.name} [{f.facility_type === 'DISTRICT_HOSPITAL' ? 'DH' : f.facility_type}] ({f.id})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl transition shadow-md shadow-emerald-600/20 disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer mt-3"
                  >
                    <span>{loading ? 'Creating Account...' : 'Create Account & Sign In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

          </div>

          {/* Bottom Security Capsule */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-slate-400 text-[11px] gap-2">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Cloud SQL & BigQuery Encrypted Connection</span>
            </div>
            <span>ABDM Ayushman Bharat Digital Mission Ready</span>
          </div>

        </div>

      </div>

    </div>
  );
}
