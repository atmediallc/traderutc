/**
 * Earth Store
 *
 * Zustand store managing all Earth rendering state:
 * - Quality settings
 * - View control state (ECharts globe compatible)
 * - Interaction flags
 * - Performance monitoring
 * - Selected and hovered countries and coordinates
 * - Zoom levels
 */
import { create } from 'zustand';
import { renderingEngine } from '@/engines';
import { useMarketsStore } from '@/features/markets/stores/markets.store';
import { useUTCStore } from '@/features/utc/stores/utc.store';
import { timeEngine } from '@/engines';
import type { GlobeCountryInfo } from '@/features/earth/components/Globe/globe.types';

export type EarthQuality = 'low' | 'medium' | 'high';

interface GlobeCameraState {
  /** Camera distance from Earth center (ECharts globe units) */
  distance: number;
  /** View alpha angle (latitude) */
  alpha: number;
  /** View beta angle (longitude) */
  beta: number;
  /** Whether camera is animating */
  isAnimating: boolean;
}

interface EarthState {
  /** Current rendering quality level */
  quality: EarthQuality;
  /** Whether auto-rotation is enabled */
  autoRotate: boolean;
  /** Whether the Earth is currently being dragged */
  isDragging: boolean;
  /** Currently focused market city (for camera animation) */
  focusedCity: string | null;
  /** Camera state (ECharts-compatible) */
  camera: GlobeCameraState;

  // Layer visibility
  postProcessingEnabled: boolean;
  cloudsVisible: boolean;
  atmosphereVisible: boolean;
  starsVisible: boolean;

  // Selection & interaction state
  selectedCountry: GlobeCountryInfo | null;
  hoveredCountry: GlobeCountryInfo | null;
  selectedCoordinate: { lat: number; lng: number } | null;
  zoomLevel: number; // 1 to 6
  sunPositionOverride: [number, number, number] | null;
}

interface EarthActions {
  setQuality: (quality: EarthQuality) => void;
  setAutoRotate: (enabled: boolean) => void;
  setIsDragging: (dragging: boolean) => void;
  focusCity: (cityId: string | null) => void;
  setCameraDistance: (distance: number) => void;
  setCameraAlpha: (alpha: number) => void;
  setCameraBeta: (beta: number) => void;
  setCameraAnimating: (animating: boolean) => void;
  resetCamera: () => void;
  togglePostProcessing: () => void;
  toggleClouds: () => void;
  toggleAtmosphere: () => void;
  toggleStars: () => void;

  setSelectedCountry: (country: GlobeCountryInfo | null) => void;
  setHoveredCountry: (country: GlobeCountryInfo | null) => void;
  setSelectedCoordinate: (coord: { lat: number; lng: number } | null) => void;
  setZoomLevel: (level: number) => void;
}

export const useEarthStore = create<EarthState & EarthActions>((set) => ({
  // State
  quality: 'high' as EarthQuality,
  autoRotate: false,
  isDragging: false,
  focusedCity: null,
  camera: {
    distance: 200,
    alpha: 20,
    beta: 0,
    isAnimating: false,
  },
  postProcessingEnabled: true,
  cloudsVisible: true,
  atmosphereVisible: true,
  starsVisible: true,

  selectedCountry: null,
  hoveredCountry: null,
  selectedCoordinate: null,
  zoomLevel: 1,
  sunPositionOverride: null,

  // Actions
  setQuality: (quality) => set({ quality }),
  setAutoRotate: (enabled) => set({ autoRotate: enabled }),
  setIsDragging: (dragging) => set({ isDragging: dragging }),
  focusCity: (cityId) => set({ focusedCity: cityId }),
  setCameraDistance: (distance) =>
    set((state) => ({
      camera: { ...state.camera, distance },
    })),
  setCameraAlpha: (alpha) =>
    set((state) => ({
      camera: { ...state.camera, alpha },
    })),
  setCameraBeta: (beta) =>
    set((state) => ({
      camera: { ...state.camera, beta },
    })),
  setCameraAnimating: (animating) =>
    set((state) => ({
      camera: { ...state.camera, isAnimating: animating },
    })),
  resetCamera: () =>
    set({
      camera: {
        distance: 200,
        alpha: 20,
        beta: 0,
        isAnimating: true,
      },
      focusedCity: null,
    }),
  togglePostProcessing: () =>
    set((state) => ({ postProcessingEnabled: !state.postProcessingEnabled })),
  toggleClouds: () =>
    set((state) => ({ cloudsVisible: !state.cloudsVisible })),
  toggleAtmosphere: () =>
    set((state) => ({ atmosphereVisible: !state.atmosphereVisible })),
  toggleStars: () =>
    set((state) => ({ starsVisible: !state.starsVisible })),

  setSelectedCountry: (country) => set({ selectedCountry: country }),
  setHoveredCountry: (country) => set({ hoveredCountry: country }),
  setSelectedCoordinate: (coord) => set({ selectedCoordinate: coord }),
  setZoomLevel: (level) => set({ zoomLevel: level }),
}));

// Bind the RenderingEngine API triggers to the Zustand store
renderingEngine.registerFocusCallback((cityId) => {
  useEarthStore.getState().focusCity(cityId);
});

renderingEngine.registerQualityCallback((quality) => {
  useEarthStore.getState().setQuality(quality as EarthQuality);
});

renderingEngine.registerBloomCallback((enabled) => {
  const isPostProcessing = useEarthStore.getState().postProcessingEnabled;
  if (isPostProcessing !== enabled) {
    useEarthStore.getState().togglePostProcessing();
  }
});

renderingEngine.registerCameraCallback(() => {
  // Map Three.js world positions to ECharts globe alpha/beta/distance
  // Simplified: keep existing behavior but convert to ECharts-compatible
  useEarthStore.getState().setCameraAnimating(true);
});

// Bind new GlobeRenderer endpoints
renderingEngine.registerRotateToCallback((lat, lon) => {
  // ECharts globe uses alpha (latitude angle) and beta (longitude angle)
  useEarthStore.getState().setCameraAlpha(lat);
  useEarthStore.getState().setCameraBeta(lon);
  useEarthStore.getState().setCameraAnimating(true);
});

renderingEngine.registerZoomCallback((level) => {
  useEarthStore.getState().setZoomLevel(level);

  // Map zoom level (1-6) to ECharts globe distance (40-200)
  const DISTANCES = [200, 160, 120, 80, 55, 40];
  const targetDist = DISTANCES[Math.max(0, Math.min(5, level - 1))];

  useEarthStore.getState().setCameraDistance(targetDist);
  useEarthStore.getState().setCameraAnimating(true);
});

renderingEngine.registerHighlightCountryCallback((countryId) => {
  if (!countryId) {
    useEarthStore.getState().setSelectedCountry(null);
    return;
  }
  // Search dataset for country and select
  fetch('/data/countries.json')
    .then((res) => res.json())
    .then((data) => {
      if (data && data.features) {
        const feature = data.features.find((f: Record<string, unknown>) => f.id === countryId || (f.properties as Record<string, unknown>)?.['name'] === countryId);
        if (feature) {
          useEarthStore.getState().setSelectedCountry(feature);
        }
      }
    })
    .catch((err) => console.error('Failed to resolve dynamic highlightCountry:', err));
});

renderingEngine.registerHighlightMarketCallback((id) => {
  useMarketsStore.getState().selectMarket(id);
});

renderingEngine.registerSunPositionCallback((position) => {
  useEarthStore.setState({ sunPositionOverride: [position[0], position[1], position[2]] });
});

renderingEngine.registerTimeCallback((date) => {
  const ms = date.getTime();
  useUTCStore.setState({
    utcMs: ms,
    formats: timeEngine.computeTimeFormats(ms),
  });
});
