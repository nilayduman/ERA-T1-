import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Exact GPS coordinates of the logistics nodes in Turkey
const CITY_METADATA = {
  "İstanbul Merkez Depo": { lat: 41.0082, lng: 28.9784, code: "IST", weather: "🌧️ Yağmurlu", temp: "14°C", delayRisk: "Orta" },
  "İzmir Dağıtım": { lat: 38.4192, lng: 27.1287, code: "IZM", weather: "☀️ Güneşli", temp: "24°C", delayRisk: "Yok" },
  "Ankara Bölge Hub": { lat: 39.9334, lng: 32.8597, code: "ANK", weather: "☁️ Bulutlu", temp: "16°C", delayRisk: "Yok" },
  "Samsun Kuzey Lojistik": { lat: 41.2867, lng: 36.3300, code: "SAM", weather: "💨 Rüzgarlı", temp: "15°C", delayRisk: "Düşük" },
  "Adana Güney Lojistik": { lat: 36.9914, lng: 35.3308, code: "ADA", weather: "☀️ Sıcak", temp: "28°C", delayRisk: "Yok" },
  "Erzurum Doğu Depo": { lat: 39.9000, lng: 41.2700, code: "ERZ", weather: "❄️ Karlı/Buzlu", temp: "4°C", delayRisk: "Yüksek" },
};

export default function TurkeyMap({ stockData, routesData, minStockDays, targetHours }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const routesRef = useRef([]);

  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [mapStyle, setMapStyle] = useState('standard'); // standard, satellite, dark

  if (!stockData || stockData.length === 0) return null;

  // 1. Group stock items by warehouse
  const warehouses = stockData.reduce((acc, curr) => {
    const name = curr.warehouse;
    if (!acc[name]) {
      acc[name] = {
        name,
        products: [],
        totalQty: 0,
        critical: false,
        metadata: CITY_METADATA[name] || { lat: 39.9, lng: 32.8, code: "UNK", weather: "☀️", temp: "20°C", delayRisk: "Yok" },
      };
    }
    const daysOfStock = curr.qty / (curr.daily_demand || 1);
    const isCritical = daysOfStock < (minStockDays || 3);

    acc[name].products.push({
      productId: curr.product_id,
      qty: curr.qty,
      demand: curr.daily_demand,
      days: Number(daysOfStock.toFixed(1)),
      critical: isCritical,
    });
    acc[name].totalQty += curr.qty;
    if (isCritical) {
      acc[name].critical = true;
    }
    return acc;
  }, {});

  const warehouseList = Object.values(warehouses);

  // 2. Initialize Leaflet Map
  useEffect(() => {
    if (!mapRef.current) return;

    // Reset if map instance already exists
    if (mapInstance.current) {
      mapInstance.current.remove();
      mapInstance.current = null;
    }

    // Google Maps Voyager / Light style tiles
    const tileUrls = {
      standard: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      dark: 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png'
    };

    mapInstance.current = L.map(mapRef.current, {
      center: [39.0, 35.2], // Centered on Turkey
      zoom: 6,
      minZoom: 5,
      maxZoom: 12,
      zoomControl: false, // Custom position Zoom Control below
    });

    // Add scale
    L.control.scale({ position: 'bottomright', imperial: false }).addTo(mapInstance.current);

    // Zoom control
    L.control.zoom({ position: 'bottomright' }).addTo(mapInstance.current);

    L.tileLayer(tileUrls[mapStyle], {
      attribution: mapStyle === 'satellite' ? 'Esri &copy;' : '&copy; OpenStreetMap, CartoDB',
      maxZoom: 18,
    }).addTo(mapInstance.current);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [mapStyle]);

  // 3. Render Markers & Routes dynamically
  useEffect(() => {
    if (!mapInstance.current) return;

    // Clear old elements
    markersRef.current.forEach(m => m.remove());
    routesRef.current.forEach(r => r.remove());
    markersRef.current = [];
    routesRef.current = [];

    // Draw Routes first (so they render below pins)
    (routesData || []).forEach((route) => {
      const fromMeta = CITY_METADATA[route.from_city];
      const toMeta = CITY_METADATA[route.to_city];
      if (!fromMeta || !toMeta) return;

      const isSlow = (route.avg_time_hours || 0) > (targetHours || 3.5);
      const color = isSlow ? '#EF4444' : '#10B981';

      // Draw Polyline
      const polyline = L.polyline([[fromMeta.lat, fromMeta.lng], [toMeta.lat, toMeta.lng]], {
        color: color,
        weight: 3.5,
        opacity: 0.85,
        dashArray: isSlow ? '8, 8' : 'none',
        className: 'cursor-pointer transition-all duration-300'
      }).addTo(mapInstance.current);

      polyline.on('click', () => {
        setSelectedRoute(route);
        setSelectedNode(null);
      });

      routesRef.current.push(polyline);
    });

    // Draw City Pin Markers
    warehouseList.forEach((warehouse) => {
      const { lat, lng, code } = warehouse.metadata;
      const isCritical = warehouse.critical;

      // Custom Google Maps styled drop pin HTML/CSS
      const pinColor = isCritical ? '#EF4444' : '#10B981';
      const shadowColor = isCritical ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.3)';

      const markerIcon = L.divIcon({
        className: 'custom-google-pin',
        iconSize: [32, 42],
        iconAnchor: [16, 42],
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 32px; height: 42px;">
            <!-- Outer Pulse animation if critical -->
            ${isCritical ? `
              <div style="
                position: absolute; 
                width: 32px; 
                height: 32px; 
                border-radius: 50%; 
                background: ${pinColor}; 
                opacity: 0.3; 
                animation: ping 1.6s cubic-bezier(0, 0, 0.2, 1) infinite;
                top: 0;
              "></div>
            ` : ''}

            <!-- Pin Body -->
            <svg width="32" height="42" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 0C7.16 0 0 7.16 0 16C0 28 16 42 16 42C16 42 32 28 32 16C32 7.16 24.84 0 16 0ZM16 22C12.68 22 10 19.32 10 16C10 12.68 12.68 10 16 10C19.32 10 22 12.68 22 16C22 19.32 19.32 22 16 22Z" 
                fill="${pinColor}" 
                stroke="#FFFFFF" 
                stroke-width="1.5"
                style="filter: drop-shadow(0px 3px 6px ${shadowColor});"
              />
              <!-- Tiny inner dot -->
              <circle cx="16" cy="16" r="6" fill="#FFFFFF"/>
            </svg>

            <!-- Floating City Label -->
            <div style="
              position: absolute;
              top: -20px;
              background: #FFFFFF;
              border: 1.5px solid ${pinColor};
              color: #2F4F4F;
              font-size: 10px;
              font-weight: 800;
              padding: 1px 6px;
              border-radius: 4px;
              white-space: nowrap;
              box-shadow: 0px 2px 4px rgba(0,0,0,0.12);
            ">
              ${code}
            </div>
          </div>
        `
      });

      const marker = L.marker([lat, lng], { icon: markerIcon }).addTo(mapInstance.current);

      marker.on('click', () => {
        setSelectedNode(warehouse);
        setSelectedRoute(null);
      });

      markersRef.current.push(marker);
    });

  }, [warehouseList, routesData, targetHours]);

  return (
    <div className="relative rounded-[2rem] border border-gray-200 bg-white p-6 shadow-xl transition-all duration-300 hover:shadow-2xl">

      {/* 1. Header with Controls */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-extrabold text-[#2F4F4F] flex items-center gap-2">
            🗺️ Google Maps Operasyonel Kontrol Ekranı (Live View)
          </h3>
          <p className="text-xs text-[#457B9D]">Etkileşimli gerçek harita katmanları, canlı koordinatlar ve rota akış analizi.</p>
        </div>

        {/* Map Layer Switcher (Google Style) */}
        <div className="flex bg-gray-100 border border-gray-200 rounded-xl p-1 gap-1 self-start sm:self-center">
          <button
            onClick={() => setMapStyle('standard')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${mapStyle === 'standard' ? 'bg-white text-[#2F4F4F] shadow-sm' : 'text-[#457B9D] hover:bg-white/50'}`}
          >
            🗺️ Harita
          </button>
          <button
            onClick={() => setMapStyle('satellite')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${mapStyle === 'satellite' ? 'bg-white text-[#2F4F4F] shadow-sm' : 'text-[#457B9D] hover:bg-white/50'}`}
          >
            🛰️ Uydu
          </button>
          <button
            onClick={() => setMapStyle('dark')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${mapStyle === 'dark' ? 'bg-white text-[#2F4F4F] shadow-sm' : 'text-[#457B9D] hover:bg-white/50'}`}
          >
            🌑 Gece
          </button>
        </div>
      </div>

      {/* 2. Main Map Container wrapper */}
      <div className="relative w-full h-[500px] rounded-2xl overflow-hidden border border-gray-200 shadow-inner z-10">

        {/* Leaflet Map Div */}
        <div ref={mapRef} className="w-full h-full" style={{ background: '#E2F1F8' }} />

        {/* 3. Floating Left Panel (Google Maps Place Card style!) */}
        {selectedNode && (
          <div className="absolute top-4 left-4 z-[1000] w-80 rounded-2xl border border-gray-200 bg-white p-5 text-[#2F4F4F] shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
              <h4 className="flex items-center gap-1.5 text-sm font-bold text-[#2F4F4F]">
                📍 {selectedNode.name}
              </h4>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-gray-400 hover:text-gray-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Google Style Address/Details */}
            <div className="space-y-3">
              <div className="rounded-xl bg-gray-50 p-3 text-xs border border-gray-100 space-y-1.5 text-gray-600">
                <div className="flex justify-between">
                  <span>Hava Durumu:</span>
                  <strong className="text-gray-800">{selectedNode.metadata.weather} ({selectedNode.metadata.temp})</strong>
                </div>
                <div className="flex justify-between">
                  <span>Koordinat:</span>
                  <span className="font-mono text-[10px] text-gray-500">{selectedNode.metadata.lat.toFixed(4)}°N, {selectedNode.metadata.lng.toFixed(4)}°E</span>
                </div>
                <div className="flex justify-between">
                  <span>Gecikme Riski:</span>
                  <span className={`font-bold ${selectedNode.critical ? "text-red-500" : "text-emerald-600"}`}>
                    {selectedNode.metadata.delayRisk}
                  </span>
                </div>
              </div>

              {/* Envanter Analiz Listesi */}
              <div className="space-y-2">
                <h5 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Envanter Durumu</h5>
                {selectedNode.products.map((p, idx) => (
                  <div key={idx} className="flex flex-col border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                    <div className="flex justify-between text-xs font-bold text-gray-800">
                      <span>📦 {p.productId}</span>
                      <span className={p.critical ? 'text-red-500 font-extrabold' : 'text-gray-700'}>
                        {p.qty} Adet
                      </span>
                    </div>
                    <div className="mt-0.5 flex justify-between text-[10px] text-gray-500">
                      <span>Günlük Talep: {p.demand}</span>
                      <span className={p.critical ? 'text-red-500 font-extrabold animate-pulse' : 'text-emerald-600 font-bold'}>
                        {p.days} Günlük Stok
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. Floating Left Panel for Route (Google Maps Direction Details style!) */}
        {selectedRoute && (() => {
          const fromInfo = CITY_METADATA[selectedRoute.from_city];
          const toInfo = CITY_METADATA[selectedRoute.to_city];
          const isSlow = (selectedRoute.avg_time_hours || 0) > (targetHours || 3.5);

          return (
            <div className="absolute top-4 left-4 z-[1000] w-80 rounded-2xl border border-gray-200 bg-white p-5 text-[#2F4F4F] shadow-2xl animate-fade-in">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
                <h4 className="flex items-center gap-1.5 text-sm font-bold text-[#2F4F4F]">
                  🛣️ Yol Tarifi & Rota Detayları
                </h4>
                <button
                  onClick={() => setSelectedRoute(null)}
                  className="text-gray-400 hover:text-gray-600 font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Google Direction Details */}
              <div className="space-y-3 text-xs text-gray-600">
                <div className="rounded-xl bg-gray-50 p-3 border border-gray-100 space-y-1.5">
                  <div className="flex justify-between">
                    <span>Hat Kodu:</span>
                    <strong className="text-gray-800">{selectedRoute.route_id}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Çıkış / Varış:</span>
                    <span className="font-bold text-[#2F4F4F]">{fromInfo?.code} ➔ {toInfo?.code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mesafe:</span>
                    <strong className="text-gray-800">{selectedRoute.distance_km} KM</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Tahmini Seyahat Süresi:</span>
                    <strong className={isSlow ? 'text-red-500 font-extrabold' : 'text-emerald-600'}>
                      {selectedRoute.avg_time_hours} Saat
                    </strong>
                  </div>
                </div>

                {isSlow && (
                  <div className="rounded-xl bg-red-50 border border-red-100 p-3 text-[10px] text-red-700 font-semibold space-y-1 leading-relaxed">
                    <p className="flex items-center gap-1">⚠️ Hedef süre ({targetHours} Saat) aşıldı!</p>
                    <p className="text-[9px] font-normal text-red-600">
                      <strong>Gecikme Nedeni:</strong> {toInfo?.code === 'ERZ' ? "Doğu Anadolu bölgesindeki yoğun karlanma ve yollarda buzlanma." : "Şehir içi trafik yoğunluğu ve rota üstü yüksek durak sayısı."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* 5. Google Maps Bottom Right Helper Label */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 border border-gray-200 px-3 py-1.5 rounded-lg shadow-md text-[10px] font-bold text-gray-500 pointer-events-none select-none">
          ℹ️ Detayları incelemek için herhangi bir pine veya rotaya tıklayın.
        </div>
      </div>
    </div>
  );
}
