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
    size / 2, size / 2, size * 0.7
  );
  gradient.addColorStop(0, '#060a14');
  gradient.addColorStop(0.5, '#030610');
  gradient.addColorStop(1, '#01020a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  // Draw stars with varying sizes and brightness
  const starCount = 3000;

  for (let i = 0; i < starCount; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const radius = Math.random();

    // Most stars are tiny, a few are bigger
    let r: number;
    if (radius < 0.85) {
      r = 0.3 + Math.random() * 0.5;
    } else if (radius < 0.97) {
      r = 0.8 + Math.random() * 1.2;
    } else {
      r = 1.5 + Math.random() * 2.0;
    }

    // Star color variation (white, blue-white, warm)
    const colorRoll = Math.random();
    let color: string;
    if (colorRoll < 0.6) {
      const brightness = 180 + Math.floor(Math.random() * 75);
      color = `rgba(${brightness}, ${brightness}, ${brightness + 10}, ${0.4 + Math.random() * 0.6})`;
    } else if (colorRoll < 0.85) {
      color = `rgba(${160 + Math.floor(Math.random() * 60)}, ${180 + Math.floor(Math.random() * 60)}, 255, ${0.5 + Math.random() * 0.5})`;
    } else {
      color = `rgba(255, ${200 + Math.floor(Math.random() * 50)}, ${160 + Math.floor(Math.random() * 60)}, ${0.4 + Math.random() * 0.5})`;
    }

    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    // Add glow to brighter stars
    if (r > 1.2) {
      ctx.beginPath();
      ctx.arc(x, y, r * 3, 0, Math.PI * 2);
      const glowGrad = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
      glowGrad.addColorStop(0, `rgba(200, 220, 255, 0.15)`);
      glowGrad.addColorStop(1, 'rgba(200, 220, 255, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fill();
    }
  }

  // Add subtle nebula clouds
  for (let i = 0; i < 4; i++) {
    const nx = Math.random() * size;
    const ny = Math.random() * size;
    const nr = 100 + Math.random() * 300;

    const nebulaGrad = ctx.createRadialGradient(nx, ny, 0, nx, ny, nr);
    const hue = Math.floor(Math.random() * 60) + 200; // Blues and purples
    nebulaGrad.addColorStop(0, `hsla(${hue}, 60%, 30%, 0.04)`);
    nebulaGrad.addColorStop(0.5, `hsla(${hue}, 50%, 20%, 0.02)`);
    nebulaGrad.addColorStop(1, 'transparent');

    ctx.beginPath();
    ctx.arc(nx, ny, nr, 0, Math.PI * 2);
    ctx.fillStyle = nebulaGrad;
    ctx.fill();
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
    heightTexture: textures.bump,
    displacementScale: 0.02,
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
