/**
 * Earth Shaders
 *
 * GLSL shaders inlined as TypeScript template literals.
 * This avoids the need for custom webpack/turbopack loaders.
 */

export const earthVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;

  void main() {
    vUv = uv;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const earthFragmentShader = /* glsl */ `
  //
  // Earth Fragment Shader — Layer Architecture
  //
  // Each rendering feature is isolated. Features are additive:
  // you can enable/disable any combination without breaking others.
  //
  // Layer order (bottom to top):
  //   1. Albedo + Directional Light      (base)
  //   2. Normal Map / Bump                (terrain relief)
  //   3. Ocean Specular                   (sun glint on water)
  //   4. Night City Lights                (emissive on dark side)
  //   5. Atmosphere (separate shell)      (independent component)
  //   6. Clouds (separate shell)          (independent component)
  //
  precision highp float;

  // --- Textures ---
  uniform sampler2D dayTexture;
  uniform sampler2D nightTexture;
  uniform sampler2D specularTexture;
  uniform sampler2D normalTexture;
  uniform sampler2D cloudTexture;

  // --- Lighting ---
  uniform vec3 sunDirection;
  uniform float ambientIntensity;
  uniform float specularStrength;
  uniform float nightIntensity;
  uniform float terminatorWidth;
  uniform float oceanSpecularPower;
  uniform float cityBloomStrength;
  uniform float normalScale;
  uniform float time;

  // --- Varyings ---
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;

  float saturate2(float x) {
    return clamp(x, 0.0, 1.0);
  }

  // Reconstruct orthogonal tangent frame from world normal.
  // Avoids needing geometry-level tangent attributes.
  mat3 constructTBN(vec3 n) {
    vec3 up = abs(n.y) < 0.99 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
    vec3 t = normalize(cross(n, up));
    vec3 b = cross(n, t);
    return mat3(t, b, n);
  }

  void main() {
    vec3 lightDir = normalize(sunDirection);
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    vec3 worldNormal = normalize(vWorldNormal);

    // =========================================================
    // LAYER 1: Albedo & Perturbed Tangent Normal mapping
    // =========================================================
    vec4 albedo = texture2D(dayTexture, vUv);
    float oceanMask = texture2D(specularTexture, vUv).r;

    vec3 mapNormal = texture2D(normalTexture, vUv).rgb * 2.0 - 1.0;
    mapNormal.xy *= normalScale;

    // Specular Ocean Wave perturbation to simulate moving water
    if (oceanMask > 0.05) {
      vec2 waveUv = vUv * 450.0;
      vec2 waveOffset = vec2(
        sin(waveUv.y + time * 1.5) * 0.04,
        cos(waveUv.x - time * 1.2) * 0.04
      ) * oceanMask;
      mapNormal.xy += waveOffset;
    }

    mapNormal.z = sqrt(max(0.0, 1.0 - dot(mapNormal.xy, mapNormal.xy)));
    mat3 tbn = constructTBN(worldNormal);
    vec3 normal = normalize(tbn * mapNormal);

    // Lambertian diffuse lighting
    float dotNL = dot(normal, lightDir);
    float dayFactor = smoothstep(-terminatorWidth, terminatorWidth, dotNL);
    float nightFactor = 1.0 - dayFactor;

    // Base Day color (with ambient)
    vec3 dayColor = albedo.rgb * max(dotNL, 0.0) + albedo.rgb * ambientIntensity;

    // =========================================================
    // LAYER 2: Ocean Specular (with Fresnel reflection & Waves)
    // =========================================================
    vec3 halfDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(normal, halfDir), 0.0), oceanSpecularPower);
    
    // Water Fresnel coefficient (Schlick approximation)
    float R0 = 0.02 + 0.02 * oceanSpecularPower * 0.01;
    float waterFresnel = R0 + (1.0 - R0) * pow(1.0 - max(dot(normal, viewDir), 0.0), 5.0);
    
    vec3 oceanSpecular = vec3(1.0, 0.97, 0.92) * spec * oceanMask * waterFresnel * specularStrength * dayFactor;

    // =========================================================
    // LAYER 3: Cloud Shadows projected downwards
    // =========================================================
    // Account for cloud drift uv
    vec2 cloudUv = vUv + vec2(time * 0.0012, 0.0);
    // Project shadow by offsetting in opposite direction of lighting
    vec2 shadowOffset = vec2(-lightDir.x, -lightDir.y) * 0.012;
    float cloudShadowVal = texture2D(cloudTexture, cloudUv + shadowOffset).r;
    // Darken diffuse day side under clouds
    float cloudShadowFactor = mix(1.0, 0.40, smoothstep(0.35, 0.85, cloudShadowVal) * dayFactor);
    dayColor *= cloudShadowFactor;

    // =========================================================
    // LAYER 4: Night City Lights (fade across terminator & sunset)
    // =========================================================
    vec4 nightTex = texture2D(nightTexture, vUv);
    
    // Twilight fade: prevent city lights from showing on sun-facing side
    // and smoothly fade them in as it gets completely dark.
    float sunsetFade = smoothstep(0.05, 0.75, nightFactor);
    vec3 cityLights = nightTex.rgb * nightIntensity * cityBloomStrength * sunsetFade;

    // =========================================================
    // LAYER 5: Tangerine Sunset terminator band
    // =========================================================
    // Thin orange band exactly at the terminator transition
    float sunsetBand = pow(1.0 - abs(dotNL), 8.0) * smoothstep(-0.2, 0.1, dotNL);
    vec3 sunsetGlow = vec3(1.0, 0.42, 0.15) * sunsetBand * 1.6;

    // =========================================================
    // FINAL COMPOSITE
    // =========================================================
    vec3 finalColor = mix(cityLights, dayColor + oceanSpecular + sunsetGlow, dayFactor);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export const atmosphereVertexShader = /* glsl */ `
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;

  void main() {
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const atmosphereFragmentShader = /* glsl */ `
  precision highp float;

  uniform vec3 atmosphereColor;
  uniform float fresnelPower;
  uniform float atmosphereOpacity;
  uniform float atmosphereIntensity;
  uniform float rayleighStrength;
  uniform float mieStrength;
  uniform float horizonGlow;
  uniform float sunsetStrength;
  uniform vec3 sunDirection;

  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;

  float saturate2(float value) {
    return clamp(value, 0.0, 1.0);
  }

  void main() {
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    vec3 lightDir = normalize(sunDirection);

    float viewDot = saturate2(dot(viewDir, vWorldNormal));
    
    // Rayleigh scattering - thin blue outer envelope
    float rayleighLimb = pow(1.0 - viewDot, 6.0);
    float rayleighPhase = 0.75 * (1.0 + pow(dot(viewDir, lightDir), 2.0));
    vec3 rayleigh = atmosphereColor * rayleighPhase * rayleighLimb * rayleighStrength;

    // Mie scattering - thicker sun-halo scattering
    float mieLimb = pow(1.0 - viewDot, 4.0);
    float miePhase = pow(saturate2(dot(viewDir, lightDir)), 8.0);
    vec3 mie = vec3(0.85, 0.9, 1.0) * miePhase * mieLimb * mieStrength;

    // Sunset glow at the twilight band (terminator)
    float sunDot = dot(vWorldNormal, lightDir);
    float daylight = smoothstep(-0.2, 0.2, sunDot);
    
    // Sunset glow occurs where sun is grazing (sunDot near 0) at the limb
    float sunsetTerminator = pow(1.0 - abs(sunDot), 4.0);
    vec3 sunset = vec3(1.0, 0.38, 0.15) * sunsetTerminator * (1.0 - viewDot) * sunsetStrength * horizonGlow;

    // Sum components
    vec3 color = (rayleigh + mie + sunset) * atmosphereIntensity;
    
    // Enhance alpha scaling for the blue limb edge
    float alpha = (rayleighLimb * 0.8 + mieLimb * 0.2 + sunsetTerminator * 0.5 * (1.0 - viewDot)) * atmosphereOpacity;
    
    // Fade out at night side
    alpha *= mix(0.15, 1.0, daylight);
    alpha = saturate2(alpha);

    gl_FragColor = vec4(color, alpha);
  }
`;
