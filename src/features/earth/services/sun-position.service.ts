/**
 * Sun Position Service
 *
 * Calculates the Sun's position relative to Earth for accurate lighting,
 * day/night terminator rendering, and golden hour/twilight effects.
 *
 * Uses simplified astronomical algorithms sufficient for visual accuracy
 * (< 1° error, which is imperceptible on a 3D globe).
 *
 * Reference: Meeus, J. "Astronomical Algorithms", 2nd Edition
 */

/** Earth's axial tilt in degrees (obliquity of the ecliptic, J2000.0) */
const AXIAL_TILT_DEG = 23.4393;

/** Axial tilt in radians */
const AXIAL_TILT_RAD = (AXIAL_TILT_DEG * Math.PI) / 180;

/** Milliseconds per day */
const MS_PER_DAY = 86400000;

/** Days per Julian year */
const DAYS_PER_YEAR = 365.25;

/** J2000.0 epoch (2000-01-12T12:00:00 TT) as Unix milliseconds */
const J2000_UNIX_MS = 946728000000;

/** Two PI constant */
const TWO_PI = 2 * Math.PI;

/**
 * Represents the Sun's position in both angular and Cartesian coordinates.
 */
export interface SunPosition {
  /** Solar declination in radians (latitude of sub-solar point) */
  declination: number;
  /** Solar right ascension in radians */
  rightAscension: number;
  /** Greenwich Hour Angle in radians */
  greenwichHourAngle: number;
  /** Sub-solar point latitude in degrees */
  subSolarLatitude: number;
  /** Sub-solar point longitude in degrees */
  subSolarLongitude: number;
  /** 3D direction vector [x, y, z] (normalized, in Earth-fixed frame) */
  direction: [number, number, number];
}

/**
 * Calculates the number of Julian centuries since J2000.0.
 */
function julianCenturies(utcMs: number): number {
  const daysSinceJ2000 = (utcMs - J2000_UNIX_MS) / MS_PER_DAY;
  return daysSinceJ2000 / 36525.0;
}

/**
 * Calculates the mean longitude of the Sun (L₀) in radians.
 * Geometric mean longitude, corrected for aberration.
 */
function meanSolarLongitude(t: number): number {
  const l0Deg = 280.46646 + 36000.76983 * t + 0.0003032 * t * t;
  return ((l0Deg % 360) * Math.PI) / 180;
}

/**
 * Calculates the mean anomaly of the Sun (M) in radians.
 */
function meanAnomaly(t: number): number {
  const mDeg = 357.52911 + 35999.05029 * t - 0.0001537 * t * t;
  return ((mDeg % 360) * Math.PI) / 180;
}

/**
 * Equation of Center — the angular difference between the Sun's true
 * position and its mean position, due to orbital eccentricity.
 */
function equationOfCenter(m: number, t: number): number {
  const c =
    (1.9146 - 0.004817 * t - 0.000014 * t * t) * Math.sin(m) +
    (0.019993 - 0.000101 * t) * Math.sin(2 * m) +
    0.00029 * Math.sin(3 * m);
  return (c * Math.PI) / 180;
}

/**
 * Calculates the Sun's ecliptic longitude (true longitude).
 */
function sunTrueLongitude(t: number): number {
  const l0 = meanSolarLongitude(t);
  const m = meanAnomaly(t);
  const c = equationOfCenter(m, t);
  return l0 + c;
}

/**
 * Calculates the obliquity of the ecliptic (axial tilt),
 * corrected for nutation.
 */
function obliquityOfEcliptic(t: number): number {
  const eps0 = 23.0 + (26.0 + (21.448 - t * (46.815 + t * (0.00059 - t * 0.001813))) / 60.0) / 60.0;
  return (eps0 * Math.PI) / 180;
}

/**
 * Calculates the Sun's declination angle in radians.
 * This is the latitude of the sub-solar point.
 */
function solarDeclination(t: number): number {
  const lambda = sunTrueLongitude(t);
  const epsilon = obliquityOfEcliptic(t);
  return Math.asin(Math.sin(epsilon) * Math.sin(lambda));
}

/**
 * Calculates the Sun's right ascension in radians.
 */
function solarRightAscension(t: number): number {
  const lambda = sunTrueLongitude(t);
  const epsilon = obliquityOfEcliptic(t);
  const ra = Math.atan2(Math.cos(epsilon) * Math.sin(lambda), Math.cos(lambda));
  return ra < 0 ? ra + TWO_PI : ra;
}

/**
 * Calculates the Equation of Time in radians.
 * This is the discrepancy between solar time and mean time,
 * used to determine the longitude where the Sun is directly overhead.
 */
function equationOfTime(t: number): number {
  const l0 = meanSolarLongitude(t);
  const m = meanAnomaly(t);
  const epsilon = obliquityOfEcliptic(t);
  const e = 0.016708634 - 0.000042037 * t - 0.0000001267 * t * t;

  const y = Math.tan(epsilon / 2) * Math.tan(epsilon / 2);

  const eot =
    y * Math.sin(2 * l0) -
    2 * e * Math.sin(m) +
    4 * e * y * Math.sin(m) * Math.cos(2 * l0) -
    0.5 * y * y * Math.sin(4 * l0) -
    1.25 * e * e * Math.sin(2 * m);

  return eot;
}

/**
 * Calculates the complete Sun position from a UTC timestamp.
 *
 * Returns declination, right ascension, hour angle, sub-solar coordinates,
 * and a 3D direction vector suitable for use as a directional light.
 *
 * @param utcMs - UTC timestamp in milliseconds since Unix epoch
 * @returns Complete Sun position data
 */
export function calculateSunPosition(utcMs: number): SunPosition {
  const t = julianCenturies(utcMs);

  // Solar coordinates
  const dec = solarDeclination(t);
  const ra = solarRightAscension(t);

  // Greenwich Mean Sidereal Time
  const daysSinceJ2000 = (utcMs - J2000_UNIX_MS) / MS_PER_DAY;
  const gmstHours =
    18.697374558 + 24.06570982441908 * daysSinceJ2000;
  const gmstRad = ((gmstHours % 24) / 24) * TWO_PI;

  // Greenwich Hour Angle = GMST - Right Ascension
  let gha = gmstRad - ra;
  if (gha < 0) gha += TWO_PI;
  if (gha > TWO_PI) gha -= TWO_PI;

  // Sub-solar point
  const subSolarLatitude = (dec * 180) / Math.PI;
  let subSolarLongitude = -(gha * 180) / Math.PI;
  if (subSolarLongitude < -180) subSolarLongitude += 360;
  if (subSolarLongitude > 180) subSolarLongitude -= 360;

  // 3D direction vector (in Earth-fixed frame)
  // The Sun direction in the scene is computed from the sub-solar lat/lng
  const latRad = (subSolarLatitude * Math.PI) / 180;
  const lngRad = (subSolarLongitude * Math.PI) / 180;

  const direction: [number, number, number] = [
    Math.cos(latRad) * Math.sin(lngRad),
    Math.sin(latRad),
    Math.cos(latRad) * Math.cos(lngRad),
  ];

  return {
    declination: dec,
    rightAscension: ra,
    greenwichHourAngle: gha,
    subSolarLatitude,
    subSolarLongitude,
    direction,
  };
}

/**
 * Gets the Sun's direction vector in world space for the Three.js scene.
 *
 * This vector represents the direction FROM Earth TO Sun (for directional light).
 * It accounts for the Earth's rotation, so the light moves correctly as time passes.
 *
 * The distance is normalized — we only care about direction for the directional light.
 *
 * @param utcMs - UTC timestamp in milliseconds since Unix epoch
 * @returns Normalized [x, y, z] direction vector
 */
export function getSunDirectionVector(utcMs: number): [number, number, number] {
  return calculateSunPosition(utcMs).direction;
}

/**
 * Determines the Sun's altitude angle at a given geographic location.
 * Used for golden hour / twilight calculations.
 *
 * @param utcMs - UTC timestamp
 * @param lat - Observer latitude in degrees
 * @param lng - Observer longitude in degrees
 * @returns Sun altitude angle in degrees (negative = below horizon)
 */
export function getSunAltitude(utcMs: number, lat: number, lng: number): number {
  const sun = calculateSunPosition(utcMs);

  const latRad = (lat * Math.PI) / 180;
  const lngRad = (lng * Math.PI) / 180;

  // Hour angle at observer's longitude
  const ha = sun.greenwichHourAngle + lngRad;

  // Altitude formula
  const sinAlt =
    Math.sin(latRad) * Math.sin(sun.declination) +
    Math.cos(latRad) * Math.cos(sun.declination) * Math.cos(ha);

  return (Math.asin(sinAlt) * 180) / Math.PI;
}

/**
 * Twilight thresholds for visual effects.
 */
export const TWILIGHT_THRESHOLDS = {
  /** Sun above horizon — full daylight */
  DAY: 0,
  /** Civil twilight — golden hour / blue hour */
  CIVIL: -6,
  /** Nautical twilight — deep blue sky */
  NAUTICAL: -12,
  /** Astronomical twilight — near-dark */
  ASTRONOMICAL: -18,
} as const;
