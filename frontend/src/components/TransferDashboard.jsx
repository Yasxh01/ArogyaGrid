import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { useAuth, ALL_FACILITIES } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { Truck, ArrowRight, CheckCircle, Clock, ShieldCheck, MapPin, Zap } from 'lucide-react';

export default function TransferDashboard({ initialDestination, initialSource, initialMedicine, onTransferSuccess }) {
  const { user } = useAuth();
  const { on, off } = useSocket();
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Transfer Requisition Form
  const [sourcePHC, setSourcePHC] = useState(initialSource || 'DH-RAN-01');
  const [destPHC, setDestPHC] = useState(initialDestination || 'PHC-RAN-03');
  const [medicineId, setMedicineId] = useState(initialMedicine || 'MED-003');
  const [quantity, setQuantity] = useState(100);
  const [transportMode, setTransportMode] = useState('ICMR_DRONE');
  const [autoApprove, setAutoApprove] = useState(true);
  const [successBanner, setSuccessBanner] = useState(null);

  useEffect(() => {
    if (initialDestination) setDestPHC(initialDestination);
  }, [initialDestination]);

  useEffect(() => {
    if (initialSource) setSourcePHC(initialSource);
  }, [initialSource]);

  useEffect(() => {
    if (initialMedicine) setMedicineId(initialMedicine);
  }, [initialMedicine]);

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
      setSuccessBanner(null);
      await apiRequest('/transfers/request', {
        method: 'POST',
        body: JSON.stringify({
          source_phc_id: sourcePHC,
          destination_phc_id: destPHC,
          medicine_id: medicineId,
          quantity: parseInt(quantity, 10),
          transport_mode: transportMode,
          auto_approve: autoApprove
        })
      });
      fetchTransfers();
      setSuccessBanner(
        autoApprove
          ? `⚡ Stock transferred & emergency restock completed for ${destPHC}! Shortage mitigated.`
          : `✓ Transfer request queued for approval.`
      );
      if (onTransferSuccess) onTransferSuccess();
      setTimeout(() => setSuccessBanner(null), 6000);
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
      setSuccessBanner(`⚡ Transfer approved and stock delivered!`);
      if (onTransferSuccess) onTransferSuccess();
      setTimeout(() => setSuccessBanner(null), 5000);
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
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">Send Medicines to Another Clinic</h3>
            <p className="text-xs text-slate-500">Share supplies between health centres by Road or Drone</p>
          </div>
        </div>

        {successBanner && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-bold text-xs mb-3 animate-in fade-in flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successBanner}</span>
          </div>
        )}

        <form onSubmit={handleCreateTransfer} className="space-y-3 text-xs">
          <div>
            <label className="font-semibold text-slate-600 block mb-1">Sending Health Centre (From)</label>
            <input
              type="text"
              list="donor-phc-options"
              value={sourcePHC}
              onChange={(e) => setSourcePHC(e.target.value)}
              placeholder="e.g. DH-RAN-01, District Hospital"
              className="w-full font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
            <datalist id="donor-phc-options">
              {ALL_FACILITIES.map(f => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.facility_type})
                </option>
              ))}
            </datalist>
          </div>

          <div>
            <label className="font-semibold text-slate-600 block mb-1">Receiving Health Centre (To)</label>
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
              {ALL_FACILITIES.map(f => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.facility_type})
                </option>
              ))}
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
                placeholder="e.g. MED-003, ORS"
                className="font-semibold bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
              <datalist id="transfer-med-options">
                <option value="MED-001">Paracetamol 500mg</option>
                <option value="MED-002">Amoxicillin 250mg</option>
                <option value="MED-003">ORS Sachets (Diarrheal / Cholera)</option>
                <option value="MED-004">Insulin Glargine (Cold-Chain)</option>
                <option value="MED-005">Anti-Rabies Vaccine (Cold-Chain)</option>
                <option value="MED-006">Azithromycin 500mg</option>
                <option value="MED-007">Cetirizine 10mg</option>
                <option value="MED-008">Rotavirus Vaccine</option>
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

          <div>
            <label className="font-semibold text-slate-600 block mb-1">Delivery Route Method</label>
            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              <label className={`flex items-center space-x-1.5 p-2 rounded-lg cursor-pointer transition border ${transportMode === 'ROAD_ESCROW' ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-1 ring-emerald-500' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}>
                <input 
                  type="radio" 
                  name="transportMode" 
                  value="ROAD_ESCROW"
                  checked={transportMode === 'ROAD_ESCROW'}
                  onChange={() => setTransportMode('ROAD_ESCROW')}
                  className="text-emerald-600" 
                />
                <span>🚚 Standard Road</span>
              </label>
              <label className={`flex items-center space-x-1.5 p-2 rounded-lg cursor-pointer transition border ${transportMode === 'ICMR_DRONE' ? 'bg-indigo-50 border-indigo-500 text-indigo-900 ring-1 ring-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'}`}>
                <input 
                  type="radio" 
                  name="transportMode" 
                  value="ICMR_DRONE"
                  checked={transportMode === 'ICMR_DRONE'}
                  onChange={() => setTransportMode('ICMR_DRONE')}
                  className="text-indigo-600" 
                />
                <span>🛸 Fast Aerial Drone</span>
              </label>
            </div>
          </div>

          <label className="flex items-center space-x-2 pt-1 cursor-pointer">
            <input
              type="checkbox"
              checked={autoApprove}
              onChange={(e) => setAutoApprove(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-0 cursor-pointer"
            />
            <span className="font-bold text-slate-700 text-xs">
              ⚡ Fast-Track: Auto-Approve & Move Stock Immediately
            </span>
          </label>

          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-sm flex items-center justify-center space-x-1"
          >
            <span>Send Medicines Now</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </form>
      </div>

      {/* Active Transfer Ledger */}
      <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">Medicine Transfer History & Deliveries</h3>
            <p className="text-xs text-slate-500">Track shipments moving between health centres by Road or ICMR Drone</p>
          </div>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            {transfers.length} Total Shipments
          </span>
        </div>

        <div className="space-y-3">
          {transfers.map((t) => {
            const isApproved = t.status === 'APPROVED';
            const isDrone = t.transport_mode === 'ICMR_DRONE';
            return (
              <div key={t.id} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/40 hover:bg-slate-50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center space-x-2 mb-1.5 flex-wrap gap-y-1">
                    <span className="font-extrabold text-slate-900">{t.id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {t.status === 'APPROVED' ? 'Approved & En Route' : 'Pending Approval'}
                    </span>

                    {isDrone ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-800 flex items-center">
                        🛸 Drone Flight ({t.drone_telemetry?.drone_flight_time_mins || 14}m flight &bull; {t.drone_telemetry?.time_saved_mins || 55}m faster than road)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                        🚚 Road Delivery ({t.route_distance_km || 15} km)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 text-slate-600 font-semibold">
                    <span className="text-slate-800">{t.source_phc_id}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-800">{t.destination_phc_id}</span>
                    <span className="text-slate-400">|</span>
                    <span className="text-emerald-700 font-bold">{t.quantity} units ({t.medicine_id})</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-end sm:self-center">
                  {!isApproved && canApprove && (
                    <button
                      onClick={() => handleApprove(t.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition text-xs shadow-xs"
                    >
                      Approve & Dispatch
                    </button>
                  )}
                  {isApproved && (
                    <span className="text-emerald-700 font-bold flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1 text-emerald-600" /> Delivered
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {transfers.length === 0 && (
            <div className="text-center py-10 text-slate-400 text-xs">
              No transfers logged. Request an emergency transfer using the form.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
