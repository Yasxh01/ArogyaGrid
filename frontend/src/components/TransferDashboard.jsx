import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Truck, ArrowRight, CheckCircle, Clock, ShieldCheck, MapPin } from 'lucide-react';

export default function TransferDashboard() {
  const { user } = useAuth();
  const { on, off } = useSocket();
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Transfer Requisition Form
  const [sourcePHC, setSourcePHC] = useState('PHC-RAN-02');
  const [destPHC, setDestPHC] = useState('PHC-RAN-03');
  const [medicineId, setMedicineId] = useState('MED-001');
  const [quantity, setQuantity] = useState(100);

  useEffect(() => {
    fetchTransfers();

    const handleTransferUpdate = () => {
      fetchTransfers();
    };

    on('transfer:requested', handleTransferUpdate);
    on('transfer:approved', handleTransferUpdate);
    on('transfer:dispatched', handleTransferUpdate);

    return () => {
      off('transfer:requested', handleTransferUpdate);
      off('transfer:approved', handleTransferUpdate);
      off('transfer:dispatched', handleTransferUpdate);
    };
  }, [on, off]);

  async function fetchTransfers() {
    try {
      setLoading(true);
      const data = await apiRequest('/transfers');
      setTransfers(data.transfers || []);
    } catch (err) {
      console.error('Error loading transfers:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateTransfer(e) {
    e.preventDefault();
    try {
      await apiRequest('/transfers/request', {
        method: 'POST',
        body: JSON.stringify({
          source_phc_id: sourcePHC,
          destination_phc_id: destPHC,
          medicine_id: medicineId,
          quantity: parseInt(quantity, 10)
        })
      });
      fetchTransfers();
    } catch (err) {
      alert('Transfer request failed: ' + err.message);
    }
  }

  async function handleApprove(transferId) {
    try {
      await apiRequest(`/transfers/${transferId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'APPROVED' })
      });
      fetchTransfers();
    } catch (err) {
      alert('Approval failed: ' + err.message);
    }
  }

  const canApprove = user?.role === 'ADMIN' || user?.role === 'DISTRICT_OFFICER';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Requisition Form */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 h-fit">
        <div className="flex items-center space-x-2.5 pb-4 mb-4 border-b border-slate-100">
          <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">Request Resource Rebalance</h3>
            <p className="text-xs text-slate-500">Cross-District Transfer Dispatch</p>
          </div>
        </div>

        <form onSubmit={handleCreateTransfer} className="space-y-3 text-xs">
          <div>
            <label className="font-semibold text-slate-600 block mb-1">Donor PHC (Select or Type)</label>
            <input
              type="text"
              list="donor-phc-options"
              value={sourcePHC}
              onChange={(e) => setSourcePHC(e.target.value)}
              placeholder="e.g. PHC-RAN-02, Sadar PHC"
              className="w-full font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
            <datalist id="donor-phc-options">
              <option value="PHC-RAN-01">Ranchi Sadar PHC</option>
              <option value="PHC-RAN-02">Kanke Rural PHC (Surplus)</option>
              <option value="PHC-PAT-01">Patna City PHC</option>
            </datalist>
          </div>

          <div>
            <label className="font-semibold text-slate-600 block mb-1">Destination PHC (Select or Type)</label>
            <input
              type="text"
              list="dest-phc-options"
              value={destPHC}
              onChange={(e) => setDestPHC(e.target.value)}
              placeholder="e.g. PHC-RAN-03, Namkum PHC"
              className="w-full font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
            <datalist id="dest-phc-options">
              <option value="PHC-RAN-03">Namkum PHC (Critical Shortage)</option>
              <option value="PHC-DHN-01">Jharia Coalfield PHC</option>
              <option value="PHC-PAT-01">Patna City PHC</option>
            </datalist>
          </div>

          <div>
            <label className="font-semibold text-slate-600 block mb-1">Medicine & Quantity</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                list="transfer-med-options"
                value={medicineId}
                onChange={(e) => setMedicineId(e.target.value)}
                placeholder="e.g. MED-001, Paracetamol"
                className="font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
              <datalist id="transfer-med-options">
                <option value="MED-001">Paracetamol 500mg</option>
                <option value="MED-002">Amoxicillin 250mg</option>
                <option value="MED-003">ORS Sachets</option>
                <option value="MED-004">Insulin Glargine</option>
                <option value="MED-005">Anti-Rabies Vaccine</option>
              </datalist>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 outline-none"
                placeholder="Qty"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-sm"
          >
            Dispatch Rebalance Request
          </button>
        </form>
      </div>

      {/* Active Transfer Ledger */}
      <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">Inter-District Transfer Escrow</h3>
            <p className="text-xs text-slate-500">Real-time Chain of Custody</p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            {transfers.length} Total Logs
          </span>
        </div>

        <div className="space-y-3">
          {transfers.map((t) => {
            const isApproved = t.status === 'APPROVED';
            return (
              <div key={t.id} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/40 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center space-x-2 mb-1.5">
                    <span className="font-extrabold text-slate-900">{t.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {t.status}
                    </span>
                    <span className="text-slate-400">&bull; {t.route_distance_km || 15} km</span>
                  </div>

                  <div className="flex items-center space-x-2 text-slate-600 font-semibold">
                    <span className="text-slate-800">{t.source_phc_id}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-800">{t.destination_phc_id}</span>
                    <span className="text-slate-400">|</span>
                    <span className="text-emerald-700 font-bold">{t.quantity} units ({t.medicine_id})</span>
                  </div>
                </div>

                {t.status === 'PENDING' && canApprove && (
                  <button
                    onClick={() => handleApprove(t.id)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition shadow-sm flex items-center justify-center space-x-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Approve Escrow</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
