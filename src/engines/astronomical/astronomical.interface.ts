import { SunPosition, MoonPosition } from '../shared/engine.types';

export interface IAstronomicalEngine {
  getJulianDate(utcMs: number): number;
  getModifiedJulianDate(utcMs: number): number;
  getEarthRotationAngle(utcMs: number): number;
  getGreenwichMeanSiderealTime(utcMs: number): number;
  getGreenwichApparentSiderealTime(utcMs: number): number;
  getSolarPosition(utcMs: number): SunPosition;
  getSunAltitude(utcMs: number, lat: number, lng: number): number;
  getMoonPosition(utcMs: number): MoonPosition;
}
