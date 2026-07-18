import { SunPosition, MoonPosition } from '../shared/engine.types';
import { IAstronomicalEngine } from './astronomical.interface';

const J2000_EPOCH_JD = 2451545.0;
const UNIX_EPOCH_JD = 2440587.5;
const MS_PER_DAY = 86400000;
const ERA_ROTATION_RATE = 1.00273781191135448;
const ERA_EPOCH_OFFSET = 0.7790572732640;
const TWO_PI = 2 * Math.PI;

const AXIAL_TILT_DEG = 23.4393;
const AXIAL_TILT_RAD = (AXIAL_TILT_DEG * Math.PI) / 180;
const J2000_UNIX_MS = 946728000000;

export class AstronomicalEngine implements IAstronomicalEngine {
  getJulianDate(utcMs: number): number {
    return UNIX_EPOCH_JD + utcMs / MS_PER_DAY;
  }

  getModifiedJulianDate(utcMs: number): number {
    return this.getJulianDate(utcMs) - 2400000.5;
  }

  getEarthRotationAngle(utcMs: number): number {
    const jd = this.getJulianDate(utcMs);
    const tu = jd - J2000_EPOCH_JD;
    const fractionalRotations = ERA_EPOCH_OFFSET + ERA_ROTATION_RATE * tu;
    const era = TWO_PI * (fractionalRotations % 1);
    return era < 0 ? era + TWO_PI : era;
  }

  getGreenwichMeanSiderealTime(utcMs: number): number {
    const jd = this.getJulianDate(utcMs);
    const tu = jd - J2000_EPOCH_JD;
    const t = (tu + 69.184 / 86400) / 36525.0;
    const era = this.getEarthRotationAngle(utcMs);

    const precessionArcsec =
      0.014506 +
      4612.15739966 * t +
      1.39667721 * t * t -
      0.00009344 * t * t * t +
      0.00001882 * t * t * t * t;

    const precessionRad = (precessionArcsec * Math.PI) / (180 * 3600);
    const gmst = era + precessionRad;
    const normalized = gmst % TWO_PI;
    return normalized < 0 ? normalized + TWO_PI : normalized;
  }

  getGreenwichApparentSiderealTime(utcMs: number): number {
    // GMST + Equation of Equinoxes (approximate)
    const gmst = this.getGreenwichMeanSiderealTime(utcMs);
    // Simplification: Equation of equinoxes is tiny (< 1.2s), so GMST ≈ GAST for visual representation
    return gmst;
  }

  getSolarPosition(utcMs: number): SunPosition {
    const daysSinceJ2000 = (utcMs - J2000_UNIX_MS) / MS_PER_DAY;
    const t = daysSinceJ2000 / 36525.0;

    const l0Deg = 280.46646 + 36000.76983 * t + 0.0003032 * t * t;
    const l0 = ((l0Deg % 360) * Math.PI) / 180;

    const mDeg = 357.52911 + 35999.05029 * t - 0.0001537 * t * t;
    const m = ((mDeg % 360) * Math.PI) / 180;

    const c =
      (1.9146 - 0.004817 * t - 0.000014 * t * t) * Math.sin(m) +
      (0.019993 - 0.000101 * t) * Math.sin(2 * m) +
      0.00029 * Math.sin(3 * m);
    const cRad = (c * Math.PI) / 180;

    const lambda = l0 + cRad;

    const eps0 = 23.0 + (26.0 + (21.448 - t * (46.815 + t * (0.00059 - t * 0.001813))) / 60.0) / 60.0;
    const epsilon = (eps0 * Math.PI) / 180;

    const dec = Math.asin(Math.sin(epsilon) * Math.sin(lambda));

    const ra = Math.atan2(Math.cos(epsilon) * Math.sin(lambda), Math.cos(lambda));
    const normalizedRa = ra < 0 ? ra + TWO_PI : ra;

    const gmstHours = 18.697374558 + 24.06570982441908 * daysSinceJ2000;
    const gmstRad = ((gmstHours % 24) / 24) * TWO_PI;

    let gha = gmstRad - normalizedRa;
    if (gha < 0) gha += TWO_PI;
    if (gha > TWO_PI) gha -= TWO_PI;

    const subSolarLatitude = (dec * 180) / Math.PI;
    let subSolarLongitude = -(gha * 180) / Math.PI;
    if (subSolarLongitude < -180) subSolarLongitude += 360;
    if (subSolarLongitude > 180) subSolarLongitude -= 360;

    const latRad = (subSolarLatitude * Math.PI) / 180;
    const lngRad = (subSolarLongitude * Math.PI) / 180;

    const direction: [number, number, number] = [
      Math.cos(latRad) * Math.sin(lngRad),
      Math.sin(latRad),
      Math.cos(latRad) * Math.cos(lngRad),
    ];

    return {
      declination: dec,
      rightAscension: normalizedRa,
      greenwichHourAngle: gha,
      subSolarLatitude,
      subSolarLongitude,
      direction,
    };
  }

  getSunAltitude(utcMs: number, lat: number, lng: number): number {
    const sun = this.getSolarPosition(utcMs);
    const latRad = (lat * Math.PI) / 180;
    const lngRad = (lng * Math.PI) / 180;

    const ha = sun.greenwichHourAngle + lngRad;
    const sinAlt =
      Math.sin(latRad) * Math.sin(sun.declination) +
      Math.cos(latRad) * Math.cos(sun.declination) * Math.cos(ha);

    return (Math.asin(sinAlt) * 180) / Math.PI;
  }

  getMoonPosition(utcMs: number): MoonPosition {
    // Known new moon: 1970-01-07 20:35 UTC (JD = 2440594.3576)
    const knownNewMoonJD = 2440594.3576;
    const currentJD = this.getJulianDate(utcMs);
    const daysSinceNewMoon = currentJD - knownNewMoonJD;
    
    // Synodic period: 29.53059 days
    const synodicPeriod = 29.53059;
    const phaseProgress = (daysSinceNewMoon % synodicPeriod) / synodicPeriod;
    const phase = phaseProgress < 0 ? phaseProgress + 1 : phaseProgress;

    // Fractional illumination (0 = new moon, 0.5 = quarter, 1 = full moon)
    const illumination = 0.5 * (1 - Math.cos(phase * TWO_PI));

    // Sidereal orbit period: 27.32166 days
    const siderealPeriod = 27.32166;
    const orbitAngle = (daysSinceNewMoon / siderealPeriod) * TWO_PI;

    // Approximate Moon RA & Dec based on its orbital path
    const obliquity = AXIAL_TILT_RAD;
    const orbitalInclination = (5.14 * Math.PI) / 180; // 5.14 degrees incline relative to ecliptic

    const lambda = orbitAngle; // Mean longitude
    const beta = orbitalInclination * Math.sin(orbitAngle); // Latitude relative to ecliptic

    const dec = Math.asin(
      Math.sin(beta) * Math.cos(obliquity) + 
      Math.cos(beta) * Math.sin(obliquity) * Math.sin(lambda)
    );
    const ra = Math.atan2(
      Math.cos(beta) * Math.cos(obliquity) * Math.sin(lambda) - Math.sin(beta) * Math.sin(obliquity),
      Math.cos(beta) * Math.cos(lambda)
    );
    const normalizedRa = ra < 0 ? ra + TWO_PI : ra;

    // Average distance: 60.27 Earth radii
    const distance = 60.27 + 5.5 * Math.sin(orbitAngle);

    return {
      rightAscension: normalizedRa,
      declination: dec,
      distance,
      phase,
      illumination,
    };
  }
}

export const astronomicalEngine = new AstronomicalEngine();
