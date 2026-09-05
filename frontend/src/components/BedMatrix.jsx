import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { Bed, AlertTriangle, ShieldCheck, HeartPulse } from 'lucide-react';

export default function BedMatrix({ selectedPHC }) {
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBeds();
  }, [selectedPHC]);

  async function fetchBeds() {
    try {
      setLoading(true);
      const data = await apiRequest(`/beds/phc/${selectedPHC || 'PHC-RAN-01'}`);
      setBeds(data.beds || []);
    } catch (err) {
      console.error('Error fetching beds:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
      <div className="flex items-center space-x-2.5 pb-4 mb-4 border-b border-slate-100">
        <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
          <HeartPulse className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-sm sm:text-base">Bed Availability & Occupancy</h3>
          <p className="text-xs text-slate-500">Live Telemetry for {selectedPHC || 'PHC-RAN-01'}</p>
        </div>
      </div>

      <div className="space-y-3.5">
        {beds.map((b) => {
          const rate = Math.round((b.occupied_beds / Math.max(1, b.total_beds)) * 100);
          const isCritical = rate >= 90;
          const isWarning = rate >= 75 && rate < 90;

          return (
            <div key={b.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1.5">
                <span className="flex items-center">
                  <Bed className="w-4 h-4 mr-1.5 text-slate-400" /> {b.bed_type} BEDS
                </span>
                <span className={`${isCritical ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-emerald-700'}`}>
                  {b.occupied_beds} / {b.total_beds} ({rate}%)
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isCritical ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, rate)}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
