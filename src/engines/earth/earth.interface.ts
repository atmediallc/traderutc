export interface IEarthEngine {
  geoToCartesian(lat: number, lng: number, radius: number): [number, number, number];
  cartesianToGeo(x: number, y: number, z: number): [number, number];
  getRotationAngleY(utcMs: number): number;
}
