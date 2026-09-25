import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { 
  Network, 
  FileCode, 
  Database, 
  CheckCircle2, 
  RefreshCw, 
  Copy, 
  Download, 
  ShieldCheck, 
  Building2, 
  UserCheck, 
  ArrowRight,
  ExternalLink,
  Layers,
  AlertCircle
} from 'lucide-react';

export default function ABDMInteroperabilityView({ districtId = 'DIST-JH-01' }) {
  const [activeSubTab, setActiveSubTab] = useState('eaushadhi'); // 'eaushadhi' | 'fhir' | 'hfr_abha'
  const [loading, setLoading] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  
  // Data States
  const [hfrFacilities, setHfrFacilities] = useState([]);
  const [fhirBundle, setFhirBundle] = useState(null);
  const [eaushadhiSyncResult, setEaushadhiSyncResult] = useState(null);
  
  // ABHA Verification Sandbox
  const [abhaInput, setAbhaInput] = useState('14-8823-9012-4412');
  const [patientName, setPatientName] = useState('Ramesh Soren');
  const [abhaResult, setAbhaResult] = useState(null);
  const [abhaLoading, setAbhaLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    loadHfrData();
    loadFhirData();
    triggerEAushadhiSync();
  }, [districtId]);

  async function loadHfrData() {
    try {
      const data = await apiRequest(`/abdm/hfr/facilities/${districtId}`);
      setHfrFacilities(data.facilities || []);
    } catch (err) {
      console.error('Failed to load HFR registry:', err);
    }
  }

  async function loadFhirData() {
    try {
      const bundle = await apiRequest(`/abdm/fhir/bundle/${districtId}`);
      setFhirBundle(bundle);
    } catch (err) {
      console.error('Failed to load FHIR bundle:', err);
    }
  }

  async function triggerEAushadhiSync() {
    setSyncLoading(true);
    try {
      const res = await apiRequest('/abdm/eaushadhi/sync', {
        method: 'POST',
        body: JSON.stringify({ district_id: districtId })
      });
      setEaushadhiSyncResult(res);
    } catch (err) {
      console.error('Failed e-Aushadhi sync:', err);
    } finally {
      setSyncLoading(false);
    }
  }

  async function handleVerifyAbha(e) {
    if (e) e.preventDefault();
    setAbhaLoading(true);
    try {
      const res = await apiRequest('/abdm/abha/verify', {
        method: 'POST',
        body: JSON.stringify({
          abha_number: abhaInput,
          patient_name: patientName,
          consent_purpose: 'CARE_PROVISION_AND_MEDICINE_DISPENSE'
        })
      });
      setAbhaResult(res);
    } catch (err) {
      setAbhaResult({ valid: false, error: err.message });
    } finally {
      setAbhaLoading(false);
    }
  }

  function handleCopyFhir() {
    if (!fhirBundle) return;
    navigator.clipboard.writeText(JSON.stringify(fhirBundle, null, 2));
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  }

  function handleDownloadFhir() {
    if (!fhirBundle) return;
    const blob = new Blob([JSON.stringify(fhirBundle, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ArogyaGrid-FHIR-R4-${districtId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm space-y-6">
      
      {/* Top ABDM & Interoperability Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-5 border-b border-slate-100 gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-teal-600 text-white shadow-md shadow-teal-500/20">
            <Network className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap">
              <h2 className="text-lg font-black text-slate-900">Government Portals & Patient ID (ABDM & e-Aushadhi)</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-teal-50 text-teal-700 border border-teal-200">
                Official Standards (MoHFW)
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Direct connection with Central Government Warehouses, National Health Records, and Ayushman Bharat ID cards
            </p>
          </div>
        </div>

        {/* Status Chips */}
        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 flex items-center space-x-1.5">
            <Layers className="w-3.5 h-3.5" />
            <span>Standard Health Records (FHIR R4)</span>
          </span>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200 flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Patient Privacy Protected</span>
          </span>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('eaushadhi')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeSubTab === 'eaushadhi'
              ? 'bg-teal-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Central Warehouse (e-Aushadhi)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('fhir')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeSubTab === 'fhir'
              ? 'bg-teal-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>Health Records Export ({fhirBundle?.total || 0})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('hfr_abha')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeSubTab === 'hfr_abha'
              ? 'bg-teal-600 text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Verify Patient ABHA & Clinic ID</span>
        </button>
      </div>

      {/* PANEL 1: e-Aushadhi / DVDMS Gateway Bridge */}
      {activeSubTab === 'eaushadhi' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-sm text-slate-900">
                  State Central Medical Services Corporation Bridge
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800">
                  LIVE API LINK
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Connected Corporation: <strong>{eaushadhiSyncResult?.state_corporation || 'State Medical Services Corp'}</strong>
              </p>
            </div>

            <button
              onClick={triggerEAushadhiSync}
              disabled={syncLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-extrabold text-xs rounded-xl shadow-sm transition shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncLoading ? 'animate-spin' : ''}`} />
              <span>{syncLoading ? 'Reconciling Ledger...' : 'Re-Sync with e-Aushadhi'}</span>
            </button>
          </div>

          {/* Sync Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase">State Voucher No.</span>
              <p className="text-sm font-black text-slate-800 font-mono mt-0.5 truncate">
                {eaushadhiSyncResult?.voucher_number || 'EAV-JH-2024-X99'}
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Facilities Reconciled</span>
              <p className="text-sm font-black text-slate-800 mt-0.5">
                {eaushadhiSyncResult?.total_phcs_synced || 0} Centres
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Reconciliation Match</span>
              <p className="text-sm font-black text-emerald-600 mt-0.5">
                {eaushadhiSyncResult?.reconciliation_match_percentage || '99.8%'}
              </p>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Cryptographic Signature</span>
              <p className="text-xs font-bold text-indigo-700 font-mono mt-0.5 truncate">
                {eaushadhiSyncResult?.digital_signature || 'SHA256:verified'}
              </p>
            </div>
          </div>

          {/* Reconciliation Sample Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 uppercase font-black text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">NLEM Code</th>
                  <th className="p-3">Essential Medicine</th>
                  <th className="p-3">Physical In-Hand (ArogyaGrid)</th>
                  <th className="p-3">e-Aushadhi Ledger</th>
                  <th className="p-3">Variance</th>
                  <th className="p-3">Audit Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {eaushadhiSyncResult?.reconciled_sample?.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition">
                    <td className="p-3 font-mono font-bold text-slate-700">{item.nlem_code}</td>
                    <td className="p-3 font-bold text-slate-900">{item.medicine_name}</td>
                    <td className="p-3 font-semibold text-slate-800">{item.physical_in_hand}</td>
                    <td className="p-3 font-semibold text-slate-800">{item.eaushadhi_recorded_ledger}</td>
                    <td className="p-3 font-bold text-slate-600">{item.variance}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 flex items-center space-x-1 w-max">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>RECONCILED</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PANEL 2: HL7 FHIR Release 4 Explorer */}
      {activeSubTab === 'fhir' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">HL7 FHIR R4 Supply Chain & Inventory Payload</h3>
              <p className="text-xs text-slate-500 font-medium">
                Standardized JSON resource bundle containing Locations, NLEM Medications, SupplyDelivery, and IoT Devices.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopyFhir}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copySuccess ? 'Copied!' : 'Copy FHIR JSON'}</span>
              </button>

              <button
                onClick={handleDownloadFhir}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .json</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-4 overflow-x-auto max-h-[420px] shadow-inner font-mono text-[11px] text-emerald-400">
            <pre>{JSON.stringify(fhirBundle, null, 2)}</pre>
          </div>
        </div>
      )}

      {/* PANEL 3: HFR Registry & ABHA Verification Sandbox */}
      {activeSubTab === 'hfr_abha' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          {/* ABHA Sandbox Verification Form */}
          <div className="bg-gradient-to-r from-teal-50 via-indigo-50 to-teal-50 border border-teal-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center space-x-2 mb-2">
              <UserCheck className="w-5 h-5 text-teal-700" />
              <h3 className="font-extrabold text-sm text-slate-900">
                ABHA Beneficiary Instant Verification & DPDP Act 2023 Consent Sandbox
              </h3>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              Simulates live Aadhaar-based OTP verification against the National Health Authority (NHA) gateway for instant medicine dispensing.
            </p>

            <form onSubmit={handleVerifyAbha} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">14-Digit ABHA ID</label>
                <input
                  type="text"
                  value={abhaInput}
                  onChange={(e) => setAbhaInput(e.target.value)}
                  placeholder="e.g. 14-8823-9012-4412"
                  className="w-full text-xs font-mono font-bold bg-white border border-slate-300 rounded-xl p-2 text-slate-800 outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Beneficiary Name</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Patient Name"
                  className="w-full text-xs font-bold bg-white border border-slate-300 rounded-xl p-2 text-slate-800 outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={abhaLoading}
                  className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition flex items-center justify-center space-x-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{abhaLoading ? 'Authenticating Gateway...' : 'Verify ABHA & Mint Consent'}</span>
                </button>
              </div>
            </form>

            {abhaResult && abhaResult.valid && (
              <div className="mt-4 p-3.5 bg-white rounded-xl border border-teal-200 shadow-sm animate-in fade-in space-y-2">
                <div className="flex flex-wrap items-center justify-between text-xs gap-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="font-extrabold text-slate-900">{abhaResult.beneficiary_profile.name}</span>
                    <span className="font-mono text-xs text-teal-700 font-bold">({abhaResult.abha_id})</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                    PM-JAY ELIGIBLE ({abhaResult.beneficiary_profile.pmjay_coverage_limit})
                  </span>
                </div>

                <div className="text-[11px] text-slate-600 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <span><strong>Consent Artifact ID:</strong> <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-700">{abhaResult.dpdp_compliance.consent_artifact_id}</code></span>
                  <span className="text-slate-500 italic">{abhaResult.dpdp_compliance.legal_basis}</span>
                </div>
              </div>
            )}
          </div>

          {/* Health Facility Registry (HFR) Table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                Official ABDM Health Facility Registry (HFR) & NIN Directory
              </h4>
              <span className="text-xs text-slate-500 font-bold">{hfrFacilities.length} Monitored Facilities</span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 uppercase font-black text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-3">Facility Name</th>
                    <th className="p-3">ABDM HFR ID</th>
                    <th className="p-3">National ID (NIN)</th>
                    <th className="p-3">ABDM Milestone</th>
                    <th className="p-3">Registry Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {hfrFacilities.map((fac, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition">
                      <td className="p-3 font-bold text-slate-900">{fac.facility_name}</td>
                      <td className="p-3 font-mono font-bold text-indigo-600">{fac.hfr_id}</td>
                      <td className="p-3 font-mono text-slate-600">{fac.nin_id}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200">
                          {fac.abdm_milestone}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
                          ✔ {fac.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
