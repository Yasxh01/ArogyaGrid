import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { 
  Pill, 
  PlusCircle, 
  AlertCircle, 
  TrendingUp, 
  CheckCircle, 
  RefreshCw, 
  Camera,
  Calendar,
  Clock,
  AlertTriangle,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import ChallanScannerModal from './ChallanScannerModal';

export default function StockManager({ selectedPHC: initialPHC, onTransactionLogged }) {
  const { socket } = useSocket();
  const [currentPHC, setCurrentPHC] = useState(initialPHC || 'PHC-RAN-01');
  const [stock, setStock] = useState([]);
  const [batches, setBatches] = useState([]);
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'batches'
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  
  // Intake Form State
  const [medicineId, setMedicineId] = useState('MED-001');
  const [quantity, setQuantity] = useState('');
  const [transactionType, setTransactionType] = useState('INTAKE');
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (initialPHC) setCurrentPHC(initialPHC);
  }, [initialPHC]);

  useEffect(() => {
    fetchStock();
    fetchBatches();
  }, [currentPHC]);

  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => {
      fetchStock();
      fetchBatches();
    };
    socket.on('stock:updated', handleUpdate);
    socket.on('medicine:created', handleUpdate);
    socket.on('transfer:approved', handleUpdate);
    return () => {
      socket.off('stock:updated', handleUpdate);
      socket.off('medicine:created', handleUpdate);
      socket.off('transfer:approved', handleUpdate);
    };
  }, [socket, currentPHC]);

  async function fetchStock() {
    try {
      setLoading(true);
      const data = await apiRequest(`/stock/phc/${currentPHC || 'PHC-RAN-01'}`);
      setStock(data.stock || []);
    } catch (err) {
      console.error('Error fetching stock:', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchBatches() {
    try {
      const data = await apiRequest(`/stock/batches/${currentPHC || 'PHC-RAN-01'}`);
      setBatches(data.batches || []);
    } catch (err) {
      console.error('Error fetching batches:', err);
    }
  }


  async function handleTransaction(e) {
    e.preventDefault();
    if (!quantity || isNaN(quantity) || Number(quantity) <= 0) return;

    setSubmitting(true);
    setMessage(null);

    const clientTxId = 'TX-MANUAL-' + Date.now();

    try {
      const res = await apiRequest('/stock/transaction', {
        method: 'POST',
        body: JSON.stringify({
          transaction_uuid: clientTxId,
          phc_id: currentPHC,
          medicine_id: medicineId,
          quantity: Number(quantity),
          transaction_type: transactionType
        })
      });

      setMessage({ type: 'success', text: `Success: ${transactionType} processed. New quantity: ${res.new_quantity}` });
      setQuantity('');
      fetchStock();
      if (onTransactionLogged) onTransactionLogged();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Transaction failed' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
      
      {/* Header with Title and Challan Scanner Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900">Essential Medicines & Formulary</h3>
            <p className="text-xs text-slate-500 font-medium">National List of Essential Medicines (NLEM-2022) &bull; {currentPHC}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2.5 self-start sm:self-auto flex-wrap gap-y-2">
          <button
            onClick={() => setIsScannerOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Scan Delivery Challan</span>
          </button>

          <label className="text-xs font-semibold text-slate-500">Facility:</label>
          <select
            value={currentPHC}
            onChange={(e) => setCurrentPHC(e.target.value)}
            className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="PHC-RAN-01">PHC-RAN-01 (Ranchi Sadar PHC)</option>
            <option value="PHC-RAN-02">PHC-RAN-02 (Kanke Rural CHC)</option>
            <option value="PHC-RAN-03">PHC-RAN-03 (Namkum PHC)</option>
            <option value="DH-RAN-01">DH-RAN-01 (Ranchi District Hospital)</option>
            <option value="HWC-RAN-01">HWC-RAN-01 (Bundu Ayushman Arogya Mandir)</option>
            <option value="PHC-DHN-01">PHC-DHN-01 (Jharia Coalfield CHC)</option>
            <option value="PHC-PAT-01">PHC-PAT-01 (Patna City SDH)</option>
            <option value="PHC-GAY-01">PHC-GAY-01 (Bodh Gaya PHC)</option>
            <option value="PHC-KHO-01">PHC-KHO-01 (Bhubaneswar Urban CHC)</option>
            <option value="PHC-PUN-01">PHC-PUN-01 (Haveli Rural CHC)</option>
            <option value="PHC-BLR-01">PHC-BLR-01 (Anekal CHC)</option>
          </select>

          <button
            onClick={() => { fetchStock(); fetchBatches(); }}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition"
            title="Refresh Stock & Batches"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-100 pb-3 mb-4">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'inventory'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Pill className="w-3.5 h-3.5" />
          <span>Active SKU Inventory ({stock.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('batches')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'batches'
              ? 'bg-amber-50 text-amber-800 border border-amber-200 shadow-sm'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>FEFO Batch Expiry Watchdog</span>
          {batches.filter(b => b.status === 'CRITICAL_EXPIRY' || b.status === 'NEAR_EXPIRY').length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-600 text-white animate-pulse">
              {batches.filter(b => b.status === 'CRITICAL_EXPIRY' || b.status === 'NEAR_EXPIRY').length}
            </span>
          )}
        </button>
      </div>

      {/* Stock Cards Grid Tab */}
      {activeTab === 'inventory' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          {stock.map((item) => {
            const isCritical = item.quantity < 50;
            const isWarning = item.quantity >= 50 && item.quantity < 150;
            const isColdChain = item.storage_type === 'COLD_CHAIN_2_8C' || item.name?.toLowerCase().includes('vaccine') || item.name?.toLowerCase().includes('insulin');

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isCritical
                    ? 'border-rose-300 bg-rose-50/50'
                    : isWarning
                    ? 'border-amber-200 bg-amber-50/30'
                    : 'border-slate-200 bg-slate-50/40 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between mb-1.5">
                  <div>
                    <span className="font-extrabold text-xs text-slate-900 block">{item.medicine_name || item.medicine_id}</span>
                    {isColdChain && (
                      <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                        ❄️ Cold-Chain (2°C–8°C)
                      </span>
                    )}
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    isCritical ? 'bg-rose-200 text-rose-900 animate-pulse' :
                    isWarning ? 'bg-amber-200 text-amber-900' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {isCritical ? 'CRITICAL' : (isWarning ? 'LOW' : 'STABLE')}
                  </span>
                </div>

                <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-slate-100">
                  <div>
                    <span className="text-2xl font-black text-slate-900">{item.quantity}</span>
                    <span className="text-xs text-slate-500 ml-1">{item.unit || 'units'}</span>
                  </div>
                  <div className="text-right text-[11px] text-slate-500 font-medium">
                    <span>Burn: ~{item.daily_consumption || 15}/day</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FEFO Batch Watchdog Tab */}
      {activeTab === 'batches' && (
        <div className="mb-6 space-y-4">
          {/* FEFO Metrics Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Batches Monitored</span>
              <p className="text-xl font-extrabold text-slate-800">{batches.length}</p>
            </div>
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
              <span className="text-[10px] font-bold text-rose-700 uppercase">Expiring &le; 30 Days</span>
              <p className="text-xl font-extrabold text-rose-700">
                {batches.filter(b => b.status === 'CRITICAL_EXPIRY').length}
              </p>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <span className="text-[10px] font-bold text-amber-800 uppercase">Expiring &le; 60 Days</span>
              <p className="text-xl font-extrabold text-amber-800">
                {batches.filter(b => b.status === 'NEAR_EXPIRY').length}
              </p>
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <span className="text-[10px] font-bold text-emerald-800 uppercase">Stable Lifespan</span>
              <p className="text-xl font-extrabold text-emerald-800">
                {batches.filter(b => b.status === 'SAFE').length}
              </p>
            </div>
          </div>

          {/* Batches Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="py-2.5 px-3">Batch Number</th>
                  <th className="py-2.5 px-3">Medicine & Condition</th>
                  <th className="py-2.5 px-3">Challan Ref</th>
                  <th className="py-2.5 px-3">Expiry Date</th>
                  <th className="py-2.5 px-3">FEFO Status</th>
                  <th className="py-2.5 px-3">Stock Qty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {batches.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-6 text-center text-slate-400">
                      No tracked batches found for this facility. Scan a delivery challan to register fresh batches.
                    </td>
                  </tr>
                ) : (
                  batches.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                        {b.batch_number}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-slate-800 block">{b.medicine_name}</span>
                        <span className="text-[10px] text-slate-500">{b.storage_type === 'COLD_CHAIN_2_8C' ? '❄️ Cold-Chain (2–8°C)' : '📦 Ambient'}</span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600 text-[11px]">
                        {b.challan_ref || 'CH-JSMSCL-MANUAL'}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-700">
                        {b.expiry_date}
                        <span className="block text-[10px] text-slate-500 font-semibold">
                          ({b.days_to_expiry} days remaining)
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        {b.status === 'CRITICAL_EXPIRY' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 animate-pulse">
                            <AlertTriangle className="w-3 h-3 mr-1" /> FEFO #1 Urgent Dispatch
                          </span>
                        ) : b.status === 'NEAR_EXPIRY' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            <Clock className="w-3 h-3 mr-1" /> FEFO #2 Re-route Warning
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle className="w-3 h-3 mr-1" /> FEFO Stable
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-black text-slate-900 text-sm">
                        {b.quantity}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}


      {/* Transaction Intake Form */}
      <form onSubmit={handleTransaction} className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-3 flex items-center">
          <PlusCircle className="w-4 h-4 mr-1.5 text-emerald-600" /> Log Stock Movement (Idempotent)
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">Medicine (Select or Type)</label>
            <input
              type="text"
              list="stock-med-options"
              value={medicineId}
              onChange={(e) => setMedicineId(e.target.value)}
              className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="MED-001"
              required
            />
            <datalist id="stock-med-options">
              <option value="MED-001">Paracetamol 500mg Tablets</option>
              <option value="MED-002">Amoxicillin 250mg Capsules</option>
              <option value="MED-003">Oral Rehydration Salts (ORS)</option>
              <option value="MED-004">Insulin Glargine 100IU/ml</option>
              <option value="MED-005">Anti-Rabies Vaccine (ARV)</option>
              <option value="MED-006">Azithromycin 500mg Tablets</option>
              <option value="MED-007">Cetirizine 10mg Tablets</option>
              <option value="MED-008">Rotavirus Oral Vaccine</option>
            </datalist>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">Action</label>
            <select
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
              className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="INTAKE">📦 Restock / Intake</option>
              <option value="DISPENSE">💊 Dispense to Patients</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">Quantity</label>
            <input
              type="number"
              placeholder="e.g. 50"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
        </div>

        {message && (
          <div className={`p-2.5 rounded-lg text-xs font-semibold mb-3 ${
            message.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
          }`}>
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition shadow-sm flex items-center justify-center space-x-1.5 disabled:opacity-50"
        >
          <span>{submitting ? 'Recording...' : 'Submit Transaction'}</span>
        </button>
      </form>

      {/* Challan Scanner Modal */}
      <ChallanScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        phcId={currentPHC}
        onStockIngested={fetchStock}
      />
    </div>
  );
}
