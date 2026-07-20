'use client';

import { useMemo } from 'react';
import { useEarthStore } from '../stores/earth.store';
import { useMarketsStore } from '@/features/markets/stores/markets.store';
import { marketEngine } from '@/engines';
import { X, Navigation, Anchor } from 'lucide-react';

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): { km: number; nm: number } {
  const RUrl_km = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const km = RUrl_km * c;
  const nm = km * 0.539957; // Nautical miles conversion
  return { km, nm };
}

export function CoordinateTelemetryCard() {
  const selectedCoordinate = useEarthStore((s) => s.selectedCoordinate);
  const setSelectedCoordinate = useEarthStore((s) => s.setSelectedCoordinate);
  const selectedMarketId = useMarketsStore((s) => s.selectedMarketId);

  const referenceInfo = useMemo(() => {
    if (!selectedCoordinate) return null;
    
    // Find active market or fallback to London
    let refName = 'GMT Prime Meridian (London)';
    let refLat = 51.5074;
    let refLng = -0.1278;

    if (selectedMarketId) {
      const market = marketEngine.getMarketById(selectedMarketId);
      if (market) {
        refName = `${market.city} (${market.id})`;
        refLat = market.coordinates[0];
        refLng = market.coordinates[1];
      }
    }

    const { km, nm } = haversineDistance(
      selectedCoordinate.lat,
      selectedCoordinate.lng,
      refLat,
      refLng
    );

    return {
      refName,
      refLat,
      refLng,
      km,
      nm,
    };
  }, [selectedCoordinate, selectedMarketId]);

  if (!selectedCoordinate || !referenceInfo) return null;

  return (
    <div
      className="fixed bottom-24 left-6 z-50 w-80 max-md:left-3 max-md:right-3 max-md:w-auto rounded-lg border border-white/8 p-4 shadow-2xl backdrop-blur-md max-h-[40vh] overflow-y-auto"
      style={{
        background: 'rgba(5, 8, 16, 0.85)',
      }}
    >
      <div className="flex items-center justify-between border-b border-white/8 pb-2">
        <div className="flex items-center gap-2">
          <Navigation className="h-4 w-4 text-emerald-400 animate-pulse" />
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-emerald-400">
            Telemetry Card
          </span>
        </div>
        <button
          onClick={() => setSelectedCoordinate(null)}
          className="text-white/40 hover:text-white/80 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 space-y-3 font-mono text-[11px]">
        {/* Clicked Coordinates */}
        <div className="space-y-1">
          <div className="text-white/40 uppercase tracking-widest text-[9px]">
            Target Coordinates
          </div>
          <div className="flex justify-between text-white/90 bg-white/2 px-2 py-1 rounded">
            <span>LAT:</span>
            <span>{selectedCoordinate.lat.toFixed(5)}°</span>
          </div>
          <div className="flex justify-between text-white/90 bg-white/2 px-2 py-1 rounded">
            <span>LNG:</span>
            <span>{selectedCoordinate.lng.toFixed(5)}°</span>
          </div>
          <div className="flex justify-between text-white/90 bg-white/2 px-2 py-1 rounded">
            <span>ZOOM LEVEL:</span>
            <span className="text-emerald-400 font-bold">L{useEarthStore.getState().zoomLevel}</span>
          </div>
        </div>

        {/* Reference Coordinates */}
        <div className="space-y-1">
          <div className="text-white/40 uppercase tracking-widest text-[9px]">
            Reference Point
          </div>
          <div className="text-white/80 font-semibold truncate bg-white/2 px-2 py-1 rounded-t">
            {referenceInfo.refName}
          </div>
          <div className="flex justify-between text-white/60 bg-white/2 px-2 py-1 rounded-b">
            <span>REF:</span>
            <span>
              {referenceInfo.refLat.toFixed(4)}°, {referenceInfo.refLng.toFixed(4)}°
            </span>
          </div>
        </div>

        {/* Haversine Distance */}
        <div className="space-y-1 pt-1">
          <div className="text-white/40 uppercase tracking-widest text-[9px] flex items-center gap-1">
            <Anchor className="h-3 w-3" />
            Haversine Distance
          </div>
          <div className="border border-emerald-500/20 rounded p-2 bg-emerald-500/2 space-y-1">
            <div className="flex justify-between text-emerald-400">
              <span>Metric:</span>
              <span className="font-semibold">
                {referenceInfo.km.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{' '}
                km
              </span>
            </div>
            <div className="flex justify-between text-emerald-400">
              <span>Nautical:</span>
              <span className="font-semibold">
                {referenceInfo.nm.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{' '}
                NM
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ZoomBadge() {
  const zoomLevel = useEarthStore((s) => s.zoomLevel);
  return (
    <div
      className="fixed bottom-6 right-6 z-50 rounded border border-white/8 px-3 py-1 font-mono text-[10px] text-white/60 tracking-wider backdrop-blur-md"
      style={{ background: 'rgba(5, 8, 16, 0.85)' }}
    >
      ZOOM: <span className="text-emerald-400 font-bold">L{zoomLevel}</span>
    </div>
  );
}