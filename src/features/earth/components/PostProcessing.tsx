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
  SSAO,
  SMAA,
} from '@react-three/postprocessing';
import { BlendFunction, ToneMappingMode } from 'postprocessing';
import { POST_PROCESSING_CONFIG } from '../constants/earth.constants';
import { useEarthStore } from '../stores/earth.store';

export function PostProcessing() {
  const enabled = useEarthStore((s) => s.postProcessingEnabled);

  if (!enabled) return null;

  return (
    <EffectComposer multisampling={0} enableNormalPass>
      <SSAO
        blendFunction={BlendFunction.MULTIPLY}
        samples={16}
        rings={4}
        distanceThreshold={0.72}
        distanceFalloff={0.22}
        rangeThreshold={0.035}
        rangeFalloff={0.002}
        luminanceInfluence={0.55}
        radius={0.018}
        intensity={0.44}
      />
      <Bloom
        luminanceThreshold={POST_PROCESSING_CONFIG.bloom.luminanceThreshold}
        luminanceSmoothing={POST_PROCESSING_CONFIG.bloom.luminanceSmoothing}
        intensity={POST_PROCESSING_CONFIG.bloom.intensity}
        mipmapBlur={POST_PROCESSING_CONFIG.bloom.mipmapBlur}
      />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <SMAA />
      <Vignette
        offset={POST_PROCESSING_CONFIG.vignette.offset}
        darkness={POST_PROCESSING_CONFIG.vignette.darkness}
      />
    </EffectComposer>
  );
}
