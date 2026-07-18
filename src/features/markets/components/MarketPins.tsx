/**
 * MarketPins Component
 *
 * Renders 3D glowing markers on the Earth surface for all financial centers.
 * Uses InstancedMesh for high performance (1 draw call for all pins).
 */
'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Object3D, Color, InstancedMesh, MathUtils, Vector3 } from 'three';
import { useMarketsStore } from '../stores/markets.store';
import { useUTCStore } from '@/features/utc/stores/utc.store';
import { getStatusColor } from '../hooks/useMarketStatus';
import { earthEngine, marketIntelligenceEngine, MARKETS } from '@/engines';

// Temporary override because DEFAULT_EARTH_CONFIG is inside earth/constants/earth.constants.ts.
// Let's import DEFAULT_EARTH_CONFIG directly from earth feature if it's not in engines.
// Wait, we can keep importing DEFAULT_EARTH_CONFIG from '@/features/earth/constants/earth.constants'.
import { DEFAULT_EARTH_CONFIG } from '@/features/earth/constants/earth.constants';

// Custom shader for instanced glowing pins
const pinVertexShader = `
  attribute vec3 color;
  varying vec3 vColor;
  varying vec2 vUv;
  
  void main() {
    vColor = color;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
  }
`;

const pinFragmentShader = `
  varying vec3 vColor;
  varying vec2 vUv;
  uniform float time;

  void main() {
    // Create a circular point
    vec2 center = vec2(0.5, 0.5);
    float dist = distance(vUv, center);
    
    if (dist > 0.5) discard; // Make it a circle
    
    // Soft edge glow
    float glow = 1.0 - (dist * 2.0);
    glow = pow(glow, 1.5);
    
    // Pulse animation based on time
    float pulse = (sin(time * 3.0) * 0.2) + 0.8;
    
    // Core is brighter, edges fade out
    vec3 finalColor = vColor * (glow + 0.5) * pulse;
    
    // Output color with high values for Bloom post-processing
    gl_FragColor = vec4(finalColor * 2.5, glow);
  }
`;

const dummy = new Object3D();
const tempColor = new Color();
const PIN_RADIUS = DEFAULT_EARTH_CONFIG.radius * 1.001; // Slightly above surface

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
    // Update shader time uniform
    if (meshRef.current.material && 'uniforms' in meshRef.current.material) {
      (meshRef.current.material as any).uniforms.time.value = timeRef.current;
    }

    // Only update colors occasionally to save performance (e.g., once per second)
    // For this example, updating every frame is fine since N=21 is tiny.
    MARKETS.forEach((market, i) => {
      const isFiltered = !filteredMarkets.some(m => m.id === market.id);
      
      if (isFiltered) {
        tempColor.setHex(0x111111); // Very dim if filtered out
      } else {
        const status = marketIntelligenceEngine.computeMarketStatus(market.id, utcMs);
        const isSelected = selectedMarketId === market.id;
        
        let colorStr = getStatusColor(status.status);
        if (isSelected) colorStr = '#ffffff'; // White if selected
        
        tempColor.set(colorStr);
      }
      
      tempColor.toArray(colorsArray, i * 3);
    });
    
    meshRef.current.geometry.attributes.color.needsUpdate = true;
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (e.instanceId !== undefined) {
      const clickedMarket = MARKETS[e.instanceId];
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
      <planeGeometry args={[0.04, 0.04]}>
        <instancedBufferAttribute
          attach="attributes-color"
          args={[colorsArray, 3]}
        />
      </planeGeometry>
      <shaderMaterial
        vertexShader={pinVertexShader}
        fragmentShader={pinFragmentShader}
        uniforms={{ time: { value: 0 } }}
        transparent={true}
        depthWrite={false}
      />
    </instancedMesh>
  );
}
