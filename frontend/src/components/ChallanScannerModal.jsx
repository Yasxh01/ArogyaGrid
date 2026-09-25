import React, { useState } from 'react';
import { apiRequest } from '../api/client';
import { 
  FileText, 
  UploadCloud, 
  Camera, 
  Check, 
  X, 
  Sparkles, 
  AlertCircle, 
  Package, 
  Calendar, 
  ShieldCheck, 
  RefreshCw 
} from 'lucide-react';

export default function ChallanScannerModal({ isOpen, onClose, phcId = 'PHC-RAN-01', onStockIngested }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [ingesting, setIngesting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  if (!isOpen) return null;

  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setSuccessMessage(null);
    }
  }

  function handleUseSampleChallan() {
    setSelectedFile({ name: 'Govt_Challan_JSMSCL_2024_Sample.jpg' });
    setPreviewUrl('https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3');
    setResult(null);
    setSuccessMessage(null);
    runDigitization(null);
  }

  async function runDigitization(base64Data) {
    setScanning(true);
    setSuccessMessage(null);
    try {
      const res = await apiRequest('/ai/digitize-challan', {
        method: 'POST',
        body: JSON.stringify({
          imageBase64: base64Data || '',
          mimeType: selectedFile?.type || 'image/jpeg',
          phc_id: phcId
        })
      });
      setResult(res.challan);
    } catch (err) {
      alert('Challan digitization failed: ' + err.message);
    } finally {
      setScanning(false);
    }
  }

  async function handleConfirmStockIntake() {
    if (!result || !result.items || result.items.length === 0) return;

    setIngesting(true);
    try {
      const transactions = result.items.map((item, index) => ({
        transaction_uuid: `TX-CHALLAN-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 4)}`,
        phc_id: phcId,
        medicine_id: item.medicine_id || 'MED-001',
        quantity: item.quantity || 100,
        type: 'STOCK_IN',
        batch_number: item.batch_number,
        challan_ref: result.challan_number
      }));

      await apiRequest('/telemetry/intake', {
        method: 'POST',
        body: JSON.stringify({ transactions })
      });

      setSuccessMessage(`Successfully credited ${result.items.length} items from Challan #${result.challan_number} into facility inventory!`);
      if (onStockIngested) onStockIngested();
      setTimeout(() => {
        onClose();
        setSuccessMessage(null);
        setResult(null);
      }, 1500);
    } catch (err) {
      alert('Stock intake failed: ' + err.message);
    } finally {
      setIngesting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-black text-slate-900 text-base">Multimodal Gemini Vision Challan Digitizer</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Google AI
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Converts physical delivery slips & handwritten logs into structured batch inventory
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {successMessage ? (
            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <h4 className="font-extrabold text-emerald-900 text-base">Stock Ledger Updated!</h4>
              <p className="text-xs text-emerald-700 font-medium">{successMessage}</p>
            </div>
          ) : (
            <>
              {/* Upload Dropzone */}
              {!result && (
                <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 text-center transition flex flex-col items-center justify-center bg-slate-50/50">
                  <UploadCloud className="w-10 h-10 text-slate-400 mb-2" />
                  <p className="text-sm font-extrabold text-slate-800 mb-1">
                    Upload or Drop Medicine Delivery Challan
                  </p>
                  <p className="text-xs text-slate-500 mb-4">
                    Supports JPG, PNG, or Camera photos of physical paper challans
                  </p>

                  <div className="flex items-center space-x-3">
                    <label className="cursor-pointer px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition">
                      <span>Choose File</span>
                      <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                    </label>

                    <button
                      onClick={handleUseSampleChallan}
                      className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 transition flex items-center space-x-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Use Sample Govt Challan</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Scanning Loader */}
              {scanning && (
                <div className="p-8 text-center space-y-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
                  <h4 className="text-sm font-extrabold text-slate-800">
                    Google Gemini 1.5/2.0 Flash Vision Ingesting Document...
                  </h4>
                  <p className="text-xs text-slate-500">
                    Extracting NLEM drug codes, batch numbers, expiration dates, and quantities
                  </p>
                </div>
              )}

              {/* Extracted Structured Result Preview */}
              {result && (
                <div className="space-y-4">
                  {/* Challan Metadata Banner */}
                  <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200/80 flex flex-col sm:flex-row justify-between gap-3 text-xs">
                    <div>
                      <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">Verified Challan</span>
                      <h4 className="font-extrabold text-slate-900 text-sm">{result.challan_number}</h4>
                      <p className="text-slate-600">{result.supplier_name}</p>
                    </div>

                    <div className="sm:text-right">
                      <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">Recipient Facility</span>
                      <p className="font-extrabold text-slate-900">{result.recipient_facility || phcId}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded bg-white text-emerald-700 font-bold border border-emerald-200 text-[10px]">
                        Confidence: {Math.round(result.confidence_score * 100)}% ({result.source})
                      </span>
                    </div>
                  </div>

                  {/* Items Table */}
                  <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-3">Medicine & NLEM Code</th>
                          <th className="p-3">Batch No</th>
                          <th className="p-3">Expiry Date</th>
                          <th className="p-3">Quantity</th>
                          <th className="p-3">Storage</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {result.items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="p-3 font-extrabold text-slate-900">
                              <div>{item.medicine_name}</div>
                              <span className="text-[10px] font-mono text-slate-400 font-normal">{item.nlem_code}</span>
                            </td>
                            <td className="p-3 font-mono font-bold text-slate-700">{item.batch_number}</td>
                            <td className="p-3 font-semibold text-slate-600">{item.expiry_date}</td>
                            <td className="p-3 font-black text-emerald-700">{item.quantity} {item.unit || 'units'}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                item.storage_requirement === 'COLD_CHAIN_2_8C'
                                  ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                  : 'bg-slate-100 text-slate-600'
                              }`}>
                                {item.storage_requirement === 'COLD_CHAIN_2_8C' ? '❄️ 2°C–8°C' : '📦 Ambient'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center justify-end space-x-3 pt-2">
                    <button
                      onClick={() => setResult(null)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                    >
                      Scan Another
                    </button>
                    <button
                      disabled={ingesting}
                      onClick={handleConfirmStockIntake}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center space-x-2"
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>{ingesting ? 'Updating Stock Ledger...' : 'Confirm & Ingest Stock'}</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
