import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { 
  Cloud, 
  Database, 
  Cpu, 
  Sparkles, 
  Activity, 
  Layers, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  ArrowRight,
  TrendingDown,
  Plane,
  FileCode,
  Copy,
  Check
} from 'lucide-react';

export default function GoogleCloudConsoleModal({ isOpen, onClose }) {
  const [cloudStatus, setCloudStatus] = useState(null);
  const [bqData, setBqData] = useState(null);
  const [activeTab, setActiveTab] = useState('vertex'); // 'vertex' | 'bigquery' | 'status'
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Vertex AI Playground state
  const [stockInput, setStockInput] = useState(25);
  const [burnInput, setBurnInput] = useState(15);
  const [surgeInput, setSurgeInput] = useState(1.5);
  const [leadTimeInput, setLeadTimeInput] = useState(7);
  const [vertexPrediction, setVertexPrediction] = useState(null);
  const [predicting, setPredicting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCloudStatus();
      fetchBigQueryStream();
      runVertexPredict();
    }
  }, [isOpen]);

  async function fetchCloudStatus() {
    try {
      const res = await apiRequest('/cloud/status');
      setCloudStatus(res);
    } catch (e) {
      console.warn('Failed to load cloud status:', e);
    }
  }

  async function fetchBigQueryStream() {
    setLoading(true);
    try {
      const res = await apiRequest('/cloud/bigquery/stream?limit=15');
      setBqData(res);
    } catch (e) {
      console.warn('Failed to load BigQuery stream:', e);
    } finally {
      setLoading(false);
    }
  }

  async function runVertexPredict() {
    setPredicting(true);
    try {
      const res = await apiRequest('/cloud/vertex/predict-dts', {
        method: 'POST',
        body: JSON.stringify({
          current_stock: stockInput,
          daily_consumption: burnInput,
          footfall_surge_factor: surgeInput,
          lead_time_days: leadTimeInput
        })
      });
      setVertexPrediction(res);
    } catch (e) {
      console.error('Vertex AI prediction error:', e);
    } finally {
      setPredicting(false);
    }
  }

  function handleCopyDDL() {
    const ddl = `CREATE SCHEMA IF NOT EXISTS \`arogyagrid_analytics\` OPTIONS(location = 'asia-south1');

CREATE TABLE IF NOT EXISTS \`arogyagrid_analytics.stock_transactions\` (
  event_id STRING NOT NULL,
  transaction_uuid STRING NOT NULL,
  phc_id STRING NOT NULL,
  medicine_id STRING NOT NULL,
  quantity INT64 NOT NULL,
  transaction_type STRING NOT NULL,
  created_by STRING,
  ingested_at TIMESTAMP NOT NULL,
  bigquery_partition_date DATE NOT NULL
)
PARTITION BY bigquery_partition_date
CLUSTER BY phc_id, medicine_id;`;

    navigator.clipboard.writeText(ddl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-4xl w-full shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Cloud className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-lg text-slate-900">Google Cloud Architecture & BigQuery Console</h3>
                <span className="px-2 py-0.5 text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
                  asia-south1
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Code for Communities 2.0 &bull; Live Vertex AI Serving & BigQuery Streaming Telemetry
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 my-4 bg-slate-100 p-1 rounded-2xl shrink-0">
          <button
            onClick={() => setActiveTab('vertex')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'vertex' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Cpu className="w-4 h-4 text-indigo-600" />
            <span>Vertex AI Model Serving</span>
          </button>
          <button
            onClick={() => setActiveTab('bigquery')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'bigquery' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Database className="w-4 h-4 text-blue-600" />
            <span>BigQuery Streaming Buffer</span>
          </button>
          <button
            onClick={() => setActiveTab('status')}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'status' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>Architecture Compliance</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">

          {/* TAB 1: VERTEX AI MODEL SERVING PLAYGROUND */}
          {activeTab === 'vertex' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Parameter Controls */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Inference Parameters</span>
                    <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full">
                      RF Regressor
                    </span>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Current Stock (units): <span className="font-bold text-slate-900">{stockInput}</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="500"
                      value={stockInput}
                      onChange={(e) => setStockInput(Number(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Daily Consumption: <span className="font-bold text-slate-900">{burnInput} /day</span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="60"
                      value={burnInput}
                      onChange={(e) => setBurnInput(Number(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Surge Factor (IDSP): <span className="font-bold text-slate-900">{surgeInput}x</span>
                    </label>
                    <input
                      type="range"
                      min="1.0"
                      max="3.5"
                      step="0.1"
                      value={surgeInput}
                      onChange={(e) => setSurgeInput(Number(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Supplier Lead Time: <span className="font-bold text-slate-900">{leadTimeInput} days</span>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="14"
                      value={leadTimeInput}
                      onChange={(e) => setLeadTimeInput(Number(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                  </div>

                  <button
                    onClick={runVertexPredict}
                    disabled={predicting}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition shadow-sm flex items-center justify-center space-x-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{predicting ? 'Inferring on Vertex AI...' : 'Run Vertex AI Prediction'}</span>
                  </button>
                </div>

                {/* Inference Output & SHAP XAI */}
                <div className="md:col-span-2 space-y-4">
                  {vertexPrediction?.predictions?.[0] ? (
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                      
                      {/* Prediction Banner */}
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <div>
                          <span className="text-[10px] font-extrabold uppercase text-slate-400 block">
                            Forecasted Days-to-Stockout
                          </span>
                          <div className="flex items-baseline space-x-2 mt-0.5">
                            <span className="text-2xl font-black text-slate-900">
                              {vertexPrediction.predictions[0].days_to_stockout} Days
                            </span>
                            <span className="text-xs text-slate-500 font-semibold">
                              (Est. Stockout: {vertexPrediction.predictions[0].stockout_date})
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase ${
                            vertexPrediction.predictions[0].risk_level === 'CRITICAL'
                              ? 'bg-rose-100 text-rose-800'
                              : vertexPrediction.predictions[0].risk_level === 'HIGH'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {vertexPrediction.predictions[0].risk_level}
                          </span>
                          <span className="block text-[10px] text-slate-400 mt-1 font-semibold">
                            Confidence: {(vertexPrediction.predictions[0].confidence_score * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      {/* SHAP XAI Feature Attributions */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Vertex Explainable AI (SHAP Kernel Attributions)</span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            baseline: {vertexPrediction.explainability?.baseline_score}d
                          </span>
                        </div>

                        <div className="space-y-2">
                          {vertexPrediction.explainability?.feature_attributions?.map((attr, idx) => (
                            <div key={idx} className="space-y-1">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-semibold text-slate-700 capitalize">
                                  {attr.feature.replace(/_/g, ' ')}: <strong className="text-slate-900">{attr.value}</strong>
                                </span>
                                <span className={`font-mono text-[10px] font-bold ${
                                  attr.direction === 'INCREASES_RISK' ? 'text-rose-600' : 'text-emerald-600'
                                }`}>
                                  {attr.weight_pct}% weight ({attr.direction})
                                </span>
                              </div>
                              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    attr.direction === 'INCREASES_RISK' ? 'bg-rose-500' : 'bg-indigo-500'
                                  }`}
                                  style={{ width: `${attr.weight_pct}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Vertex Endpoint Metadata Footer */}
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-[10px] font-mono text-slate-500 flex flex-wrap items-center justify-between gap-2">
                        <span><strong>Endpoint:</strong> {vertexPrediction.vertex_ai?.endpoint}</span>
                        <span><strong>Serving:</strong> {vertexPrediction.vertex_ai?.serving_environment}</span>
                      </div>

                    </div>
                  ) : null}
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: BIGQUERY STREAMING BUFFER */}
          {activeTab === 'bigquery' && (
            <div className="space-y-4">
              
              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-blue-50/80 rounded-2xl border border-blue-200">
                  <span className="text-[10px] font-bold uppercase text-blue-600 block">Dataset</span>
                  <span className="font-extrabold text-sm text-slate-900 block truncate">{bqData?.dataset_id || 'arogyagrid_analytics'}</span>
                </div>
                <div className="p-3 bg-indigo-50/80 rounded-2xl border border-indigo-200">
                  <span className="text-[10px] font-bold uppercase text-indigo-600 block">Streamed Events</span>
                  <span className="font-extrabold text-lg text-slate-900">{bqData?.buffer_count || 0}</span>
                </div>
                <div className="p-3 bg-emerald-50/80 rounded-2xl border border-emerald-200">
                  <span className="text-[10px] font-bold uppercase text-emerald-600 block">Drone Sorties</span>
                  <span className="font-extrabold text-lg text-slate-900">{bqData?.drone_flights_count || 0}</span>
                </div>
                <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200">
                  <span className="text-[10px] font-bold uppercase text-amber-600 block">CO2 Saved (kg)</span>
                  <span className="font-extrabold text-lg text-slate-900">{bqData?.analytics_summary?.carbon_offset_kg || '0.00'}</span>
                </div>
              </div>

              {/* Streaming Rows Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-blue-600" />
                    <span>Real-Time BigQuery Streaming Buffer (Table: stock_transactions)</span>
                  </span>
                  <button
                    onClick={fetchBigQueryStream}
                    className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 transition"
                    title="Refresh Buffer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-[10px] font-extrabold uppercase text-slate-400 sticky top-0">
                      <tr>
                        <th className="px-3 py-2">Event ID</th>
                        <th className="px-3 py-2">PHC</th>
                        <th className="px-3 py-2">Medicine</th>
                        <th className="px-3 py-2">Qty</th>
                        <th className="px-3 py-2">Type</th>
                        <th className="px-3 py-2">Partition Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {bqData?.rows?.length > 0 ? (
                        bqData.rows.map((r, i) => (
                          <tr key={i} className="hover:bg-slate-50/60 font-mono text-[11px]">
                            <td className="px-3 py-2 text-blue-600 font-bold">{r.event_id || r.flight_id}</td>
                            <td className="px-3 py-2 font-sans font-semibold text-slate-800">{r.phc_id || r.source_phc}</td>
                            <td className="px-3 py-2 font-sans text-slate-600">{r.medicine_id || r.transport_mode}</td>
                            <td className="px-3 py-2 font-bold text-slate-900">{r.quantity || r.payload_kg}</td>
                            <td className="px-3 py-2">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                r.transaction_type === 'INTAKE' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {r.transaction_type}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-slate-400">{r.bigquery_partition_date || r.ingested_at?.split('T')[0]}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center py-6 text-slate-400 text-xs font-sans">
                            No telemetry events in buffer yet. Dispense or rebalance medicine to see live rows.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* DDL Schema Viewer */}
              <div className="p-3 bg-slate-900 text-slate-300 rounded-2xl font-mono text-[11px] relative">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase font-bold flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-blue-400" />
                    <span>BigQuery DDL (Partitioned & Clustered)</span>
                  </span>
                  <button
                    onClick={handleCopyDDL}
                    className="flex items-center space-x-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[10px] transition"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy DDL'}</span>
                  </button>
                </div>
                <pre className="overflow-x-auto text-[10px] leading-relaxed text-slate-300">
{`CREATE SCHEMA IF NOT EXISTS \`arogyagrid_analytics\` OPTIONS(location = 'asia-south1');

CREATE TABLE IF NOT EXISTS \`arogyagrid_analytics.stock_transactions\` (
  event_id STRING NOT NULL,
  transaction_uuid STRING NOT NULL,
  phc_id STRING NOT NULL,
  medicine_id STRING NOT NULL,
  quantity INT64 NOT NULL,
  transaction_type STRING NOT NULL,
  created_by STRING,
  ingested_at TIMESTAMP NOT NULL,
  bigquery_partition_date DATE NOT NULL
)
PARTITION BY bigquery_partition_date
CLUSTER BY phc_id, medicine_id;`}
                </pre>
              </div>

            </div>
          )}

          {/* TAB 3: OVERALL GOOGLE CLOUD ARCHITECTURE STATUS */}
          {activeTab === 'status' && (
            <div className="space-y-3">
              {cloudStatus?.modules ? (
                Object.entries(cloudStatus.modules).map(([key, mod], idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-sm text-slate-900 capitalize">
                          {key.replace(/_/g, ' ')}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {mod.status || 'ACTIVE'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">
                        {mod.provider || mod.engine || mod.model || 'Google Cloud Native'}
                      </p>
                    </div>

                    <div className="text-right">
                      {mod.capabilities && (
                        <div className="flex flex-wrap gap-1 justify-end">
                          {mod.capabilities.map((c, i) => (
                            <span key={i} className="text-[10px] bg-slate-200/70 text-slate-700 px-2 py-0.5 rounded-md font-semibold">
                              {c}
                            </span>
                          ))}
                        </div>
                      )}
                      {mod.supported_dialects && (
                        <span className="text-[10px] font-semibold text-slate-600 block">
                          7 Indian Regional Dialects
                        </span>
                      )}
                      {mod.layers && (
                        <span className="text-[10px] font-semibold text-slate-600 block">
                          Roadmap, Satellite Hybrid & Drone Corridors
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : null}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
