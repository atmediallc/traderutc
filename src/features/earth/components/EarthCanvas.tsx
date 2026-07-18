/**
 * EarthCanvas Component
 *
 * The top-level React Three Fiber Canvas that renders the complete
 * 3D Earth scene. This component must be dynamically imported with
 * ssr: false because Three.js requires browser APIs.
 *
 * Composes: EarthSphere, CloudLayer, Atmosphere, Sun, Starfield,
 * CameraController, and PostProcessing.
 */
'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Preload } from '@react-three/drei';
import { EarthSphere } from './EarthSphere';
import { CloudLayer } from './CloudLayer';
import { Atmosphere } from './Atmosphere';
import { Sun } from './Sun';
import { Starfield } from './Starfield';
import { CameraController } from './CameraController';
import { PostProcessing } from './PostProcessing';
import { CAMERA_CONFIG } from '../constants/earth.constants';

import { MarketPins } from '@/features/markets/components/MarketPins';

/** Loading fallback while textures load */
function EarthLoader() {
  return (
    <mesh>
      <sphereGeometry args={[1, 32, 32]} />
      <meshBasicMaterial color="#0a1628" wireframe />
    </mesh>
  );
}

export function EarthCanvas() {
  return (
    <Canvas
      camera={{
        position: CAMERA_CONFIG.defaultPosition,
        fov: CAMERA_CONFIG.defaultFov,
        near: 0.01,
        far: 200,
      }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
        stencil: false,
      }}
      dpr={[1, 2]}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: '#000308',
      }}
    >
      {/* Background color */}
      <color attach="background" args={['#000308']} />

      <Suspense fallback={<EarthLoader />}>
        {/* Stars behind everything */}
        <Starfield />

        {/* Lighting */}
        <Sun />

        {/* Earth layers */}
        <EarthSphere />
        <CloudLayer />
        <Atmosphere />
        <MarketPins />

        {/* Camera */}
        <CameraController />

        {/* Post-processing effects */}
        <PostProcessing />

        {/* Preload all assets */}
        <Preload all />
      </Suspense>
    </Canvas>
  );
}
