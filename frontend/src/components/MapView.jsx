import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { apiRequest } from '../api/client';
import { useSocket } from '../context/SocketContext';
import { AlertTriangle, Bed, Users, Pill, ShieldAlert, ArrowRight, Activity, Plane, Layers, Navigation } from 'lucide-react';

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
  'DIST-JH-01': [23.3441, 85.3096], // Ranchi, Jharkhand
  'DIST-JH-02': [23.7957, 86.4304], // Dhanbad, Jharkhand
  'DIST-BR-01': [25.5941, 85.1376], // Patna, Bihar
  'DIST-BR-02': [24.7955, 85.0002], // Gaya, Bihar
  'DIST-OD-01': [20.1812, 85.6174], // Khordha, Odisha
  'DIST-MH-01': [18.5204, 73.8567], // Pune, Maharashtra
  'DIST-KA-01': [12.9716, 77.5946]  // Bengaluru Urban, Karnataka
};

const GOOGLE_MAP_TYPES = {
  roadmap: {
    id: 'm',
    name: 'Roadmap',
    url: 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'
  },
  satellite: {
    id: 'y',
    name: 'Satellite',
    url: 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}'
  },
  terrain: {
    id: 'p',
    name: 'Terrain',
    url: 'https://mt{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}'
  }
};

function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, 11, { duration: 1.0 });
    }
  }, [center]);
  return null;
}

export default function MapView({ districtId, onSelectPHC, onQuickTransfer }) {
  const { on, off } = useSocket();
  const [districtData, setDistrictData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [districtsList, setDistrictsList] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState(districtId || 'DIST-JH-01');
  const [mapStyle, setMapStyle] = useState('roadmap');
  const [showDroneCorridors, setShowDroneCorridors] = useState(true);

  useEffect(() => {
    if (districtId && districtId !== selectedDistrict) {
      setSelectedDistrict(districtId);
    }
  }, [districtId]);

  useEffect(() => {
    async function loadDistricts() {
      try {
        const res = await apiRequest('/districts');
        if (res.districts && res.districts.length > 0) {
          setDistrictsList(res.districts);
        }
      } catch (err) {
        console.error('Failed to load district list:', err);
      }
    }
    loadDistricts();
  }, []);

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

  const currentCenter = (districtData?.district?.latitude && districtData?.district?.longitude)
    ? [districtData.district.latitude, districtData.district.longitude]
    : (DISTRICT_CENTERS[selectedDistrict] || [23.3441, 85.3096]);

  // Identify central hub (District Hospital or CHC) to calculate drone corridors to peripheral centres
  const hubFeature = districtData?.features?.find(f => f.properties?.facility_type === 'DISTRICT_HOSPITAL') || districtData?.features?.[0];
  const hubCoords = hubFeature ? [hubFeature.geometry.coordinates[1], hubFeature.geometry.coordinates[0]] : null;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col h-[520px]">
      
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between pb-3 mb-2 border-b border-slate-100 gap-2">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-emerald-600" />
          <h2 className="font-bold text-slate-800 text-sm sm:text-base">Live Health Map</h2>
          <span className="text-xs text-slate-500 font-medium">({districtData?.features?.length || 0} Centres Tracked)</span>
        </div>

        {/* District Selector & Drone Corridor Toggle */}
        <div className="flex items-center space-x-2.5 flex-wrap">
          <button
            onClick={() => setShowDroneCorridors(!showDroneCorridors)}
            className={`text-xs px-2.5 py-1 rounded-lg font-bold border transition flex items-center space-x-1 ${
              showDroneCorridors
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}
          >
            <span>🚁</span>
            <span className="hidden sm:inline">ICMR Drone Corridors</span>
            <span className="sm:hidden">Drone</span>
          </button>

          <div className="flex items-center space-x-1.5">
            <label className="text-xs font-semibold text-slate-500">District:</label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="text-xs font-bold bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              {districtsList.length > 0 ? (
                districtsList.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.state})</option>
                ))
              ) : (
                <>
                  <option value="DIST-JH-01">Ranchi (Jharkhand)</option>
                  <option value="DIST-JH-02">Dhanbad (Jharkhand)</option>
                  <option value="DIST-BR-01">Patna (Bihar)</option>
                  <option value="DIST-BR-02">Gaya (Bihar)</option>
                  <option value="DIST-OD-01">Khordha (Odisha)</option>
                  <option value="DIST-MH-01">Pune (Maharashtra)</option>
                  <option value="DIST-KA-01">Bengaluru Urban (Karnataka)</option>
                </>
              )}
            </select>
          </div>

          {/* Map Legend */}
          <div className="hidden lg:flex items-center space-x-3 text-[11px] font-medium pl-2 border-l border-slate-200">
            <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1"></span> Normal Stock</span>
            <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-1"></span> Low Stock</span>
            <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-rose-500 mr-1 animate-pulse"></span> Urgent Shortage</span>
          </div>
        </div>
      </div>

      {/* Map Body with Google Maps Platform Integration */}
      <div className="flex-1 w-full rounded-xl overflow-hidden relative">

        {/* Google Maps Layer Switcher */}
        <div className="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg shadow-md border border-slate-200 p-1 flex items-center space-x-1 text-[11px] font-bold">
          {Object.entries(GOOGLE_MAP_TYPES).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => setMapStyle(key)}
              className={`px-2.5 py-1 rounded-md transition ${
                mapStyle === key
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {cfg.name}
            </button>
          ))}
        </div>

        {/* Google Maps Platform Watermark Badge */}
        <div className="absolute bottom-3 left-3 z-[1000] pointer-events-none select-none flex items-center space-x-1.5 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-md shadow-sm border border-slate-200 text-xs font-bold">
          <span className="flex items-center font-extrabold tracking-tight">
            <span className="text-[#4285F4]">G</span>
            <span className="text-[#EA4335]">o</span>
            <span className="text-[#FBBC05]">o</span>
            <span className="text-[#4285F4]">g</span>
            <span className="text-[#34A853]">l</span>
            <span className="text-[#EA4335]">e</span>
          </span>
          <span className="text-slate-600 font-semibold text-[10px]">Maps Platform</span>
        </div>

        {/* Attribution Notice */}
        <div className="absolute bottom-3 right-3 z-[1000] pointer-events-none select-none text-[10px] text-slate-600 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded shadow-xs border border-slate-200/60">
          Map data &copy; Google &bull; ICMR Drone Airway Telemetry
        </div>

        <MapContainer
          center={currentCenter}
          zoom={11}
          scrollWheelZoom={true}
          attributionControl={false}
          className="w-full h-full"
        >
          <TileLayer
            key={mapStyle}
            url={GOOGLE_MAP_TYPES[mapStyle].url}
            subdomains={['0', '1', '2', '3']}
            maxZoom={20}
          />
          <RecenterMap center={currentCenter} />

          {/* ICMR Drone Airway Corridors */}
          {showDroneCorridors && hubCoords && districtData?.features?.map((feat) => {
            if (feat.properties?.id === hubFeature?.properties?.id) return null;
            const targetCoords = [feat.geometry.coordinates[1], feat.geometry.coordinates[0]];
            const isCritical = feat.properties?.status === 'CRITICAL';
            return (
              <Polyline
                key={`corridor-${feat.properties?.id}`}
                positions={[hubCoords, targetCoords]}
                pathOptions={{
                  color: isCritical ? '#6366f1' : '#94a3b8',
                  weight: isCritical ? 2.5 : 1.5,
                  dashArray: isCritical ? '6, 8' : '4, 6',
                  opacity: isCritical ? 0.9 : 0.4
                }}
              >
                <Tooltip sticky>
                  <div className="text-[11px] font-bold text-slate-800">
                    <div>🚁 ICMR Drone Airway Corridor</div>
                    <div className="text-slate-500 font-normal">
                      To: {feat.properties?.name} &bull; Est. Flight: 14 mins (55m faster than road)
                    </div>
                  </div>
                </Tooltip>
              </Polyline>
            );
          })}

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
                      <div className="flex items-center space-x-1.5">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-slate-100 text-slate-700 border border-slate-200">
                          {props.facility_type === 'DISTRICT_HOSPITAL' ? 'DH' :
                           props.facility_type === 'CHC' ? 'CHC' :
                           props.facility_type === 'SUB_CENTRE_HWC' ? 'HWC' : 'PHC'}
                        </span>
                        <span>{props.name}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        props.status === 'CRITICAL' ? 'bg-rose-100 text-rose-800' :
                        props.status === 'WARNING' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {props.status}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-slate-600 mb-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                        <span>Population Served:</span>
                        <span className="font-bold text-slate-700">{(props.population_served || 15000).toLocaleString('en-IN')} citizens</span>
                      </div>

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
                        View Details
                      </button>
                      {props.status === 'CRITICAL' && (
                        <button
                          onClick={() => onQuickTransfer(props.id)}
                          className="flex-1 px-2 py-1 text-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] transition flex items-center justify-center"
                        >
                          Send Medicines <ArrowRight className="w-3 h-3 ml-1" />
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
