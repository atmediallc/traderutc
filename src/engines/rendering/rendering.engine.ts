import { IRenderingEngine, type Position3 } from './rendering.interface';

export class RenderingEngine implements IRenderingEngine {
  private focusCallback: ((target: string | null) => void) | null = null;
  private cameraCallback: ((position: [number, number, number], target: [number, number, number]) => void) | null = null;
  private bloomCallback: ((enabled: boolean) => void) | null = null;
  private qualityCallback: ((quality: 'low' | 'medium' | 'high') => void) | null = null;

  // GlobeRenderer dynamic callbacks
  private rotateToCallback: ((lat: number, lon: number) => void) | null = null;
  private zoomCallback: ((level: number) => void) | null = null;
  private highlightCountryCallback: ((countryId: string | null) => void) | null = null;
  private highlightMarketCallback: ((id: string | null) => void) | null = null;
  private sunPositionCallback: ((position: Position3) => void) | null = null;
  private timeCallback: ((date: Date) => void) | null = null;

  registerFocusCallback(cb: (target: string | null) => void) {
    this.focusCallback = cb;
  }

  registerCameraCallback(cb: (position: [number, number, number], target: [number, number, number]) => void) {
    this.cameraCallback = cb;
  }

  registerBloomCallback(cb: (enabled: boolean) => void) {
    this.bloomCallback = cb;
  }

  registerQualityCallback(cb: (quality: 'low' | 'medium' | 'high') => void) {
    this.qualityCallback = cb;
  }

  registerRotateToCallback(cb: (lat: number, lon: number) => void) {
    this.rotateToCallback = cb;
  }

  registerZoomCallback(cb: (level: number) => void) {
    this.zoomCallback = cb;
  }

  registerHighlightCountryCallback(cb: (countryId: string | null) => void) {
    this.highlightCountryCallback = cb;
  }

  registerHighlightMarketCallback(cb: (id: string | null) => void) {
    this.highlightMarketCallback = cb;
  }

  registerSunPositionCallback(cb: (position: Position3) => void) {
    this.sunPositionCallback = cb;
  }

  registerTimeCallback(cb: (date: Date) => void) {
    this.timeCallback = cb;
  }

  // GlobeRenderer Interface
  async initialize(): Promise<void> {
    // Initializer logic
  }

  dispose(): void {
    this.focusCallback = null;
    this.cameraCallback = null;
    this.bloomCallback = null;
    this.qualityCallback = null;
    this.rotateToCallback = null;
    this.zoomCallback = null;
    this.highlightCountryCallback = null;
    this.highlightMarketCallback = null;
    this.sunPositionCallback = null;
    this.timeCallback = null;
  }

  render(): void {
    // Custom frame rendering logic loop hook (handled by @react-three/fiber frame ticker)
  }

  rotateTo(lat: number, lon: number): void {
    if (this.rotateToCallback) this.rotateToCallback(lat, lon);
  }

  zoom(level: number): void {
    if (this.zoomCallback) this.zoomCallback(level);
  }

  highlightCountry(countryId: string | null): void {
    if (this.highlightCountryCallback) this.highlightCountryCallback(countryId);
  }

  highlightMarket(id: string | null): void {
    if (this.highlightMarketCallback) this.highlightMarketCallback(id);
  }

  setSunPosition(position: Position3): void {
    if (this.sunPositionCallback) this.sunPositionCallback(position);
  }

  setTime(date: Date): void {
    if (this.timeCallback) this.timeCallback(date);
  }

  // IRenderingEngine legacy handlers
  focusObject(target: string | null): void {
    if (this.focusCallback) this.focusCallback(target);
  }

  highlightObject(_target: string | null): void {
    void _target;
    // Highlight implementation
  }

  animateCamera(position: [number, number, number], target: [number, number, number]): void {
    if (this.cameraCallback) this.cameraCallback(position, target);
  }

  enableBloom(enabled: boolean): void {
    if (this.bloomCallback) this.bloomCallback(enabled);
  }

  toggleEffects(): void {
    // Toggle logic placeholder
  }

  setQuality(quality: 'low' | 'medium' | 'high'): void {
    if (this.qualityCallback) this.qualityCallback(quality);
  }

  captureScreenshot(): string {
    return 'data:image/png;base64,';
  }
}

export const renderingEngine = new RenderingEngine();
