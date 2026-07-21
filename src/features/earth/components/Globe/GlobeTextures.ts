/**
 * GlobeTextures
 *
 * Manages texture loading for the ECharts globe renderer.
 * Uses high-quality local textures from /public/textures/
 * and generates a procedural starfield for the environment.
 */

'use client';

export interface GlobeTextureSet {
  /** Base Earth color map (day side) */
  earth: string | HTMLCanvasElement;
  /** Bump / height map for terrain displacement */
  bump: string;
  /** Clouds overlay texture */
  clouds: string;
  /** Night lights texture */
  night: string;
  /** Specular map for ocean reflections */
  specular: string;
  /** Environment background (starfield) */
  environment: string | HTMLCanvasElement;
}

const LOCAL_TEXTURES = {
  earth: '/textures/earth-day-2k.jpg',
  bump: '/textures/earth-bump-2k.jpg',
  clouds: '/textures/earth-clouds-2k.jpg',
  night: '/textures/earth-night-2k.jpg',
  specular: '/textures/earth-specular-2k.jpg',
};

/**
 * Generates a procedural starfield on a canvas element.
 * This replaces the need for a static starfield image and
 * creates a high-quality deep-space background.
 */
function generateStarfieldCanvas(size: number = 2048): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Deep space gradient background
  const gradient = ctx.createRadialGradient(
    size / 2, size / 2, 0,
    size / 2, size / 2, size * 0.8
  );
  gradient.addColorStop(0, '#040712'); // Richer, slightly brighter center
  gradient.addColorStop(0.4, '#02040a');
  gradient.addColorStop(0.8, '#010105');
  gradient.addColorStop(1, '#000000'); // True black edges
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Milky way effect (clusters of tiny background stars)
  const milkyWayStars = 5000;
  for (let i = 0; i < milkyWayStars; i++) {
    // Concentrate stars along a diagonal band
    const bandX = Math.random() * size;
    const bandY = bandX + (Math.random() - 0.5) * (size * 0.4);

    // Wrap around coordinates if they go out of bounds
    const x = bandX % size;
    let y = bandY % size;
    if (y < 0) y += size;

    // Some scatter outside the band
    const isScattered = Math.random() > 0.6;
    const finalX = isScattered ? Math.random() * size : x;
    const finalY = isScattered ? Math.random() * size : y;

    ctx.beginPath();
    ctx.arc(finalX, finalY, Math.random() * 0.4 + 0.1, 0, Math.PI * 2);
    const opacity = 0.1 + Math.random() * 0.3;
    ctx.fillStyle = `rgba(200, 220, 255, ${opacity})`;
    ctx.fill();
  }

  // Draw main stars with varying sizes and brightness
  const starCount = 3000;

  for (let i = 0; i < starCount; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const radiusRoll = Math.random();

    // Improved distribution of star sizes, keeping them small and realistic
    let r: number;
    let isBrightStar = false;

    if (radiusRoll < 0.90) {
      r = 0.2 + Math.random() * 0.3; // Tiny stars (majority)
    } else if (radiusRoll < 0.98) {
      r = 0.5 + Math.random() * 0.4; // Small stars
    } else {
      r = 0.9 + Math.random() * 0.5; // "Large" stars (still small)
      isBrightStar = true;
    }

    // Star color variation (white, blue-white, warm, and rare red/orange)
    const colorRoll = Math.random();
    let rC, gC, bC;

    if (colorRoll < 0.6) {
      // White / slightly warm
      rC = 220 + Math.floor(Math.random() * 35);
      gC = 220 + Math.floor(Math.random() * 35);
      bC = 230 + Math.floor(Math.random() * 25);
    } else if (colorRoll < 0.85) {
      // Blue-white
      rC = 150 + Math.floor(Math.random() * 50);
      gC = 180 + Math.floor(Math.random() * 50);
      bC = 255;
    } else if (colorRoll < 0.97) {
      // Yellow / warm
      rC = 255;
      gC = 220 + Math.floor(Math.random() * 30);
      bC = 160 + Math.floor(Math.random() * 40);
    } else {
      // Rare reddish
      rC = 255;
      gC = 160 + Math.floor(Math.random() * 40);
      bC = 120 + Math.floor(Math.random() * 40);
    }

    const opacity = 0.5 + Math.random() * 0.5;
    const color = `rgba(${rC}, ${gC}, ${bC}, ${opacity})`;

    // Draw main star body
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    // Add soft glow to brighter stars only
    if (isBrightStar) {
      ctx.beginPath();
      ctx.arc(x, y, r * 2.5, 0, Math.PI * 2);
      const glowGrad = ctx.createRadialGradient(x, y, 0, x, y, r * 2.5);
      glowGrad.addColorStop(0, `rgba(${rC}, ${gC}, ${bC}, 0.3)`);
      glowGrad.addColorStop(1, `rgba(${rC}, ${gC}, ${bC}, 0)`);
      ctx.fillStyle = glowGrad;
      ctx.fill();
    }
  }

  // Enhanced subtle nebula clouds
  for (let i = 0; i < 8; i++) {
    const nx = Math.random() * size;
    const ny = Math.random() * size;
    // Stretch nebulas along the milky way band occasionally
    const nrX = 150 + Math.random() * 350;
    const nrY = 150 + Math.random() * (i < 4 ? 400 : 200);

    const hue = Math.floor(Math.random() * 80) + 190; // Deep blues (190) to rich purples (270)

    // Draw elliptical nebula
    ctx.save();
    ctx.translate(nx, ny);
    ctx.rotate(Math.random() * Math.PI);

    const nebulaGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(nrX, nrY));
    // Richer colors, lower opacity at the edges
    nebulaGrad.addColorStop(0, `hsla(${hue}, 70%, 25%, 0.05)`);
    nebulaGrad.addColorStop(0.4, `hsla(${hue}, 60%, 15%, 0.03)`);
    nebulaGrad.addColorStop(1, 'transparent');

    ctx.beginPath();
    ctx.ellipse(0, 0, nrX, nrY, 0, 0, Math.PI * 2);
    ctx.fillStyle = nebulaGrad;
    ctx.fill();
    ctx.restore();
  }

  return canvas;
}

/** Cached starfield canvas (created once) */
let _starfieldCanvas: HTMLCanvasElement | null = null;

export function getProcessedEarthCanvas(): HTMLCanvasElement | string {
  // Use the raw texture URL directly instead of a processed canvas
  // to avoid race conditions where ECharts renders an empty white canvas
  // before the image loads.
  return LOCAL_TEXTURES.earth;
}

/**
 * Returns the full texture set for the ECharts globe.
 * Uses high-quality local textures + procedural starfield.
 */
export function getGlobeTextures(): GlobeTextureSet {
  if (!_starfieldCanvas) {
    _starfieldCanvas = generateStarfieldCanvas();
  }
  return {
    ...LOCAL_TEXTURES,
    earth: getProcessedEarthCanvas(),
    environment: _starfieldCanvas,
  };
}

/**
 * Generates the ECharts globe option texture configuration
 * for the main Earth globe.
 */
export function createGlobeTextureOptions(textures: GlobeTextureSet) {
  return {
    baseTexture: textures.earth,
    environment: textures.environment,
    specularIntensity: 0.0,
    shading: 'realistic' as const,
    realisticMaterial: {
      roughness: 0.95,
      metalness: 0.0,
      textureTiling: [1, 1],
    },
  };
}

/**
 * Generates ECharts globe option for a cloud overlay layer.
 * The cloud layer is rendered as a second, slightly larger globe.
 */
export function createCloudLayerOptions(textures: GlobeTextureSet, opacity: number = 0.55) {
  return {
    type: 'globe' as const,
    radius: 50.3, // Slightly larger than the base globe (default 50)
    baseTexture: textures.clouds,
    shading: 'lambert' as const,
    silent: true,
    itemStyle: {
      opacity,
    },
    viewControl: {
      show: false, // Controlled by the main globe
    },
    light: {
      ambient: { intensity: 0.6 },
      main: { intensity: 0 },
    },
  };
}
