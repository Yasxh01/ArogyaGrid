import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/client';
import { Mic, MicOff, Check, X, Sparkles, AlertCircle, Volume2, Globe } from 'lucide-react';

export default function VoiceIntakeModal({ isOpen, onClose, phcId = 'PHC-RAN-01', onTransactionParsed }) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [recognition, setRecognition] = useState(null);
  const [language, setLanguage] = useState('hi-IN'); // 'hi-IN' | 'en-IN'

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = language;

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
  }, [language]);

  function toggleRecord() {
    if (!recognition) {
      alert('Speech recognition is not supported in this browser. You can select a test prompt or type below directly.');
      return;
    }
    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      setTranscript('');
      setResult(null);
      try {
        recognition.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
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
          phc_id: phcId,
          language: language.startsWith('hi') ? 'hi' : 'en'
        })
      });
      setResult(res.parsed);
    } catch (err) {
      console.error('Failed to parse voice:', err);
    } finally {
      setProcessing(false);
    }
  }

  function handleSampleClick(sampleText) {
    setTranscript(sampleText);
    setResult(null);
    handleParse(sampleText);
  }

  async function applyParsedTransaction() {
    if (!result) return;
    try {
      if (result.type === 'STOCK_IN' || result.type === 'STOCK_OUT') {
        await apiRequest('/stock/transaction', {
          method: 'POST',
          body: JSON.stringify({
            transaction_uuid: 'TX-VOICE-' + Date.now(),
            phc_id: result.phc_id || phcId,
            medicine_id: result.medicine_id || 'MED-001',
            quantity: result.quantity || 50,
            transaction_type: result.type === 'STOCK_IN' ? 'INTAKE' : 'DISPENSE'
          })
        });
      } else if (result.type === 'BED_UPDATE') {
        await apiRequest('/beds/update', {
          method: 'POST',
          body: JSON.stringify({
            phc_id: result.phc_id || phcId,
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
      <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-50 text-emerald-600 mb-2">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-xl text-slate-900">Vernacular Voice Intake & NLP</h3>
          <p className="text-xs text-slate-500 mt-0.5">Grassroots phonetic NLP for frontline staff &bull; Facility: <span className="font-bold text-slate-700">{phcId}</span></p>
        </div>

        {/* Language Selector */}
        <div className="flex items-center justify-center space-x-2 mb-5">
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setLanguage('hi-IN')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                language === 'hi-IN' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🇮🇳 हिन्दी (Hindi)
            </button>
            <button
              onClick={() => setLanguage('en-IN')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                language === 'en-IN' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🌐 English (India)
            </button>
          </div>
        </div>

        {/* Big Record Button & Audio Wave Animation */}
        <div className="flex flex-col items-center justify-center mb-5">
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
          
          {isRecording ? (
            <div className="flex items-center space-x-1.5 mt-3">
              <span className="w-1.5 h-6 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-8 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-10 bg-rose-500 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-8 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-6 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="text-xs font-bold text-rose-600 ml-2">Listening... बोलिए</span>
            </div>
          ) : (
            <p className="text-[11px] text-slate-400 font-medium mt-2">Tap microphone to speak or click a sample below</p>
          )}
        </div>

        {/* Quick Test Sample Prompts */}
        <div className="mb-4">
          <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5">⚡ 1-Click Frontline Test Prompts:</span>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => handleSampleClick('५० ओआरएस बांटी गई')}
              className="px-2.5 py-1 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 transition"
            >
              "५० ओआरएस बांटी गई"
            </button>
            <button
              onClick={() => handleSampleClick('इमोक्सी सिलिन 30 पैकेट प्राप्त हुए')}
              className="px-2.5 py-1 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 transition"
            >
              "इमोक्सी सिलिन 30 पैकेट प्राप्त हुए"
            </button>
            <button
              onClick={() => handleSampleClick('बीस इंसुलिन जमा किए')}
              className="px-2.5 py-1 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 transition"
            >
              "बीस इंसुलिन जमा किए"
            </button>
            <button
              onClick={() => handleSampleClick('100 dolo tablet received')}
              className="px-2.5 py-1 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 transition"
            >
              "100 dolo tablet received"
            </button>
            <button
              onClick={() => handleSampleClick('5 oxygen bed occupied')}
              className="px-2.5 py-1 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 transition"
            >
              "5 oxygen bed occupied"
            </button>
          </div>
        </div>

        {/* Editable Transcript */}
        <div className="mb-4">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Transcript / Recognized Speech</label>
          <textarea
            rows="2"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Type or speak a sentence..."
            className="w-full text-xs font-medium p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
          />
        </div>

        <button
          onClick={() => handleParse()}
          disabled={processing || !transcript.trim()}
          className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition mb-4 disabled:opacity-50"
        >
          {processing ? 'Analyzing with Vernacular NLP...' : 'Parse with Vernacular Engine'}
        </button>

        {/* Structured Result Preview */}
        {result && (
          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 mb-4 text-xs space-y-1.5">
            <div className="font-bold text-emerald-900 flex items-center justify-between">
              <span>Structured Telemetry Detected:</span>
              <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded-full">{result.source}</span>
            </div>
            <div className="text-slate-700 space-y-1">
              <div><span className="font-semibold">Action:</span> <span className="font-bold text-emerald-800">{result.type}</span></div>
              {result.medicine_id && <div><span className="font-semibold">Medicine:</span> <span className="font-bold text-emerald-800">{result.medicine_name || result.medicine_id}</span> ({result.quantity} units)</div>}
              {result.bed_type && <div><span className="font-semibold">Beds:</span> <span className="font-bold text-emerald-800">{result.bed_type}</span> ({result.occupied_beds} occupied)</div>}
              {result.detected_intent && <div className="text-[11px] text-slate-500 italic mt-1">{result.detected_intent}</div>}
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

