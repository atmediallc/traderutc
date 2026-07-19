/**
 * MarketPins Component
 *
 * Renders 3D glowing markers on the Earth surface for all financial centers.
 * Uses InstancedMesh for high performance (1 draw call for all pins).
 */
'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Object3D, Color, InstancedMesh, ShaderMaterial, Vector3, SphereGeometry, AdditiveBlending } from 'three';
import type { ThreeEvent } from '@react-three/fiber';
import { useMarketsStore } from '../stores/markets.store';
import { useUTCStore } from '@/features/utc/stores/utc.store';
import { getStatusColor } from '../hooks/useMarketStatus';
import { earthEngine, marketIntelligenceEngine, MARKETS } from '@/engines';

// Temporary override because DEFAULT_EARTH_CONFIG is inside earth/constants/earth.constants.ts.
// Let's import DEFAULT_EARTH_CONFIG directly from earth feature if it's not in engines.
// Wait, we can keep importing DEFAULT_EARTH_CONFIG from '@/features/earth/constants/earth.constants'.
import { DEFAULT_EARTH_CONFIG } from '@/features/earth/constants/earth.constants';

// Core pin shaders
const coreVertexShader = /* glsl */ `
  attribute vec3 color;
  varying vec3 vColor;
  void main() {
    vColor = color;
    vec4 worldPosition = modelMatrix * instanceMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const coreFragmentShader = /* glsl */ `
  precision highp float;
  varying vec3 vColor;
  void main() {
    gl_FragColor = vec4(vColor * 2.5, 0.95);
  }
`;

// Pulse sphere shaders
const pulseVertexShader = /* glsl */ `
  attribute vec3 color;
  varying vec3 vColor;
  varying vec3 vWorldNormal;
  varying vec3 vViewPosition;

  void main() {
    vColor = color;
    vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
    vWorldNormal = normalize(normalMatrix * mat3(instanceMatrix) * normal);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const pulseFragmentShader = /* glsl */ `
  precision highp float;
  varying vec3 vColor;
  varying vec3 vWorldNormal;
  varying vec3 vViewPosition;
  uniform float time;

  void main() {
    vec3 normal = normalize(vWorldNormal);
    vec3 viewDir = normalize(vViewPosition);

    // Fresnel effect
    float fresnel = pow(1.0 - clamp(dot(normal, viewDir), 0.0, 1.0), 3.0);
    
    // Rhythmic pulse
    float pulse = 0.5 + 0.5 * sin(time * 4.5);
    
    vec3 glowColor = vColor * (fresnel * 2.0 + pulse * 0.5);
    float alpha = fresnel * (0.4 + pulse * 0.35);

    gl_FragColor = vec4(glowColor, alpha);
  }
`;

const dummy = new Object3D();
const tempColor = new Color();
const tempPulseColor = new Color();
const PIN_RADIUS = DEFAULT_EARTH_CONFIG.radius * 1.012; // Slightly above cloud-shadowed surface

export function MarketPins() {
  const coreRef = useRef<InstancedMesh>(null);
  const pulseRef = useRef<InstancedMesh>(null);
  const selectMarket = useMarketsStore((s) => s.selectMarket);
  const selectedMarketId = useMarketsStore((s) => s.selectedMarketId);
  const filteredMarkets = useMarketsStore((s) => s.filteredMarkets);
  
  // We need current time to update colors based on status
  const utcMs = useUTCStore((s) => s.utcMs);
  const timeRef = useRef(0);

  // Colors arrays for instances
  const colorsArray = useMemo(() => {
    return new Float32Array(MARKETS.length * 3);
  }, []);

  const pulseColorsArray = useMemo(() => {
    return new Float32Array(MARKETS.length * 3);
  }, []);

  // Set up instance matrices based on lat/lng
  useEffect(() => {
    if (!coreRef.current || !pulseRef.current) return;

    MARKETS.forEach((market, i) => {
      const [lat, lng] = market.coordinates;
      const [x, y, z] = earthEngine.geoToCartesian(lat, lng, PIN_RADIUS);
      
      dummy.position.set(x, y, z);
      
      // Orient pin to face outward from center
      dummy.lookAt(new Vector3(x * 2, y * 2, z * 2));
      dummy.updateMatrix();
      
      coreRef.current!.setMatrixAt(i, dummy.matrix);
      pulseRef.current!.setMatrixAt(i, dummy.matrix);
    });
    
    coreRef.current.instanceMatrix.needsUpdate = true;
    pulseRef.current.instanceMatrix.needsUpdate = true;
  }, []);

  // Update colors based on market status every frame/tick
  useFrame((_, delta) => {
    if (!coreRef.current || !pulseRef.current) return;

    timeRef.current += delta;
    
    const coreMat = coreRef.current.material;
    if (coreMat instanceof ShaderMaterial) {
      coreMat.uniforms.time.value = timeRef.current;
    }

    const pulseMat = pulseRef.current.material;
    if (pulseMat instanceof ShaderMaterial) {
      pulseMat.uniforms.time.value = timeRef.current;
    }

    // Only update colors occasionally to save performance (e.g., once per second)
    // For this example, updating every frame is fine since N=21 is tiny.
    MARKETS.forEach((market, i) => {
      const isFiltered = !filteredMarkets.some((item) => item.id === market.id);
      
      if (isFiltered) {
        tempColor.setHex(0x111827); // Very dim if filtered out
        tempPulseColor.setHex(0x000000); // Transparent trace
      } else {
        const status = marketIntelligenceEngine.computeMarketStatus(market.id, utcMs);
        const isSelected = selectedMarketId === market.id;
        const baseColor = isSelected ? '#4da3ff' : getStatusColor(status.status);
        
        // Ambient / diffuse multiply
        tempColor.set(baseColor);
        if (status.status === 'OPEN') {
          tempColor.multiplyScalar(2.0); // Bright core when open
        } else if (status.status === 'CLOSED') {
          tempColor.multiplyScalar(0.4); // Dim core when closed
        }
        
        // Outer glowing pulse
        tempPulseColor.set(baseColor);
        if (status.status === 'OPEN') {
          tempPulseColor.multiplyScalar(1.5);
        } else if (status.status === 'CLOSED') {
          tempPulseColor.multiplyScalar(0.12); // Minimally visible
        }
      }
      
      tempColor.toArray(colorsArray, i * 3);
      tempPulseColor.toArray(pulseColorsArray, i * 3);
    });
    
    coreRef.current.geometry.attributes.color.needsUpdate = true;
    pulseRef.current.geometry.attributes.color.needsUpdate = true;
  });

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    if (event.instanceId !== undefined) {
      const clickedMarket = MARKETS[event.instanceId];
      if (clickedMarket) {
        selectMarket(clickedMarket.id);
      }
    }
  };

  return (
    <group>
      {/* 3D Core Sphere */}
      <instancedMesh
        ref={coreRef}
        args={[undefined, undefined, MARKETS.length]}
        onClick={handleClick}
      >
        <sphereGeometry args={[0.012, 12, 12]}>
          <instancedBufferAttribute
            attach="attributes-color"
            args={[colorsArray, 3]}
          />
        </sphereGeometry>
        <shaderMaterial
          vertexShader={coreVertexShader}
          fragmentShader={coreFragmentShader}
          uniforms={{ time: { value: 0 } }}
          transparent
        />
      </instancedMesh>

      {/* 3D Pulse/Fresnel Glow Sphere */}
      <instancedMesh
        ref={pulseRef}
        args={[undefined, undefined, MARKETS.length]}
        onClick={handleClick}
      >
        <sphereGeometry args={[0.038, 16, 16]}>
          <instancedBufferAttribute
            attach="attributes-color"
            args={[pulseColorsArray, 3]}
          />
        </sphereGeometry>
        <shaderMaterial
          vertexShader={pulseVertexShader}
          fragmentShader={pulseFragmentShader}
          uniforms={{ time: { value: 0 } }}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </instancedMesh>
    </group>
  );
}
