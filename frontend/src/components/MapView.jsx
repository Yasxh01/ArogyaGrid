import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { apiRequest } from '../api/client';
import { useSocket } from '../context/SocketContext';
import { AlertTriangle, Bed, Users, Pill, ShieldAlert, ArrowRight, Activity } from 'lucide-react';

function createCustomPin(status) {
  let color = '#10b981'; // Green
  let border = '#047857';
  if (status === 'CRITICAL') {
    color = '#ef4444'; // Red
    border = '#b91c1c';
  } else if (status === 'WARNING') {
    color = '#f59e0b'; // Amber
    border = '#b45309';
  }

  const html = `
    <div style="
      background-color: ${color};
      width: 28px;
      height: 28px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 2.5px solid white;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        width: 8px;
        height: 8px;
        background: white;
        border-radius: 50%;
        transform: rotate(45deg);
      "></div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28]
  });
}

const DISTRICT_CENTERS = {
  'DIST-JH-01': [23.35, 85.33], // Ranchi, Jharkhand
  'DIST-JH-02': [23.79, 86.43], // Dhanbad, Jharkhand
  'DIST-BR-01': [25.59, 85.13], // Patna, Bihar
  'DIST-BR-02': [24.79, 85.00], // Gaya, Bihar
  'DIST-OD-01': [20.18, 85.61]  // Khordha, Odisha
};

function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 11, { duration: 1.0 });
    }
  }, [center]);
  return null;
}

export default function MapView({ onSelectPHC, onQuickTransfer }) {
  const { on, off } = useSocket();
  const [districtData, setDistrictData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState('DIST-JH-01');

  async function fetchMap() {
    try {
      setLoading(true);
      const data = await apiRequest(`/districts/${selectedDistrict}/map-telemetry`);
      setDistrictData(data);
    } catch (err) {
      console.error('Failed to load map data:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMap();

    const handleUpdate = () => {
      fetchMap();
    };

    on('stock:updated', handleUpdate);
    on('beds:updated', handleUpdate);
    on('staff:updated', handleUpdate);
    on('alert:critical', handleUpdate);

    return () => {
      off('stock:updated', handleUpdate);
      off('beds:updated', handleUpdate);
      off('staff:updated', handleUpdate);
      off('alert:critical', handleUpdate);
    };
  }, [selectedDistrict, on, off]);

  const currentCenter = DISTRICT_CENTERS[selectedDistrict] || [23.35, 85.33];

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col h-[520px]">
      
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between pb-3 mb-2 border-b border-slate-100 gap-2">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-emerald-600" />
          <h2 className="font-bold text-slate-800 text-sm sm:text-base">National PHC Telemetry Map</h2>
          <span className="text-xs text-slate-500 font-medium">({districtData?.features?.length || 0} Centres Tracked)</span>
        </div>

        {/* District Selector */}
        <div className="flex items-center space-x-2">
          <label className="text-xs font-semibold text-slate-500">District:</label>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="text-xs font-semibold bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="DIST-JH-01">Ranchi (Jharkhand)</option>
            <option value="DIST-JH-02">Dhanbad (Jharkhand)</option>
            <option value="DIST-BR-01">Patna (Bihar)</option>
            <option value="DIST-BR-02">Gaya (Bihar)</option>
            <option value="DIST-OD-01">Khordha (Odisha)</option>
          </select>

          {/* Map Legend */}
          <div className="hidden lg:flex items-center space-x-3 text-[11px] font-medium pl-2 border-l border-slate-200">
            <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1"></span> Healthy</span>
            <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-1"></span> Warning</span>
            <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 mr-1 animate-pulse"></span> Critical Stockout</span>
          </div>
        </div>
      </div>

      {/* Map Body */}
      <div className="flex-1 w-full rounded-xl overflow-hidden relative">
        <MapContainer center={currentCenter} zoom={11} scrollWheelZoom={true} className="w-full h-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <RecenterMap center={currentCenter} />

          {districtData?.features?.map((feat) => {
            const props = feat.properties;
            const coords = [feat.geometry.coordinates[1], feat.geometry.coordinates[0]];
            return (
              <Marker
                key={props.id}
                position={coords}
                icon={createCustomPin(props.status)}
              >
                <Popup className="custom-popup">
                  <div className="p-1 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-900 pb-1 mb-1.5 border-b border-slate-100">
                      <span>{props.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        props.status === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                        props.status === 'WARNING' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {props.status}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-slate-600 mb-2">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center"><Pill className="w-3.5 h-3.5 mr-1 text-slate-400" /> Critical Meds:</span>
                        <span className={`font-bold ${props.critical_medicines_count > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                          {props.critical_medicines_count} / {props.total_medicines_tracked}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center"><Bed className="w-3.5 h-3.5 mr-1 text-slate-400" /> Bed Occupancy:</span>
                        <span className={`font-bold ${props.bed_occupancy_percentage > 85 ? 'text-rose-600' : 'text-slate-800'}`}>
                          {props.bed_occupancy_percentage}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center"><Users className="w-3.5 h-3.5 mr-1 text-slate-400" /> Staff on Duty:</span>
                        <span className="font-bold text-slate-800">{props.staff_on_duty_count}</span>
                      </div>
                    </div>

                    <div className="flex space-x-1.5 pt-1">
                      <button
                        onClick={() => onSelectPHC(props.id)}
                        className="flex-1 px-2 py-1 text-center bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg text-[11px] transition"
                      >
                        Inspect
                      </button>
                      {props.status === 'CRITICAL' && (
                        <button
                          onClick={() => onQuickTransfer(props.id)}
                          className="flex-1 px-2 py-1 text-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] transition flex items-center justify-center"
                        >
                          Rebalance <ArrowRight className="w-3 h-3 ml-1" />
                        </button>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
