import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { Bed, AlertTriangle, ShieldCheck, HeartPulse, Building2 } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

export default function BedMatrix({ selectedPHC: initialPHC, districtId = 'DIST-JH-01' }) {
  const { on, off } = useSocket();
  const [facilities, setFacilities] = useState([]);
  const [currentPHC, setCurrentPHC] = useState(initialPHC || '');
  const [beds, setBeds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load facilities for the selected district
  useEffect(() => {
    async function loadFacilities() {
      try {
        const data = await apiRequest(`/districts/${districtId}/facilities`);
        const facs = data.facilities || [];
        setFacilities(facs);
        
        // If initialPHC belongs to this district, keep it; otherwise default to first facility
        const belongs = facs.some(f => f.id === initialPHC);
        if (belongs) {
          setCurrentPHC(initialPHC);
        } else if (facs.length > 0) {
          setCurrentPHC(facs[0].id);
        }
      } catch (err) {
        console.error('Failed to load district facilities in BedMatrix:', err);
      }
    }
    loadFacilities();
  }, [districtId, initialPHC]);

  useEffect(() => {
    if (initialPHC && initialPHC !== currentPHC) {
      setCurrentPHC(initialPHC);
    }
  }, [initialPHC]);

  useEffect(() => {
    if (currentPHC) {
      fetchBeds();
    }
  }, [currentPHC]);

  useEffect(() => {
    const handleUpdate = () => {
      fetchBeds();
    };
    on('beds:updated', handleUpdate);
    return () => {
      off('beds:updated', handleUpdate);
    };
  }, [on, off, currentPHC]);

  async function fetchBeds() {
    if (!currentPHC) return;
    try {
      setLoading(true);
      const data = await apiRequest(`/beds/phc/${currentPHC}`);
      setBeds(data.beds || []);
    } catch (err) {
      console.error('Error fetching beds:', err);
    } finally {
      setLoading(false);
    }
  }

  const activeFacilityObj = facilities.find(f => f.id === currentPHC);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">Bed Availability & Occupancy</h3>
            <p className="text-xs text-slate-500">
              Live Telemetry for <span className="font-bold text-slate-800">{activeFacilityObj ? activeFacilityObj.name : currentPHC}</span> ({currentPHC})
            </p>
          </div>
        </div>

        {/* Dynamic Facility Selector */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <label className="text-xs font-semibold text-slate-500">Facility:</label>
          <select
            value={currentPHC}
            onChange={(e) => setCurrentPHC(e.target.value)}
            className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            {facilities.length > 0 ? (
              facilities.map(f => (
                <option key={f.id} value={f.id}>
                  {f.id} ({f.name})
                </option>
              ))
            ) : (
              <option value={currentPHC}>{currentPHC || 'Loading facilities...'}</option>
            )}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center text-xs text-slate-400">Loading live clinical bed data...</div>
      ) : beds.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400">No bed telemetry reported for this facility.</div>
      ) : (
        <div className="space-y-3.5">
          {beds.map((b) => {
            const rate = Math.round((b.occupied_beds / Math.max(1, b.total_beds)) * 100);
            const isCritical = rate >= 90;
            const isWarning = rate >= 75 && rate < 90;

            return (
              <div key={b.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1.5">
                  <span className="flex items-center">
                    <Bed className="w-4 h-4 mr-1.5 text-slate-400" /> {b.bed_type} BEDS
                  </span>
                  <span className={`${isCritical ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-emerald-700'}`}>
                    {b.occupied_beds} / {b.total_beds} ({rate}%)
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
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
      )}
    </div>
  );
}
