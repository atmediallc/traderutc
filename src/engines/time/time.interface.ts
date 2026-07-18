import { TimeFormats } from '../shared/engine.types';

export interface ITimeEngine {
  computeTimeFormats(utcMs: number): TimeFormats;
  getUTC(utcMs: number): string;
  getLocalTime(utcMs: number, timezone: string): string;
  convertTimezone(utcMs: number, fromZone: string, toZone: string): string;
  getCountdown(targetMs: number, currentMs: number): string;
  getCurrentOffset(utcMs: number, timezone: string): number;
  getWeekNumber(utcMs: number): number;
}
