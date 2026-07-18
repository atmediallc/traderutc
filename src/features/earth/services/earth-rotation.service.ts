/**
 * Earth Rotation Service
 *
 * Calculates the Earth's precise rotational position from UTC using the
 * IAU (International Astronomical Union) Earth Rotation Angle formula.
 *
 * This ensures the 3D Earth's orientation always matches reality —
 * the terminator line, city positions, and sun direction are all correct.
 *
 * Reference: IERS Technical Note No. 36, Chapter 5
 * https://www.iers.org/IERS/EN/Publications/TechnicalNotes/tn36.html
 */

/** J2000.0 epoch as Julian Date (2000-01-01T12:00:00 TT) */
const J2000_EPOCH_JD = 2451545.0;

/** Unix epoch (1970-01-01T00:00:00 UTC) as Julian Date */
const UNIX_EPOCH_JD = 2440587.5;

/** Milliseconds in one day */
const MS_PER_DAY = 86400000;

/** ERA rotation rate: sidereal days per UT1 day */
const ERA_ROTATION_RATE = 1.00273781191135448;

/** ERA epoch offset at J2000.0 (fraction of a full rotation) */
const ERA_EPOCH_OFFSET = 0.7790572732640;

/** Full rotation in radians */
const TWO_PI = 2 * Math.PI;

/**
 * Converts a UTC timestamp (milliseconds since Unix epoch) to Julian Date.
 *
 * Note: We approximate UT1 ≈ UTC (|ΔUT1| < 0.9s), which is more than
 * sufficient for visual Earth rotation accuracy.
 */
export function utcToJulianDate(utcMs: number): number {
  return UNIX_EPOCH_JD + utcMs / MS_PER_DAY;
}

/**
 * Calculates the Earth Rotation Angle (ERA) in radians from a UTC timestamp.
 *
 * The ERA is the angle between the Celestial Intermediate Origin (CIO) and
 * the Terrestrial Intermediate Origin (TIO), measured positively in the
 * retrograde direction (east-to-west as seen from the celestial pole).
 *
 * Formula (IAU 2000):
 *   θ(UT1) = 2π × (0.7790572732640 + 1.00273781191135448 × Tu)
 *   where Tu = JD(UT1) − 2451545.0
 *
 * @param utcMs - UTC timestamp in milliseconds since Unix epoch
 * @returns Earth Rotation Angle in radians [0, 2π)
 */
export function calculateERA(utcMs: number): number {
  const jd = utcToJulianDate(utcMs);
  const tu = jd - J2000_EPOCH_JD;

  // Calculate fractional rotations
  const fractionalRotations = ERA_EPOCH_OFFSET + ERA_ROTATION_RATE * tu;

  // Convert to radians, keeping only the fractional part
  const era = TWO_PI * (fractionalRotations % 1);

  // Normalize to [0, 2π)
  return era < 0 ? era + TWO_PI : era;
}

/**
 * Calculates Greenwich Mean Sidereal Time (GMST) in radians.
 *
 * GMST = ERA + accumulated precession of the equinoxes.
 * This is used for precise Sun positioning relative to the Earth's surface.
 *
 * Polynomial from IERS Conventions (2010), IERS Technical Note No. 36, eq. 5.32
 *
 * @param utcMs - UTC timestamp in milliseconds since Unix epoch
 * @returns GMST in radians [0, 2π)
 */
export function calculateGMST(utcMs: number): number {
  const jd = utcToJulianDate(utcMs);
  const tu = jd - J2000_EPOCH_JD;

  // Centuries since J2000.0 for precession polynomial (use TT ≈ UTC + 69.184s)
  const t = (tu + 69.184 / 86400) / 36525.0;

  // ERA component
  const era = calculateERA(utcMs);

  // Accumulated precession in arcseconds (IERS 2010 eq. 5.32)
  const precessionArcsec =
    0.014506 +
    4612.15739966 * t +
    1.39667721 * t * t -
    0.00009344 * t * t * t +
    0.00001882 * t * t * t * t;

  // Convert arcseconds to radians: 1 arcsec = π / (180 * 3600)
  const precessionRad = (precessionArcsec * Math.PI) / (180 * 3600);

  const gmst = era + precessionRad;

  // Normalize to [0, 2π)
  const normalized = gmst % TWO_PI;
  return normalized < 0 ? normalized + TWO_PI : normalized;
}

/**
 * Gets the Y-axis rotation angle for the 3D Earth model.
 *
 * In Three.js, the Earth sphere has its texture mapped with longitude 0°
 * (Prime Meridian) at the front (+Z axis). The GMST tells us the sidereal
 * angle of Greenwich relative to the vernal equinox.
 *
 * We negate the GMST because the Earth rotates west-to-east (counterclockwise
 * when viewed from above the North Pole), but Three.js Y-axis rotation is
 * clockwise when positive.
 *
 * @param utcMs - UTC timestamp in milliseconds since Unix epoch
 * @returns Y-axis rotation in radians for the Earth mesh
 */
export function getEarthRotationY(utcMs: number): number {
  return -calculateGMST(utcMs);
}

/**
 * Converts geographic coordinates (latitude, longitude) to a 3D position
 * on a sphere of the given radius.
 *
 * Uses the standard geographic → Cartesian conversion:
 *   x = R × cos(lat) × sin(lng)
 *   y = R × sin(lat)
 *   z = R × cos(lat) × cos(lng)
 *
 * Note: latitude and longitude are in DEGREES.
 *
 * @param lat - Latitude in degrees (-90 to 90)
 * @param lng - Longitude in degrees (-180 to 180)
 * @param radius - Sphere radius (default 1.0)
 * @returns [x, y, z] position tuple
 */
export function geoToCartesian(
  lat: number,
  lng: number,
  radius: number = 1.0
): [number, number, number] {
  const latRad = (lat * Math.PI) / 180;
  const lngRad = (lng * Math.PI) / 180;

  const x = radius * Math.cos(latRad) * Math.sin(lngRad);
  const y = radius * Math.sin(latRad);
  const z = radius * Math.cos(latRad) * Math.cos(lngRad);

  return [x, y, z];
}
