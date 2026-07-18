/**
 * PostProcessing Component
 *
 * Applies post-processing effects to the 3D scene:
 * - Bloom for HDR glow (city lights, atmosphere, market pins)
 * - Tone mapping for cinematic color grading
 * - Vignette for focus effect
 */
'use client';

import {
  EffectComposer,
  Bloom,
  Vignette,
  ToneMapping,
} from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { POST_PROCESSING_CONFIG } from '../constants/earth.constants';
import { useEarthStore } from '../stores/earth.store';

export function PostProcessing() {
  const enabled = useEarthStore((s) => s.postProcessingEnabled);

  if (!enabled) return null;

  return (
    <EffectComposer multisampling={0}>
      <Bloom
        luminanceThreshold={POST_PROCESSING_CONFIG.bloom.luminanceThreshold}
        luminanceSmoothing={POST_PROCESSING_CONFIG.bloom.luminanceSmoothing}
        intensity={POST_PROCESSING_CONFIG.bloom.intensity}
        mipmapBlur={POST_PROCESSING_CONFIG.bloom.mipmapBlur}
      />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <Vignette
        offset={POST_PROCESSING_CONFIG.vignette.offset}
        darkness={POST_PROCESSING_CONFIG.vignette.darkness}
      />
    </EffectComposer>
  );
}
