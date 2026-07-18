import { DateTime } from 'luxon';
import { TimeFormats } from '../shared/engine.types';
import { ITimeEngine } from './time.interface';

const UNIX_EPOCH_JD = 2440587.5;
const MS_PER_DAY = 86400000;
const GPS_UTC_OFFSET_SECONDS = 18;

export class TimeEngine implements ITimeEngine {
  computeTimeFormats(utcMs: number): TimeFormats {
    const dt = DateTime.fromMillis(utcMs, { zone: 'utc' });

    const utc = dt.toFormat('HH:mm:ss');
    const gmt = utc;
    const iso8601 = dt.toISO() ?? '';
    const unixTimestamp = Math.floor(utcMs / 1000);
    const jd = UNIX_EPOCH_JD + utcMs / MS_PER_DAY;
    const julianDate = jd.toFixed(5);

    const gpsMs = utcMs + GPS_UTC_OFFSET_SECONDS * 1000;
    const gpsDt = DateTime.fromMillis(gpsMs, { zone: 'utc' });
    const gpsTime = gpsDt.toFormat('HH:mm:ss');

    const weekNumber = dt.weekNumber;
    const dayOfYear = dt.ordinal;
    const isLeapYear = dt.isInLeapYear;
    const currentDate = dt.toFormat('yyyy-MM-dd');
    const dayName = dt.toFormat('cccc');

    return {
      utc,
      gmt,
      iso8601,
      unixTimestamp,
      julianDate,
      gpsTime,
      weekNumber,
      dayOfYear,
      isLeapYear,
      currentDate,
      dayName,
    };
  }

  getUTC(utcMs: number): string {
    return DateTime.fromMillis(utcMs, { zone: 'utc' }).toFormat('HH:mm:ss');
  }

  getLocalTime(utcMs: number, timezone: string): string {
    return DateTime.fromMillis(utcMs, { zone: timezone }).toFormat('HH:mm:ss');
  }

  convertTimezone(utcMs: number, fromZone: string, toZone: string): string {
    const fromDt = DateTime.fromMillis(utcMs, { zone: fromZone });
    return fromDt.setZone(toZone).toFormat('HH:mm:ss');
  }

  getCountdown(targetMs: number, currentMs: number): string {
    const diffMs = targetMs - currentMs;
    if (diffMs <= 0) return '00:00:00';

    const duration = DateTime.fromMillis(diffMs, { zone: 'utc' });
    const hours = Math.floor(diffMs / 3600000);
    const minutes = Math.floor((diffMs % 3600000) / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);

    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
  }

  getCurrentOffset(utcMs: number, timezone: string): number {
    return DateTime.fromMillis(utcMs, { zone: timezone }).offset / 60;
  }

  getWeekNumber(utcMs: number): number {
    return DateTime.fromMillis(utcMs, { zone: 'utc' }).weekNumber;
  }
}

export const timeEngine = new TimeEngine();
