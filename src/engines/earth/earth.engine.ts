import { astronomicalEngine } from '../astronomical/astronomical.engine';
import { IEarthEngine } from './earth.interface';

export class EarthEngine implements IEarthEngine {
  geoToCartesian(lat: number, lng: number, radius: number = 1.0): [number, number, number] {
    const latRad = (lat * Math.PI) / 180;
    const lngRad = (lng * Math.PI) / 180;

    const x = radius * Math.cos(latRad) * Math.sin(lngRad);
    const y = radius * Math.sin(latRad);
    const z = radius * Math.cos(latRad) * Math.cos(lngRad);

    return [x, y, z];
  }

  cartesianToGeo(x: number, y: number, z: number): [number, number] {
    const radius = Math.sqrt(x * x + y * y + z * z);
    const lat = Math.asin(y / radius) * (180 / Math.PI);
    const lng = Math.atan2(x, z) * (180 / Math.PI);
    return [lat, lng];
  }

  getRotationAngleY(utcMs: number): number {
    return -astronomicalEngine.getGreenwichMeanSiderealTime(utcMs);
  }
}

export const earthEngine = new EarthEngine();
