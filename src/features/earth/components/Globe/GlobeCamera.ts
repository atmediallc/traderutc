/**
 * GlobeCamera
 *
 * Manages camera state for the ECharts globe view control.
 * Handles rotation, zoom, pan, inertia, and smooth transitions.
 * Configured for a cinematic, fluid experience.
 */

import {
  DEFAULT_CAMERA_DISTANCE,
  MIN_CAMERA_DISTANCE,
  MAX_CAMERA_DISTANCE,
  type GlobeTheme,
} from './globe.types';

export interface CameraViewConfig {
  projection: 'perspective';
  autoRotate: boolean;
  autoRotateDirection: 'cw' | 'ccw';
  autoRotateSpeed: number;
  autoRotateAfterStill: number;
  damping: number;
  rotateSensitivity: number;
  zoomSensitivity: number;
  panSensitivity: number;
  panMouseButton: 'left' | 'middle' | 'right';
  rotateMouseButton: 'left' | 'middle' | 'right';
  distance: number;
  minDistance: number;
  maxDistance: number;
  center: [number, number, number];
  alpha: number;
  beta: number;
  minAlpha: number;
  maxAlpha: number;
  animationDurationUpdate: number;
  animationEasingUpdate: string;
  targetCoord: [number, number] | null;
}

/**
 * Creates the default camera / view control configuration
 * for the ECharts globe.
 *
 * Tuned for a cinematic feel with smooth damping, comfortable
 * zoom range, and a tilted initial view showing both hemispheres.
 */
export function createCameraOptions(
  autoRotate: boolean = false,
  _theme?: GlobeTheme
): CameraViewConfig {
  void _theme;
  return {
    projection: 'perspective',
    autoRotate,
    autoRotateDirection: 'cw',
    autoRotateSpeed: 3,
    autoRotateAfterStill: 5,
    damping: 0.92,
    rotateSensitivity: 1.2,
    zoomSensitivity: 0.8,
    panSensitivity: 0,
    panMouseButton: 'middle',
    rotateMouseButton: 'left',
    distance: DEFAULT_CAMERA_DISTANCE,
    minDistance: MIN_CAMERA_DISTANCE,
    maxDistance: MAX_CAMERA_DISTANCE,
    center: [0, 0, 0],
    alpha: 25,
    beta: 40,
    minAlpha: -90,
    maxAlpha: 90,
    animationDurationUpdate: 1200,
    animationEasingUpdate: 'cubicInOut',
    targetCoord: null,
  };
}
