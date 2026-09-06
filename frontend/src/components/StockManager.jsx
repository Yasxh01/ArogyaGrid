import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { Pill, PlusCircle, AlertCircle, TrendingUp, CheckCircle, RefreshCw } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

export default function StockManager({ selectedPHC, onTransactionLogged }) {
  const { socket } = useSocket();
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Intake Form State
  const [medicineId, setMedicineId] = useState('MED-001');
  const [quantity, setQuantity] = useState('');
  const [transactionType, setTransactionType] = useState('INTAKE');
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchStock();
  }, [selectedPHC]);

  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => {
      fetchStock();
    };
    socket.on('stock:updated', handleUpdate);
    socket.on('medicine:created', handleUpdate);
    socket.on('transfer:approved', handleUpdate);
    return () => {
      socket.off('stock:updated', handleUpdate);
      socket.off('medicine:created', handleUpdate);
      socket.off('transfer:approved', handleUpdate);
    };
  }, [socket, selectedPHC]);

  async function fetchStock() {
    try {
      setLoading(true);
      const data = await apiRequest(`/stock/phc/${selectedPHC || 'PHC-RAN-01'}`);
      setStock(data.stock || []);
    } catch (err) {
      console.error('Error fetching stock:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleTransaction(e) {
    e.preventDefault();
    if (!quantity || isNaN(quantity) || Number(quantity) <= 0) return;

    setSubmitting(true);
    setMessage(null);

    const txUuid = 'TX-WEB-' + Date.now() + '-' + Math.floor(Math.random() * 10000);

    try {
      const res = await apiRequest('/stock/transaction', {
        method: 'POST',
        body: JSON.stringify({
          transaction_uuid: txUuid,
          phc_id: selectedPHC || 'PHC-RAN-01',
          medicine_id: medicineId,
          quantity: parseInt(quantity, 10),
          transaction_type: transactionType
        })
      });

      setMessage({
        type: 'success',
        text: `Transaction recorded! New quantity: ${res.current_stock}. Risk: ${res.prediction?.risk_level || 'LOW'}`
      });
      setQuantity('');
      fetchStock();
      if (onTransactionLogged) onTransactionLogged();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
      
      {/* Title */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">Medicine Stock & Consumption</h3>
            <p className="text-xs text-slate-500">Live Inventory for {selectedPHC || 'PHC-RAN-01'}</p>
          </div>
        </div>
        <button
          onClick={fetchStock}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition"
          title="Refresh Stock"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stock Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {stock.map((item) => {
          const isCritical = item.quantity < 50;
          const isWarning = item.quantity >= 50 && item.quantity < 150;
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
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-xs text-slate-900">{item.medicine_name || item.medicine_id}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  isCritical ? 'bg-rose-200 text-rose-900 animate-pulse' :
                  isWarning ? 'bg-amber-200 text-amber-900' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {isCritical ? 'CRITICAL' : (isWarning ? 'LOW' : 'STABLE')}
                </span>
              </div>

              <div className="flex items-baseline justify-between mt-2">
                <div>
                  <span className="text-2xl font-extrabold text-slate-900">{item.quantity}</span>
                  <span className="text-xs text-slate-500 ml-1">{item.unit || 'units'}</span>
                </div>
                <div className="text-right text-[11px] text-slate-500">
                  <span>Burn: ~{item.daily_consumption || 15}/day</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

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
              placeholder="e.g. Paracetamol, MED-001"
              className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
            <datalist id="stock-med-options">
              {stock.map(s => (
                <option key={s.id} value={s.medicine_id}>{s.name || s.medicine_id}</option>
              ))}
              <option value="MED-001">Paracetamol 500mg</option>
              <option value="MED-002">Amoxicillin 250mg</option>
              <option value="MED-003">ORS Sachets</option>
              <option value="MED-004">Insulin Glargine</option>
              <option value="MED-005">Anti-Rabies Vaccine</option>
            </datalist>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">Action</label>
            <select
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
              className="w-full text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
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

    </div>
  );
}
