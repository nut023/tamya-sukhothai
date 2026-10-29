import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import { getHospitalLogoSvg } from './HospitalLogo';
import { Phone, Clock, Send, ShieldCheck, MapPin } from 'lucide-react';

import sukhothaiBoundary from '../data/sukhothai-boundary.json';
import sukhothaiMask from '../data/sukhothai-mask.json';

// Bounds strictly containing Sukhothai province
const SUKHOTHAI_BOUNDS = [
  [16.65, 99.20], // Southwest
  [17.85, 100.35]  // Northeast
];

// Controller to zoom / fit bounds
function MapController({ selectedHospital }) {
  const map = useMap();

  useEffect(() => {
    map.fitBounds(SUKHOTHAI_BOUNDS, { padding: [15, 15] });
  }, [map]);

  useEffect(() => {
    if (selectedHospital) {
      map.flyTo([selectedHospital.lat, selectedHospital.lng], 13, {
        duration: 1.2
      });
    }
  }, [selectedHospital, map]);

  return null;
}

export default function SukhothaiMap({
  hospitals = [],
  currentHospital,
  pendingCounts = {},
  onSelectTargetHospital,
  onSwitchCurrentHospital
}) {
  const defaultCenter = [17.15, 99.82];

  // Compact custom Leaflet divIcon using the Hospital Building Logo
  const createCustomMarker = (hosp) => {
    const isCurrent = currentHospital?.id === hosp.id;
    const pendingCount = pendingCounts[hosp.id] || 0;
    const svgString = getHospitalLogoSvg(hosp.id, 36);

    const markerHtml = `
      <div class="relative group cursor-pointer flex flex-col items-center" style="transform: translate(-50%, -50%);">
        ${
          pendingCount > 0
            ? '<div class="absolute -inset-2 rounded-full bg-rose-500/50 animate-ping"></div>'
            : isCurrent
            ? '<div class="absolute -inset-1.5 rounded-full bg-emerald-500/40 animate-pulse"></div>'
            : ''
        }
        
        <div class="relative flex items-center justify-center transition-transform transform duration-150 hover:scale-120">
          ${svgString}
          
          ${
            pendingCount > 0
              ? `<span class="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-black text-white shadow-lg ring-2 ring-white animate-bounce">
                  ${pendingCount}
                 </span>`
              : ''
          }
          ${
            isCurrent
              ? `<span class="absolute -top-2 left-1/2 -translate-x-1/2 flex items-center gap-0.5 rounded-full bg-emerald-600 px-1.5 py-0.2 text-[8px] font-black text-white shadow-md ring-1 ring-white whitespace-nowrap">
                  คุณอยู่นี่
                 </span>`
              : ''
          }
        </div>

        <!-- Name Label Pin Below -->
        <div class="mt-0.5">
          <span class="rounded bg-slate-900/85 px-1.5 py-0.5 text-[10px] font-bold text-white shadow backdrop-blur-sm whitespace-nowrap border border-white/20">
            ${hosp.shortName}
          </span>
        </div>
      </div>
    `;

    return L.divIcon({
      html: markerHtml,
      className: 'custom-hospital-marker',
      iconSize: [44, 52],
      iconAnchor: [22, 26],
      popupAnchor: [0, -28]
    });
  };

  return (
    <div className="relative w-full h-[540px] md:h-[600px] rounded-2xl overflow-hidden shadow-xl border border-slate-300">
      <MapContainer
        center={defaultCenter}
        zoom={9.5}
        minZoom={8.8}
        maxZoom={15}
        bounds={SUKHOTHAI_BOUNDS}
        maxBounds={SUKHOTHAI_BOUNDS}
        maxBoundsViscosity={1.0}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <MapController selectedHospital={null} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 1. Inverted Mask to dim outside Sukhothai province */}
        <GeoJSON
          data={sukhothaiMask}
          style={{
            fillColor: '#0f172a',
            fillOpacity: 0.42,
            stroke: false,
            interactive: false
          }}
        />

        {/* 2. Official Sukhothai Province Boundary Line */}
        <GeoJSON
          data={sukhothaiBoundary}
          style={{
            color: '#0284c7',
            weight: 3.5,
            opacity: 0.9,
            dashArray: '6, 4',
            fillColor: '#38bdf8',
            fillOpacity: 0.04,
            interactive: false
          }}
        />

        {/* Hospital Markers */}
        {hospitals.map((hosp) => {
          const isCurrent = currentHospital?.id === hosp.id;
          const pendingCount = pendingCounts[hosp.id] || 0;

          return (
            <Marker
              key={hosp.id}
              position={[hosp.lat, hosp.lng]}
              icon={createCustomMarker(hosp)}
            >
              <Popup className="custom-popup" minWidth={260}>
                <div className="p-1">
                  <div className="flex items-start gap-2.5 border-b border-slate-100 pb-2 mb-2">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: getHospitalLogoSvg(hosp.id, 38)
                      }}
                    />
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm leading-snug">
                        {hosp.name}
                      </h4>
                      <p className="text-xs text-slate-500">{hosp.district}</p>
                      <span className="inline-block mt-0.5 text-[10px] font-medium px-2 py-0.5 bg-sky-50 text-sky-700 rounded-full">
                        {hosp.type}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 mb-3">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>โทร: {hosp.phone} (ต่อ {hosp.pharmacyExt})</span>
                    </div>
                    {pendingCount > 0 && (
                      <div className="flex items-center gap-1.5 text-red-600 font-semibold bg-red-50 p-1.5 rounded">
                        <Clock className="w-3.5 h-3.5 text-red-500 animate-spin" />
                        <span>มีสัญญาณตามยาค้างอยู่ {pendingCount} รายการ</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-1.5 pt-1">
                    {isCurrent ? (
                      <div className="text-center py-2 px-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        นี่คือโรงพยาบาลต้นทางของคุณ
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => onSelectTargetHospital(hosp)}
                          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white rounded-lg font-bold text-xs shadow-md transition"
                        >
                          <Send className="w-3.5 h-3.5" />
                          กดส่งสัญญาณตามยามาที่นี่
                        </button>
                        <button
                          onClick={() => onSwitchCurrentHospital(hosp)}
                          className="w-full py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-medium transition"
                        >
                          สลับบทบาทเป็น รพ. นี้ (สำหรับทดสอบ)
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating Province Badge Tag */}
      <div className="absolute top-4 left-4 z-[400] bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-slate-200 pointer-events-auto flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-sky-500 ring-2 ring-sky-200" />
        <span className="text-xs font-bold text-slate-800">
          ขอบเขตจังหวัดสุโขทัย (9 อำเภอ)
        </span>
      </div>

      {/* Floating Legend / Quick hospital badge strip on the map */}
      <div className="absolute bottom-4 left-4 right-4 z-[400] bg-white/95 backdrop-blur-md p-2.5 rounded-xl shadow-lg border border-slate-200 pointer-events-auto">
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <div className="flex items-center gap-1.5 shrink-0 text-xs font-bold text-slate-700 mr-1">
            <MapPin className="w-3.5 h-3.5 text-sky-600" />
            <span>9 รพ.:</span>
          </div>
          {hospitals.map((hosp) => {
            const isCurrent = currentHospital?.id === hosp.id;
            const pending = pendingCounts[hosp.id] || 0;
            return (
              <button
                key={hosp.id}
                onClick={() => {
                  if (isCurrent) return;
                  onSelectTargetHospital(hosp);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition border ${
                  isCurrent
                    ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-300'
                    : pending > 0
                    ? 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100 ring-1 ring-rose-400'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-sky-50 hover:border-sky-300'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: hosp.badgeColor }}
                />
                <span>{hosp.shortName}</span>
                {pending > 0 && (
                  <span className="ml-0.5 px-1 bg-red-600 text-white text-[9px] rounded-full font-bold">
                    {pending}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
