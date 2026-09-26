import React, { useState } from 'react';
import { 
  Activity, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Bot, 
  Cloud, 
  Camera, 
  Mic, 
  TrendingUp, 
  Truck, 
  ThermometerSnowflake, 
  Building2, 
  CheckCircle2, 
  Users, 
  Globe2, 
  Layers, 
  Play, 
  ExternalLink,
  Cpu,
  Database
} from 'lucide-react';
import { PRESET_USERS } from '../context/AuthContext';

export default function LandingPageView({ onEnterPortal, onSelectPreset }) {
  const [selectedDemoRole, setSelectedDemoRole] = useState(null);

  const STATS = [
    { label: 'Primary Health Centres', value: '1,50,000+', change: 'Pan-India Reach', icon: Building2 },
    { label: 'Essential Drug Availability', value: '99.4%', change: '+38% vs baseline', icon: ShieldCheck },
    { label: 'ICMR Drone Airway Transit', value: '14 Mins', change: '55m faster than road', icon: Truck },
    { label: 'Regional Indian Dialects', value: '7 Languages', change: 'Cloud Speech v2', icon: Mic },
    { label: 'Cold-Chain IoT Accuracy', value: '2°C–8°C', change: 'Zero Spoilage', icon: ThermometerSnowflake }
  ];

  const FEATURES = [
    {
      title: 'Multimodal Gemini Vision OCR',
      badge: 'Google AI Gemini',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      description: 'Converts physical paper delivery slips, carbon-copy challans, and handwritten registers directly into structured NLEM inventory batches.',
      icon: Camera,
      iconColor: 'from-indigo-500 to-purple-600',
      highlights: ['Instant batch extraction', 'NLEM code matching', 'Automated FEFO expiry tracking']
    },
    {
      title: 'Vernacular Voice Telemetry',
      badge: 'Cloud Speech v2',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      description: 'Allows frontline ASHA and ANM healthcare workers to record stock dispenses and bed occupancy in regional languages with zero typing.',
      icon: Mic,
      iconColor: 'from-blue-500 to-cyan-600',
      highlights: ['Hindi, Bhojpuri, Marathi, Odia, Tamil', 'Real-time Web Speech preview', 'Auto-stops & parses to ledger']
    },
    {
      title: 'Vertex AI Days-To-Stockout (DTS)',
      badge: 'Vertex AI & XAI',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      description: '14-day advance predictive forecasting combining local consumption velocity, IMD monsoon rainfall metrics, and disease seasonality.',
      icon: TrendingUp,
      iconColor: 'from-emerald-500 to-teal-600',
      highlights: ['SHAP feature attribution', 'Tiers: Normal, Low, Critical', 'Federated state learning (FedAvg)']
    },
    {
      title: 'IoT Vaccine Cold-Chain Guardian',
      badge: 'Thermal Telemetry',
      badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
      description: 'Monitors vaccine refrigerators (ILRs) continuously. Automatically triggers emergency transfer and technician dispatch upon thermal excursions.',
      icon: ThermometerSnowflake,
      iconColor: 'from-sky-500 to-blue-600',
      highlights: ['Active 2°C–8°C telemetry', 'Automated SMS alerts', 'Spoilage risk prevention']
    },
    {
      title: 'Geospatial Rebalancing & ICMR Drone Airway',
      badge: 'Maps Platform',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      description: 'Calculates shortest road escrow vs. autonomous ICMR drone flight paths to rebalance life-saving antivenom and rabies vaccines.',
      icon: Truck,
      iconColor: 'from-amber-500 to-orange-600',
      highlights: ['Surplus-to-deficit matching', '14-minute drone escrow', 'Live Google Maps Roadmap & Satellite']
    },
    {
      title: 'ABDM & Open Health Data Standards',
      badge: 'Interoperable',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      description: 'Engineered for Ayushman Bharat Digital Mission (ABDM), DVDMS, and e-Aushadhi with BigQuery analytics and offline IndexedDB sync.',
      icon: Database,
      iconColor: 'from-purple-500 to-pink-600',
      highlights: ['BigQuery streaming ingestion', '100% offline-first PWA sync', 'Idempotent transaction logs']
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Top Floating Glass Navigation Header */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center space-x-3 cursor-pointer" onClick={onEnterPortal}>
            <img 
              src="/logo.jpg" 
              alt="ArogyaGrid Logo" 
              className="w-11 h-11 object-contain rounded-2xl shadow-sm border border-slate-200/80 bg-white p-0.5 shrink-0" 
            />
            <div>
              <span className="font-black text-xl tracking-tight text-slate-900">
                Arogya<span className="text-emerald-600">Grid</span>
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-full">
                Public Health AI Network
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-6 text-xs font-bold text-slate-600">
            <a href="#features" className="hover:text-emerald-600 transition">Core Innovations</a>
            <a href="#metrics" className="hover:text-emerald-600 transition">Telemetry & Impact</a>
            <a href="#roles" className="hover:text-emerald-600 transition">1-Click Role Demos</a>
            <a href="#architecture" className="hover:text-emerald-600 transition">Google Cloud Stack</a>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={onEnterPortal}
              className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-emerald-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition cursor-pointer shadow-2xs"
            >
              Sign In
            </button>
            <button
              onClick={onEnterPortal}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center space-x-1.5 cursor-pointer transform hover:-translate-y-0.5"
            >
              <span>Launch Platform</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-slate-50 to-slate-100/60 border-b border-slate-200/70">
        
        {/* Subtle decorative glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-blue-200/25 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          
          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
            Resilient, AI-Powered Healthcare Logistics for India
          </h1>

          {/* Subtitle */}
          <p className="max-w-3xl mx-auto text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
            Eliminating rural medicine stockouts and vaccine spoilage across 1,50,000+ Primary Health Centres with 
            <strong className="text-slate-800"> Vertex AI demand forecasting</strong>, 
            <strong className="text-slate-800"> Multimodal Gemini Vision challan OCR</strong>, 
            <strong className="text-slate-800"> Vernacular voice telemetry</strong>, and 
            <strong className="text-slate-800"> Autonomous ICMR drone airway rebalancing</strong>.
          </p>

          {/* CTA Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3.5">
            <button
              onClick={onEnterPortal}
              className="px-6 py-3.5 bg-slate-900 hover:bg-black text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-slate-900/20 transition flex items-center space-x-2 cursor-pointer transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Enter Healthcare Portal</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <a
              href="#roles"
              className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-sm rounded-2xl border border-slate-200 shadow-sm transition flex items-center space-x-2"
            >
              <span>Explore 1-Click Role Demos</span>
            </a>
          </div>

          {/* Technology Badges Strip */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-2 text-[11px] font-bold text-slate-500">
            <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs">⚡ Gemini 2.5 Flash Vision</span>
            <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs">☁️ Vertex AI Model Serving</span>
            <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs">🎙️ Cloud Speech v2</span>
            <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs">🗺️ Google Maps Platform</span>
            <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs">📊 Google BigQuery</span>
            <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs">🚁 ICMR Drone Escrow</span>
          </div>

        </div>
      </section>

      {/* Live Telemetry Impact Metrics Strip */}
      <section id="metrics" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {STATS.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div 
                key={i} 
                className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-md flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{stat.label}</span>
                  <Icon className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{stat.value}</div>
                  <div className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded inline-block mt-1">
                    {stat.change}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Core Architectural Pillars */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
            Engineered For Zero Stockouts
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Six Technological Breakthroughs
          </h2>
          <p className="text-sm text-slate-600 font-medium">
            Bridging disconnected physical paper ledgers and advanced cloud intelligence to safeguard patient care at the last mile.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div 
                key={idx}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-500/50 transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${feat.iconColor} flex items-center justify-center text-white shadow-md shadow-slate-200 group-hover:scale-105 transition`}>
                      <Icon className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${feat.badgeColor}`}>
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="font-black text-slate-900 text-lg mb-2 group-hover:text-emerald-700 transition">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium mb-4">
                    {feat.description}
                  </p>
                </div>

                <div className="space-y-1.5 pt-3 border-t border-slate-100">
                  {feat.highlights.map((h, hi) => (
                    <div key={hi} className="flex items-center space-x-2 text-[11px] font-bold text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 1-Click Role Demos Section */}
      <section id="roles" className="bg-slate-100/70 border-y border-slate-200/80 py-18 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
              ⚡ Live Interactive Personas
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Test Any Healthcare Role in 1 Click
            </h2>
            <p className="text-sm text-slate-600 font-medium">
              Experience the customized role dashboards built for each echelon of the Indian healthcare system.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PRESET_USERS.map((preset) => (
              <div
                key={preset.role}
                onClick={() => onSelectPreset ? onSelectPreset(preset) : onEnterPortal()}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-500 transition-all cursor-pointer flex flex-col justify-between group transform hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {preset.badge}
                    </span>
                    <span className="text-xs font-bold text-slate-400 group-hover:text-emerald-600">
                      {preset.role === 'ADMIN' ? 'National' : preset.role === 'DISTRICT_OFFICER' ? 'District' : preset.role === 'DOCTOR' ? 'Clinical' : 'Frontline'}
                    </span>
                  </div>

                  <h3 className="font-black text-slate-900 text-base mb-1 group-hover:text-emerald-700 transition">
                    {preset.label}
                  </h3>
                  <p className="text-xs font-bold text-emerald-600 mb-1.5">
                    {preset.scope}
                  </p>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4">
                    {preset.description}
                  </p>
                </div>

                <button
                  className="w-full py-2.5 bg-slate-900 group-hover:bg-emerald-600 text-white font-extrabold rounded-xl text-xs transition flex items-center justify-center space-x-1.5 shadow-sm"
                >
                  <span>Launch {preset.label}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Google Cloud Architecture Banner */}
      <section id="architecture" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
          
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold">
              <Cloud className="w-4 h-4 text-blue-400" />
              <span>Native Google Cloud & Open Public Data Architecture</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Enterprise AI & Open Geospatial Integration
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed font-normal">
              ArogyaGrid ingests real-time open datasets including Indian Meteorological Department (IMD) monsoon precipitation, 
              WHO/NLEM essential medicines catalogs, and ICMR Beyond-Visual-Line-of-Sight (BVLOS) drone airspace corridors.
            </p>

            <div className="pt-4 flex flex-wrap gap-4">
              <button
                onClick={onEnterPortal}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center space-x-2 cursor-pointer"
              >
                <span>Launch Live Platform</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 px-4 text-center text-xs text-slate-500 font-medium">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
              A
            </div>
            <span className="font-extrabold text-slate-900 text-sm">ArogyaGrid Platform</span>
            <span>&bull; Public Health Supply Chain Network</span>
          </div>

          <div className="text-slate-400 text-[11px]">
            Code for Communities 2.0 &bull; Built with Google Cloud, Vertex AI, Gemini & Open Data
          </div>
        </div>
      </footer>

    </div>
  );
}
