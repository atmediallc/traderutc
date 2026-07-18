export interface IRenderingEngine {
  focusObject(target: any): void;
  highlightObject(target: any): void;
  animateCamera(position: [number, number, number], target: [number, number, number]): void;
  enableBloom(enabled: boolean): void;
  toggleEffects(): void;
  setQuality(quality: 'low' | 'medium' | 'high'): void;
  captureScreenshot(): string;
}
