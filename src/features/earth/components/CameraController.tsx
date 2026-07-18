/**
 * CameraController Component
 *
 * Provides orbit controls with smooth damping, zoom limits,
 * and animated camera transitions for city focus.
 */
'use client';

import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsType } from 'three-stdlib';
import { Vector3 } from 'three';
import { CAMERA_CONFIG } from '../constants/earth.constants';
import { useEarthStore } from '../stores/earth.store';

export function CameraController() {
  const controlsRef = useRef<OrbitControlsType>(null);
  const { camera } = useThree();
  const autoRotate = useEarthStore((s) => s.autoRotate);
  const cameraState = useEarthStore((s) => s.camera);
  const setCameraAnimating = useEarthStore((s) => s.setCameraAnimating);

  // Target position for smooth animation
  const targetPos = useRef(new Vector3(...CAMERA_CONFIG.defaultPosition));
  const isAnimatingRef = useRef(false);

  // Respond to camera state changes (e.g., focus on city)
  useEffect(() => {
    if (cameraState.isAnimating) {
      targetPos.current.set(...cameraState.position);
      isAnimatingRef.current = true;
    }
  }, [cameraState.position, cameraState.isAnimating]);

  // Smooth camera animation
  useFrame((_, delta) => {
    if (isAnimatingRef.current) {
      const currentPos = camera.position;
      const dist = currentPos.distanceTo(targetPos.current);
      const ease = 1 - Math.exp(-delta * 2.8);

      if (dist < 0.01) {
        isAnimatingRef.current = false;
        setCameraAnimating(false);
      } else {
        camera.position.lerp(targetPos.current, ease);
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableDamping
      dampingFactor={CAMERA_CONFIG.dampingFactor}
      minDistance={CAMERA_CONFIG.minDistance}
      maxDistance={CAMERA_CONFIG.maxDistance}
      autoRotate={autoRotate}
      autoRotateSpeed={CAMERA_CONFIG.autoRotateSpeed}
      rotateSpeed={0.34}
      zoomSpeed={0.58}
    />
  );
}
