/** Position type alias — replaces Three.js Vector3 dependency */
export type Position3 = [number, number, number];

export interface GlobeRenderer {
  initialize(): Promise<void>;
  dispose(): void;

  render(): void;

  rotateTo(lat: number, lon: number): void;

  zoom(level: number): void;

  highlightCountry(countryId: string | null): void;

  highlightMarket(id: string | null): void;

  setSunPosition(position: Position3): void;

  setTime(date: Date): void;
}

export interface IRenderingEngine extends GlobeRenderer {
  focusObject(target: string | null): void;
  highlightObject(target: string | null): void;
  animateCamera(position: [number, number, number], target: [number, number, number]): void;
  enableBloom(enabled: boolean): void;
  toggleEffects(): void;
  setQuality(quality: 'low' | 'medium' | 'high'): void;
  captureScreenshot(): string;

  // React registry hooks to link events to standard abstract endpoints
  registerFocusCallback(cb: (target: string | null) => void): void;
  registerCameraCallback(cb: (position: [number, number, number], target: [number, number, number]) => void): void;
  registerBloomCallback(cb: (enabled: boolean) => void): void;
  registerQualityCallback(cb: (quality: 'low' | 'medium' | 'high') => void): void;
  registerRotateToCallback(cb: (lat: number, lon: number) => void): void;
  registerZoomCallback(cb: (level: number) => void): void;
  registerHighlightCountryCallback(cb: (countryId: string | null) => void): void;
  registerHighlightMarketCallback(cb: (id: string | null) => void): void;
  registerSunPositionCallback(cb: (position: Position3) => void): void;
  registerTimeCallback(cb: (date: Date) => void): void;
}
