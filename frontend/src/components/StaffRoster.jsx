import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { Users, UserCheck, Clock, PlusCircle } from 'lucide-react';

export default function StaffRoster({ selectedPHC }) {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [role, setRole] = useState('DOCTOR');
  const [shift, setShift] = useState('MORNING');

  useEffect(() => {
    fetchStaff();
  }, [selectedPHC]);

  async function fetchStaff() {
    try {
      setLoading(true);
      const data = await apiRequest(`/staff/phc/${selectedPHC || 'PHC-RAN-01'}`);
      setStaff(data.staff || []);
    } catch (err) {
      console.error('Error fetching staff:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckIn(e) {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await apiRequest('/staff/attendance', {
        method: 'POST',
        body: JSON.stringify({
          phc_id: selectedPHC || 'PHC-RAN-01',
          staff_name: name,
          role,
          shift,
          status: 'ON_DUTY'
        })
      });
      setName('');
      fetchStaff();
    } catch (err) {
      console.error('Check-in failed:', err);
    }
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
      <div className="flex items-center space-x-2.5 pb-4 mb-4 border-b border-slate-100">
        <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-sm sm:text-base">Medical Personnel Attendance</h3>
          <p className="text-xs text-slate-500">Active Duty Roster for {selectedPHC || 'PHC-RAN-01'}</p>
        </div>
      </div>

      <div className="space-y-2 mb-4 max-h-48 overflow-y-auto pr-1">
        {staff.map((s) => (
          <div key={s.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
            <div className="flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <div>
                <span className="font-bold text-slate-800 block">{s.staff_name}</span>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">{s.role} &bull; {s.shift} SHIFT</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
              {s.status}
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={handleCheckIn} className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
        <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-2 flex items-center">
          <PlusCircle className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Staff Shift Check-In
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
          <input
            type="text"
            placeholder="Staff Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="DOCTOR">Doctor</option>
            <option value="NURSE">Nurse</option>
            <option value="PHARMACIST">Pharmacist</option>
            <option value="SPECIALIST">Specialist</option>
          </select>
          <select
            value={shift}
            onChange={(e) => setShift(e.target.value)}
            className="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="MORNING">Morning Shift</option>
            <option value="EVENING">Evening Shift</option>
            <option value="NIGHT">Night Shift</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-xs transition"
        >
          Check-In to Shift
        </button>
      </form>
    </div>
  );
}
