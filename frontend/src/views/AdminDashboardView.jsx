import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import StatsBanner from '../components/StatsBanner';
import FederatedCenter from '../components/FederatedCenter';
import { Pill, PlusCircle, Building2, ShieldCheck, Database, Layers, Check, X } from 'lucide-react';

export default function AdminDashboardView({ activeTab }) {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Antibiotic');
  const [unit, setUnit] = useState('strips');
  const [minStock, setMinStock] = useState(100);
  const [dailyBurn, setDailyBurn] = useState(25);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMedicines();
  }, []);

  async function fetchMedicines() {
    try {
      setLoading(true);
      const data = await apiRequest('/stock/medicines');
      setMedicines(data.medicines || []);
    } catch (err) {
      console.error('Failed to load medicines:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddMedicine(e) {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      await apiRequest('/stock/medicines', {
        method: 'POST',
        body: JSON.stringify({
          name,
          category,
          unit,
          minimum_stock: minStock,
          daily_base_consumption: dailyBurn
        })
      });
      setName('');
      setIsAddModalOpen(false);
      fetchMedicines();
    } catch (err) {
      alert('Failed to create medicine: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (activeTab === 'federated') {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <StatsBanner />
        <FederatedCenter />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <StatsBanner />

      {/* Top Action Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-black text-lg text-slate-900">National Healthcare Formulary & Supply Catalog</h2>
          <p className="text-xs text-slate-500 font-medium">Add and provision essential medicines across all 150,000+ PHCs in India</p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition shadow-sm flex items-center space-x-2 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Add Custom Medicine</span>
        </button>
      </div>

      {/* Medicines Table */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
        <h3 className="font-extrabold text-sm text-slate-900 mb-3 flex items-center">
          <Pill className="w-4 h-4 mr-1.5 text-emerald-600" /> Active Formulary Catalog ({medicines.length} Drugs Tracked)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="pb-3">Drug ID</th>
                <th className="pb-3">Medicine Name</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Unit</th>
                <th className="pb-3">Min Reserve</th>
                <th className="pb-3">Base Burn Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {medicines.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 font-extrabold text-slate-900">{m.id}</td>
                  <td className="py-3 font-bold text-slate-900">{m.name}</td>
                  <td className="py-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-semibold text-[10px]">
                      {m.category}
                    </span>
                  </td>
                  <td className="py-3">{m.unit}</td>
                  <td className="py-3 font-bold text-slate-800">{m.minimum_stock} units</td>
                  <td className="py-3 text-slate-500">~{m.daily_base_consumption || 15}/day</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Custom Medicine Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 relative animate-in zoom-in-95">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-black text-lg text-slate-900 mb-1">Add Custom Medicine to Catalog</h3>
            <p className="text-xs text-slate-500 mb-4 font-medium">This drug will immediately be provisioned to all PHC inventory records.</p>

            <form onSubmit={handleAddMedicine} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Medicine Name</label>
                <input
                  type="text"
                  placeholder="e.g. Azithromycin 500mg"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full font-semibold bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full font-semibold bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none"
                  >
                    <option value="Antibiotic">Antibiotic</option>
                    <option value="Antipyretic">Antipyretic</option>
                    <option value="Cold-Chain">Cold-Chain / Vaccine</option>
                    <option value="Essential">Essential Drug</option>
                    <option value="Cardiovascular">Cardiovascular</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Packaging Unit</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full font-semibold bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none"
                  >
                    <option value="strips">Strips</option>
                    <option value="vials">Vials</option>
                    <option value="bottles">Bottles</option>
                    <option value="sachets">Sachets</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Min Threshold</label>
                  <input
                    type="number"
                    value={minStock}
                    onChange={(e) => setMinStock(e.target.value)}
                    className="w-full font-semibold bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Daily Base Consumption</label>
                  <input
                    type="number"
                    value={dailyBurn}
                    onChange={(e) => setDailyBurn(e.target.value)}
                    className="w-full font-semibold bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 outline-none"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-md disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Provision Medicine to All PHCs'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
