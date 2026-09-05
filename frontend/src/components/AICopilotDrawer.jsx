import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { Bot, X, Send, Sparkles, FileText, AlertTriangle } from 'lucide-react';

export default function AICopilotDrawer({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Namaste! I am the ArogyaGrid AI Health Ops Copilot. Ask me about PHC stockout risks, bed occupancy, or transfer recommendations in Ranchi and Jharkhand.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchSituationReport();
    }
  }, [isOpen]);

  async function fetchSituationReport() {
    try {
      const data = await apiRequest('/ai/situation-report');
      setReport(data.report);
    } catch (err) {
      console.error('Failed to load report:', err);
    }
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await apiRequest('/ai/copilot', {
        method: 'POST',
        body: JSON.stringify({ query: userMsg })
      });
      setMessages(prev => [...prev, { sender: 'bot', text: res.answer }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, failed to process query: ' + err.message }]);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 max-w-lg w-full bg-white shadow-2xl z-50 flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">District Officer AI Copilot</h3>
            <p className="text-[11px] text-slate-500">Live Clinical Supply Chain Intelligence</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Situation Report Card */}
      {report && (
        <div className="p-4 bg-gradient-to-br from-indigo-50/60 to-slate-50 border-b border-indigo-100 text-xs">
          <div className="flex items-center space-x-1.5 font-bold text-indigo-900 mb-1">
            <FileText className="w-4 h-4" />
            <span>Executive Health Briefing (Jharkhand)</span>
          </div>
          <p className="text-slate-700 leading-relaxed mb-2">{report.executive_summary}</p>
          <div className="text-[11px] font-semibold text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-200">
            ⚠️ <strong>Action Required:</strong> {report.recommended_immediate_actions?.[0]}
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-emerald-600 text-white rounded-br-none'
                  : 'bg-slate-100 text-slate-800 rounded-bl-none'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="p-3 rounded-2xl bg-slate-100 text-xs text-slate-500 italic rounded-bl-none">
              Thinking with district telemetry...
            </div>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <form onSubmit={handleSend} className="p-3 border-t border-slate-100 flex items-center space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question (e.g. Which PHCs need insulin?)..."
          className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 font-medium"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition shadow-sm disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
}
