import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { MessageSquare, Smartphone, X, Send, CheckCheck, Bell, ShieldAlert, Sparkles } from 'lucide-react';

export default function NotificationSimulatorModal({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  async function fetchNotifications() {
    try {
      setLoading(true);
      const res = await apiRequest('/notifications');
      setNotifications(res.notifications || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSimulate(type) {
    setSimulating(true);
    try {
      if (type === 'ASHA_COLD_CHAIN') {
        await apiRequest('/notifications/simulate', {
          method: 'POST',
          body: JSON.stringify({
            recipient_role: 'ASHA_WORKER',
            recipient_name: 'Sunita Devi (ASHA, Bundu)',
            channel: 'WHATSAPP',
            type: 'COLD_CHAIN_ALERT',
            message_hi: '⚠️ आरोग्यग्रिड सूचना: बुंडू उपकेंद्र के आइस-लाइन्ड रेफ्रिजरेटर का तापमान 8.2°C पहुँच गया है। कृपया बैकअप चालू करें।',
            message_en: '⚠️ ArogyaGrid Alert: Refrigerator at Bundu HWC reached 8.2°C. Please activate backup power.'
          })
        });
      } else if (type === 'CHO_VACCINE_ARRIVAL') {
        await apiRequest('/notifications/simulate', {
          method: 'POST',
          body: JSON.stringify({
            recipient_role: 'COMMUNITY_HEALTH_OFFICER',
            recipient_name: 'Dr. Ramesh Oraon (CHO)',
            channel: 'WHATSAPP',
            type: 'FEFO_SHIPMENT_ARRIVAL',
            message_hi: '📦 आरोग्यग्रिड रसद: JSMSCL से एंटी-रेबीज वैक्सीन का नया बैच आपके केंद्र पहुँच रहा है (15 मिनट शेष)।',
            message_en: '📦 ArogyaGrid Logistics: New Anti-Rabies vaccine batch arriving at your center in 15 mins.'
          })
        });
      } else if (type === 'IDSP_EPIDEMIC') {
        await apiRequest('/notifications/simulate', {
          method: 'POST',
          body: JSON.stringify({
            recipient_role: 'DISTRICT_OFFICER',
            recipient_name: 'Dr. B. K. Singh (Civil Surgeon)',
            channel: 'SMS_GATEWAY',
            type: 'IDSP_EPIDEMIC_SURGE',
            message_hi: '🚨 IDSP चेतावनी: नामकुम पीएचसी में तीव्र दस्त/हैजा क्लस्टर। ओआरएस और आईवी फ्लुइड बफर रवाना करें।',
            message_en: '🚨 IDSP Alert: Acute Diarrhea cluster at Namkum. Pre-position ORS & IV fluid buffers.'
          })
        });
      }
      await fetchNotifications();
    } catch (err) {
      alert('Simulation failed: ' + err.message);
    } finally {
      setSimulating(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-slate-100">
          <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-extrabold text-slate-900 text-base">WhatsApp Alerts for Village Health Workers</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">Direct Delivery</span>
            </div>
            <p className="text-xs text-slate-500">Instant WhatsApp and SMS alerts sent to ASHA workers and village clinic staff</p>
          </div>
        </div>

        {/* 1-Click Simulation Triggers */}
        <div className="mb-4 p-3 bg-slate-50 rounded-2xl border border-slate-200">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">⚡ Try Sending a Test Emergency Alert:</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              onClick={() => handleSimulate('ASHA_COLD_CHAIN')}
              disabled={simulating}
              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl text-[11px] font-bold transition flex items-center justify-center space-x-1"
            >
              <span>❄️ Vaccine Fridge Too Warm</span>
            </button>
            <button
              onClick={() => handleSimulate('CHO_VACCINE_ARRIVAL')}
              disabled={simulating}
              className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-[11px] font-bold transition flex items-center justify-center space-x-1"
            >
              <span>📦 New Medicine Arrived</span>
            </button>
            <button
              onClick={() => handleSimulate('IDSP_EPIDEMIC')}
              disabled={simulating}
              className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-[11px] font-bold transition flex items-center justify-center space-x-1"
            >
              <span>🚨 Disease Outbreak Alert</span>
            </button>
          </div>
        </div>

        {/* Notifications Feed */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-3.5 rounded-2xl border transition-all ${
                n.channel === 'WHATSAPP'
                  ? 'bg-[#e7f8ef]/60 border-[#25D366]/30'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
                <div className="flex items-center space-x-1.5">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                    n.channel === 'WHATSAPP' ? 'bg-[#25D366] text-white' : 'bg-slate-700 text-white'
                  }`}>
                    {n.channel}
                  </span>
                  <span className="text-slate-800">{n.recipient_name}</span>
                  <span className="text-slate-400 font-normal">({n.phone_masked})</span>
                </div>
                <div className="flex items-center space-x-1 text-slate-400 text-[10px]">
                  <span>{new Date(n.dispatched_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {n.channel === 'WHATSAPP' && <CheckCheck className="w-3.5 h-3.5 text-sky-500" />}
                </div>
              </div>

              {/* Vernacular Message Body */}
              <p className="text-xs font-semibold text-slate-900 mb-1 leading-relaxed">
                {n.template_hindi}
              </p>
              <p className="text-[11px] text-slate-500 italic">
                {n.template_english}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Integrates with Government NIC SMS Gateway & WhatsApp Business Cloud API</span>
          <span className="font-bold text-emerald-600">✔ Encrypted & DPDP Verified</span>
        </div>

      </div>
    </div>
  );
}
