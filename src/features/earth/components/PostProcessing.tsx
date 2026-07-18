/**
 * PostProcessing Component
 *
 * Minimal post-processing for Earth rendering:
 * - Subtle bloom for realistic city light glow only
 * - No SSAO (wrong for a sphere in space)
 * - No vignette (cinematic effect, reduces realism)
 * - No second tone mapping (renderer already has ACES)
 *
 * NOTE: The renderer (EarthCanvas.tsx) already applies ACESFilmicToneMapping.
 * Applying ToneMapping here too would double-correct and wash out colors.
 */
'use client';

import {
  EffectComposer,
  Bloom,
  SMAA,
} from '@react-three/postprocessing';
import { POST_PROCESSING_CONFIG } from '../constants/earth.constants';
import { useEarthStore } from '../stores/earth.store';

export function PostProcessing() {
  const enabled = useEarthStore((s) => s.postProcessingEnabled);

  if (!enabled) return null;

  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      <Bloom
        luminanceThreshold={POST_PROCESSING_CONFIG.bloom.luminanceThreshold}
        luminanceSmoothing={POST_PROCESSING_CONFIG.bloom.luminanceSmoothing}
        intensity={POST_PROCESSING_CONFIG.bloom.intensity}
        mipmapBlur={POST_PROCESSING_CONFIG.bloom.mipmapBlur}
      />
      <SMAA />
    </EffectComposer>
  );
}
