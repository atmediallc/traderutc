/**
 * MarketPins Component
 *
 * Renders 3D glowing markers on the Earth surface for all financial centers.
 * Uses InstancedMesh for high performance (1 draw call for all pins).
 */
'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Object3D, Color, InstancedMesh, ShaderMaterial, Vector3 } from 'three';
import type { ThreeEvent } from '@react-three/fiber';
import { useMarketsStore } from '../stores/markets.store';
import { useUTCStore } from '@/features/utc/stores/utc.store';
import { getStatusColor } from '../hooks/useMarketStatus';
import { earthEngine, marketIntelligenceEngine, MARKETS } from '@/engines';

// Temporary override because DEFAULT_EARTH_CONFIG is inside earth/constants/earth.constants.ts.
// Let's import DEFAULT_EARTH_CONFIG directly from earth feature if it's not in engines.
// Wait, we can keep importing DEFAULT_EARTH_CONFIG from '@/features/earth/constants/earth.constants'.
import { DEFAULT_EARTH_CONFIG } from '@/features/earth/constants/earth.constants';

// Custom shader for instanced market entities: halo, core, and status pulse.
const pinVertexShader = /* glsl */ `
  attribute vec3 color;
  varying vec3 vColor;
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  
  void main() {
    vColor = color;
    vUv = uv;
    vec4 worldPosition = modelMatrix * instanceMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const pinFragmentShader = /* glsl */ `
  precision highp float;

  varying vec3 vColor;
  varying vec2 vUv;
  uniform float time;

  void main() {
    vec2 center = vec2(0.5, 0.5);
    float dist = distance(vUv, center);
    if (dist > 0.5) discard;

    float core = smoothstep(0.18, 0.02, dist);
    float halo = smoothstep(0.5, 0.06, dist) * (1.0 - core * 0.18);
    float ring = smoothstep(0.34, 0.31, dist) - smoothstep(0.42, 0.39, dist);
    float pulse = 0.78 + sin(time * 2.6) * 0.14 + sin(time * 0.72) * 0.08;

    vec3 finalColor = vColor * (core * 4.5 + halo * 1.45 * pulse + ring * 2.2);
    float alpha = clamp(core + halo * 0.72 + ring * 0.8, 0.0, 1.0);
    gl_FragColor = vec4(finalColor, alpha);
  }
`;

const dummy = new Object3D();
const tempColor = new Color();
const PIN_RADIUS = DEFAULT_EARTH_CONFIG.radius * 1.012; // Slightly above cloud-shadowed surface

export function MarketPins() {
  const meshRef = useRef<InstancedMesh>(null);
  const selectMarket = useMarketsStore((s) => s.selectMarket);
  const selectedMarketId = useMarketsStore((s) => s.selectedMarketId);
  const filteredMarkets = useMarketsStore((s) => s.filteredMarkets);
  
  // We need current time to update colors based on status
  const utcMs = useUTCStore((s) => s.utcMs);
  const timeRef = useRef(0);

  // Colors array for instances
  const colorsArray = useMemo(() => {
    return new Float32Array(MARKETS.length * 3);
  }, []);

  // Set up instance matrices based on lat/lng
  useEffect(() => {
    if (!meshRef.current) return;

    MARKETS.forEach((market, i) => {
      const [lat, lng] = market.coordinates;
      const [x, y, z] = earthEngine.geoToCartesian(lat, lng, PIN_RADIUS);
      
      dummy.position.set(x, y, z);
      
      // Orient pin to face outward from center
      dummy.lookAt(new Vector3(x * 2, y * 2, z * 2));
      dummy.updateMatrix();
      
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, []);

  // Update colors based on market status every frame/tick
  useFrame((_, delta) => {
    if (!meshRef.current) return;

    timeRef.current += delta;
    const material = meshRef.current.material;
    if (material instanceof ShaderMaterial) {
      material.uniforms.time.value = timeRef.current;
    }

    // Only update colors occasionally to save performance (e.g., once per second)
    // For this example, updating every frame is fine since N=21 is tiny.
    MARKETS.forEach((market, i) => {
      const isFiltered = !filteredMarkets.some((item) => item.id === market.id);
      
      if (isFiltered) {
        tempColor.setHex(0x111827); // Very dim if filtered out
      } else {
        const status = marketIntelligenceEngine.computeMarketStatus(market.id, utcMs);
        const isSelected = selectedMarketId === market.id;
        const colorStr = isSelected ? '#4da3ff' : getStatusColor(status.status);
        tempColor.set(colorStr);
        if (status.status === 'OPEN') tempColor.multiplyScalar(1.18);
      }
      
      tempColor.toArray(colorsArray, i * 3);
    });
    
    meshRef.current.geometry.attributes.color.needsUpdate = true;
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
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, MARKETS.length]}
      onClick={handleClick}
    >
      <planeGeometry args={[0.075, 0.075]}>
        <instancedBufferAttribute
          attach="attributes-color"
          args={[colorsArray, 3]}
        />
      </planeGeometry>
      <shaderMaterial
        vertexShader={pinVertexShader}
        fragmentShader={pinFragmentShader}
        uniforms={{ time: { value: 0 } }}
        transparent
        depthWrite={false}
      />
    </instancedMesh>
  );
}
