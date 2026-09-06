import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { Mic, MicOff, Check, X, Sparkles, AlertCircle } from 'lucide-react';

export default function VoiceIntakeModal({ isOpen, onClose, onTransactionParsed }) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'hi-IN'; // Default to Hindi (can switch or speak English)

      rec.onresult = (e) => {
        const text = e.results[0][0].transcript;
        setTranscript(text);
        setIsRecording(false);
        handleParse(text);
      };

      rec.onerror = () => setIsRecording(false);
      rec.onend = () => setIsRecording(false);
      setRecognition(rec);
    }
  }, []);

  function toggleRecord() {
    if (!recognition) {
      alert('Speech recognition is not supported in this browser. You can type below directly.');
      return;
    }
    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      setTranscript('');
      setResult(null);
      recognition.start();
      setIsRecording(true);
    }
  }

  async function handleParse(textToParse) {
    const text = textToParse || transcript;
    if (!text.trim()) return;

    setProcessing(true);
    try {
      const res = await apiRequest('/ai/voice-intake', {
        method: 'POST',
        body: JSON.stringify({
          text,
          phc_id: 'PHC-RAN-01',
          language: 'hi'
        })
      });
      setResult(res.parsed);
    } catch (err) {
      console.error('Failed to parse voice:', err);
    } finally {
      setProcessing(false);
    }
  }

  async function applyParsedTransaction() {
    if (!result) return;
    try {
      if (result.type === 'STOCK_IN' || result.type === 'STOCK_OUT') {
        await apiRequest('/stock/transaction', {
          method: 'POST',
          body: JSON.stringify({
            transaction_uuid: 'TX-VOICE-' + Date.now(),
            phc_id: result.phc_id || 'PHC-RAN-01',
            medicine_id: result.medicine_id || 'MED-001',
            quantity: result.quantity || 50,
            transaction_type: result.type === 'STOCK_IN' ? 'INTAKE' : 'DISPENSE'
          })
        });
      } else if (result.type === 'BED_UPDATE') {
        await apiRequest('/beds/update', {
          method: 'POST',
          body: JSON.stringify({
            phc_id: result.phc_id || 'PHC-RAN-01',
            bed_type: result.bed_type || 'OXYGEN',
            occupied_beds: result.occupied_beds || 10
          })
        });
      }
      if (onTransactionParsed) onTransactionParsed();
      onClose();
    } catch (err) {
      alert('Failed to save transaction: ' + err.message);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-50 text-emerald-600 mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-xl text-slate-900">Vernacular Voice Intake</h3>
          <p className="text-xs text-slate-500 mt-1">Speak in Hindi or English (e.g., <span className="italic">"50 पैरासिटामोल बांटी गई"</span>)</p>
        </div>

        {/* Big Record Button */}
        <div className="flex justify-center mb-6">
          <button
            onClick={toggleRecord}
            className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-xl transition-all transform active:scale-95 ${
              isRecording
                ? 'bg-rose-500 ring-8 ring-rose-200 animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-700 ring-4 ring-emerald-100'
            }`}
          >
            {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </button>
        </div>

        {/* Editable Transcript */}
        <div className="mb-4">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Transcript or Note</label>
          <textarea
            rows="2"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Type or speak a sentence..."
            className="w-full text-xs font-medium p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
          />
        </div>

        <button
          onClick={() => handleParse()}
          disabled={processing || !transcript.trim()}
          className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition mb-4 disabled:opacity-50"
        >
          {processing ? 'Analyzing with NLP...' : 'Parse with Vernacular Engine'}
        </button>

        {/* Structured Result Preview */}
        {result && (
          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 mb-4 text-xs space-y-1.5">
            <div className="font-bold text-emerald-900 flex items-center justify-between">
              <span>Structured Telemetry Detected:</span>
              <span className="text-[10px] bg-emerald-200 px-2 py-0.5 rounded-full">{result.source}</span>
            </div>
            <div className="text-slate-700 space-y-1">
              <div><span className="font-semibold">Action:</span> {result.type}</div>
              {result.medicine_id && <div><span className="font-semibold">Medicine:</span> <span className="font-bold text-emerald-800">{result.medicine_name || result.medicine_id}</span> ({result.quantity} units)</div>}
              {result.bed_type && <div><span className="font-semibold">Beds:</span> {result.bed_type} ({result.occupied_beds} occupied)</div>}
            </div>

            <button
              onClick={applyParsedTransaction}
              className="w-full mt-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition shadow-sm flex items-center justify-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Confirm & Save to Ledger</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
