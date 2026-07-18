/**
 * Earth Store
 *
 * Zustand store managing all Earth rendering state:
 * - Quality settings
 * - Camera state
 * - Interaction flags
 * - Performance monitoring
 */
import { create } from 'zustand';
import type { EarthQuality, CameraState } from '../types/earth.types';
import {
  DEFAULT_QUALITY,
  CAMERA_CONFIG,
} from '../constants/earth.constants';

interface EarthState {
  /** Current rendering quality level */
  quality: EarthQuality;
  /** Whether auto-rotation is enabled */
  autoRotate: boolean;
  /** Whether the Earth is currently being dragged */
  isDragging: boolean;
  /** Currently focused market city (for camera animation) */
  focusedCity: string | null;
  /** Camera state */
  camera: CameraState;
  /** Whether post-processing effects are enabled */
  postProcessingEnabled: boolean;
  /** Whether cloud layer is visible */
  cloudsVisible: boolean;
  /** Whether atmosphere is visible */
  atmosphereVisible: boolean;
  /** Whether starfield is visible */
  starsVisible: boolean;
}

interface EarthActions {
  setQuality: (quality: EarthQuality) => void;
  setAutoRotate: (enabled: boolean) => void;
  setIsDragging: (dragging: boolean) => void;
  focusCity: (cityId: string | null) => void;
  setCameraPosition: (position: [number, number, number]) => void;
  setCameraTarget: (target: [number, number, number]) => void;
  setCameraAnimating: (animating: boolean) => void;
  resetCamera: () => void;
  togglePostProcessing: () => void;
  toggleClouds: () => void;
  toggleAtmosphere: () => void;
  toggleStars: () => void;
}

export const useEarthStore = create<EarthState & EarthActions>((set) => ({
  // State
  quality: DEFAULT_QUALITY,
  autoRotate: false,
  isDragging: false,
  focusedCity: null,
  camera: {
    position: [...CAMERA_CONFIG.defaultPosition],
    target: [...CAMERA_CONFIG.defaultTarget],
    fov: CAMERA_CONFIG.defaultFov,
    isAnimating: false,
  },
  postProcessingEnabled: true,
  cloudsVisible: true,
  atmosphereVisible: true,
  starsVisible: true,

  // Actions
  setQuality: (quality) => set({ quality }),
  setAutoRotate: (enabled) => set({ autoRotate: enabled }),
  setIsDragging: (dragging) => set({ isDragging: dragging }),
  focusCity: (cityId) => set({ focusedCity: cityId }),
  setCameraPosition: (position) =>
    set((state) => ({
      camera: { ...state.camera, position },
    })),
  setCameraTarget: (target) =>
    set((state) => ({
      camera: { ...state.camera, target },
    })),
  setCameraAnimating: (animating) =>
    set((state) => ({
      camera: { ...state.camera, isAnimating: animating },
    })),
  resetCamera: () =>
    set({
      camera: {
        position: [...CAMERA_CONFIG.defaultPosition],
        target: [...CAMERA_CONFIG.defaultTarget],
        fov: CAMERA_CONFIG.defaultFov,
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
}));
