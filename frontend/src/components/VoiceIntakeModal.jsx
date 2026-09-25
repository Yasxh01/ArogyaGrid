import React, { useState, useEffect, useRef } from 'react';
import { apiRequest } from '../api/client';
import { Mic, MicOff, Check, X, Sparkles, AlertCircle, Volume2, Globe, Languages } from 'lucide-react';

const REGIONAL_LANGUAGES = [
  { code: 'hi-IN', label: 'हिन्दी (Hindi)', flag: '🇮🇳' },
  { code: 'bho-IN', label: 'भोजपुरी (Bhojpuri)', flag: '🌾' },
  { code: 'mr-IN', label: 'मराठी (Marathi)', flag: '🚩' },
  { code: 'or-IN', label: 'ଓଡ଼ିଆ (Odia)', flag: '🌊' },
  { code: 'ta-IN', label: 'தமிழ் (Tamil)', flag: '🏛️' },
  { code: 'bn-IN', label: 'বাংলা (Bengali)', flag: '🌸' },
  { code: 'en-IN', label: 'English (India)', flag: '🌐' }
];

const SAMPLE_PROMPTS = {
  'hi-IN': [
    '५० ओआरएस पैकेट बांटी गई',
    'इमोक्सी सिलिन 30 पैकेट प्राप्त हुए',
    'बीस इंसुलिन वायल जमा किए',
    '5 ऑक्सीजन बेड भरे हुए हैं'
  ],
  'bho-IN': [
    'अस्पताल में पेरासिटामोल के ५० गोली मिलल बा',
    'बीस गो ओआरएस पैकेट बांट दिहल गईल',
    '१० गो सुई के जरूरत बा'
  ],
  'mr-IN': [
    'प्राथमिक आरोग्य केंद्रात ५० पॅरासिटामॉल प्राप्त झाले',
    '२० ओआरएस पाकिट वाटप केले',
    '५ ऑक्सिजन बेड भरलेले आहेत'
  ],
  'or-IN': [
    'ପ୍ରାଥମିକ ସ୍ୱାସ୍ଥ୍ୟ କେନ୍ଦ୍ର ପାଇଁ ୫୦ ପାରାସିଟାମଲ ପ୍ରାପ୍ତ ହେଲା',
    '୨୦ ଓଆରଏସ ପ୍ୟାକେଟ ବଣ୍ଟନ କରାଗଲା'
  ],
  'ta-IN': [
    'சுகாதார மையத்திற்கு 50 பாராசிட்டமால் பெறப்பட்டது',
    '20 ORS பாக்கெட்டுகள் வழங்கப்பட்டன'
  ],
  'bn-IN': [
    'স্বাস্থ্য কেন্দ্রে ৫০টি প্যারাসিটামল গ্রহণ করা হয়েছে',
    '২০টি ওআরএস প্যাকেট বিতরণ করা হয়েছে'
  ],
  'en-IN': [
    '100 dolo tablet received',
    '50 units ORS distributed today',
    '5 oxygen beds currently occupied'
  ]
};

export default function VoiceIntakeModal({ isOpen, onClose, phcId = 'PHC-RAN-01', onTransactionParsed }) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [translation, setTranslation] = useState('');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [language, setLanguage] = useState('hi-IN');
  const [cloudEngine, setCloudEngine] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Setup media recorder for real audio streaming to Google Cloud Speech-to-Text
  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        await processAudioWithCloudSpeech(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setTranscript('');
      setTranslation('');
      setResult(null);
    } catch (err) {
      console.warn('Microphone access unavailable or denied, falling back to Web Speech API:', err);
      fallbackWebSpeech();
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }

  function fallbackWebSpeech() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not available. Please use the 1-click test prompts or type in the box below.');
      return;
    }
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
    rec.start();
    setIsRecording(true);
  }

  async function processAudioWithCloudSpeech(audioBlob) {
    setProcessing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result;
        try {
          const res = await apiRequest('/cloud/voice/transcribe', {
            method: 'POST',
            body: JSON.stringify({
              audioBase64: base64Audio,
              languageCode: language
            })
          });

          if (res && res.transcript) {
            setTranscript(res.transcript);
            setCloudEngine(res.engine || 'Google Cloud Speech v2');
            
            // Translate if not English
            if (language !== 'en-IN') {
              try {
                const transRes = await apiRequest('/cloud/voice/translate', {
                  method: 'POST',
                  body: JSON.stringify({
                    text: res.transcript,
                    targetLanguage: 'en'
                  })
                });
                if (transRes?.translatedText) {
                  setTranslation(transRes.translatedText);
                }
              } catch (e) {
                console.warn('Translation call skipped:', e);
              }
            }

            handleParse(res.transcript);
          }
        } catch (err) {
          console.error('Cloud Speech API failed:', err);
          handleParse(transcript);
        } finally {
          setProcessing(false);
        }
      };
    } catch (err) {
      console.error('Audio processing error:', err);
      setProcessing(false);
    }
  }

  function toggleRecord() {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
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
          language: language.split('-')[0]
        })
      });
      setResult(res.parsed);
    } catch (err) {
      console.error('Failed to parse voice:', err);
    } finally {
      setProcessing(false);
    }
  }

  async function handleSampleClick(sampleText) {
    setTranscript(sampleText);
    setResult(null);
    setTranslation('');
    
    // Automatically trigger translation for non-English sample prompts
    if (language !== 'en-IN') {
      try {
        const transRes = await apiRequest('/cloud/voice/translate', {
          method: 'POST',
          body: JSON.stringify({ text: sampleText, targetLanguage: 'en' })
        });
        if (transRes?.translatedText) {
          setTranslation(transRes.translatedText);
        }
      } catch (e) {
        console.warn('Translation failed:', e);
      }
    }

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

  const currentPrompts = SAMPLE_PROMPTS[language] || SAMPLE_PROMPTS['hi-IN'];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-4">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-50 text-indigo-600 mb-2">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-xl text-slate-900">Google Cloud Speech & Translation</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Vernacular Voice Intake &bull; Cloud Speech-to-Text v2 &bull; Facility: <span className="font-bold text-slate-700">{phcId}</span>
          </p>
        </div>

        {/* Regional Language Selector */}
        <div className="mb-4">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
            <Languages className="w-3.5 h-3.5 text-indigo-500" />
            <span>Select Regional Dialect (Google Cloud Speech v2):</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {REGIONAL_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  setTranscript('');
                  setTranslation('');
                  setResult(null);
                }}
                className={`px-2 py-1.5 rounded-xl text-xs font-semibold text-left transition flex items-center gap-1.5 border ${
                  language === lang.code
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{lang.flag}</span>
                <span className="truncate">{lang.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Big Record Button & Audio Wave Animation */}
        <div className="flex flex-col items-center justify-center mb-4">
          <button
            onClick={toggleRecord}
            className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-xl transition-all transform active:scale-95 ${
              isRecording
                ? 'bg-rose-500 ring-8 ring-rose-200 animate-pulse'
                : 'bg-indigo-600 hover:bg-indigo-700 ring-4 ring-indigo-100'
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
              <span className="text-xs font-bold text-rose-600 ml-2">Recording audio stream...</span>
            </div>
          ) : (
            <p className="text-[11px] text-slate-400 font-medium mt-2">
              Tap mic to stream to Google Cloud Speech v2 or click a sample below
            </p>
          )}
        </div>

        {/* 1-Click Test Prompts in Selected Dialect */}
        <div className="mb-4">
          <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5">
            ⚡ 1-Click Dialect Test Prompts ({language}):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {currentPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSampleClick(prompt)}
                className="px-2.5 py-1 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-800 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 transition"
              >
                "{prompt}"
              </button>
            ))}
          </div>
        </div>

        {/* Editable Transcript */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Speech Transcript
            </label>
            {cloudEngine && (
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                {cloudEngine}
              </span>
            )}
          </div>
          <textarea
            rows="2"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Recognized speech will appear here..."
            className="w-full text-xs font-medium p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
          />
        </div>

        {/* Translation Banner if translated */}
        {translation && (
          <div className="mb-3 p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs">
            <span className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">
              🌐 Google Cloud Translation (English):
            </span>
            <span className="text-slate-800 font-medium">{translation}</span>
          </div>
        )}

        <button
          onClick={() => handleParse()}
          disabled={processing || !transcript.trim()}
          className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition mb-4 disabled:opacity-50"
        >
          {processing ? 'Processing with Vernacular NLP...' : 'Parse & Extract Structured Telemetry'}
        </button>

        {/* Structured Result Preview */}
        {result && (
          <div className="p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200 mb-4 text-xs space-y-1.5">
            <div className="font-bold text-indigo-900 flex items-center justify-between">
              <span>Structured Telemetry Detected:</span>
              <span className="text-[10px] bg-indigo-200 text-indigo-900 font-bold px-2 py-0.5 rounded-full">{result.source}</span>
            </div>
            <div className="text-slate-700 space-y-1">
              <div><span className="font-semibold">Action:</span> <span className="font-bold text-indigo-800">{result.type}</span></div>
              {result.medicine_id && <div><span className="font-semibold">Medicine:</span> <span className="font-bold text-indigo-800">{result.medicine_name || result.medicine_id}</span> ({result.quantity} units)</div>}
              {result.bed_type && <div><span className="font-semibold">Beds:</span> <span className="font-bold text-indigo-800">{result.bed_type}</span> ({result.occupied_beds} occupied)</div>}
              {result.detected_intent && <div className="text-[11px] text-slate-500 italic mt-1">{result.detected_intent}</div>}
            </div>

            <button
              onClick={applyParsedTransaction}
              className="w-full mt-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition shadow-sm flex items-center justify-center space-x-1.5"
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
