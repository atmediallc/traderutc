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

  // --- Lighting ---
  uniform vec3 sunDirection;
  uniform float ambientIntensity;
  uniform float specularStrength;
  uniform float nightIntensity;
  uniform float terminatorWidth;
  uniform float oceanSpecularPower;
  uniform float cityBloomStrength;

  // --- Varyings ---
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPosition;

  float saturate2(float x) {
    return clamp(x, 0.0, 1.0);
  }

  void main() {
    // =========================================================
    // LAYER 1: Albedo + Directional Light
    // =========================================================
    // This is the foundation. Everything else is additive.
    // If this layer looks wrong, nothing else will fix it.

    vec4 albedo = texture2D(dayTexture, vUv);
    vec3 lightDir = normalize(sunDirection);
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);

    // Perturb normal using normal map for terrain detail
    vec3 mapNormal = texture2D(normalTexture, vUv).rgb * 2.0 - 1.0;
    vec3 normal = normalize(vWorldNormal + mapNormal * 0.3);

    // Lambertian diffuse lighting
    float dotNL = dot(normal, lightDir);
    float diffuse = max(dotNL, 0.0);

    // Ambient fill (very low — space is dark)
    vec3 ambient = albedo.rgb * ambientIntensity;

    // Day hemisphere
    vec3 dayColor = albedo.rgb * diffuse + ambient;

    // Night hemisphere (very dark — only city lights later)
    vec3 nightColor = vec3(0.0, 0.0, 0.0);

    // =========================================================
    // LAYER 1b: Terminator
    // =========================================================
    // The terminator is the day/night boundary.
    // We compute it once and share across all layers.
    // Narrow = crisp transition like NASA photography.

    float dayFactor = smoothstep(-terminatorWidth, terminatorWidth, dotNL);
    float nightFactor = 1.0 - dayFactor;

    // =========================================================
    // LAYER 2: Ocean Specular (sun glint on water)
    // =========================================================
    // Specular map (red channel) acts as ocean mask.
    // Only water reflects sunlight toward the viewer.

    float oceanMask = texture2D(specularTexture, vUv).r;
    vec3 halfDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(normal, halfDir), 0.0), oceanSpecularPower);
    vec3 oceanSpecular = vec3(1.0, 0.97, 0.92) * spec * oceanMask * specularStrength * dayFactor;

    // =========================================================
    // LAYER 3: Night City Lights
    // =========================================================
    // City lights from the night texture, visible on the dark side.
    // Multiplied by nightFactor so they fade across the terminator.

    vec4 nightTex = texture2D(nightTexture, vUv);
    float cityMask = max(max(nightTex.r, nightTex.g), nightTex.b);
    vec3 cityLights = nightTex.rgb * nightIntensity * cityBloomStrength
                    * smoothstep(0.15, 0.7, nightFactor);

    // =========================================================
    // FINAL COMPOSITE
    // =========================================================
    // Day side: albedo * diffuse + ambient + ocean specular
    // Night side: city lights
    // Blend across terminator

    vec3 finalColor = mix(cityLights, dayColor + oceanSpecular, dayFactor);

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

    // Fresnel: atmosphere only visible near the limb (edge of Earth)
    float viewDot = saturate2(dot(viewDir, vWorldNormal));
    float limb = pow(1.0 - viewDot, fresnelPower);

    // Sun-facing side gets slightly brighter atmosphere
    float sunDot = dot(vWorldNormal, lightDir);
    float daylight = smoothstep(-0.3, 0.2, sunDot);

    // Rayleigh scattering - subtle blue at limb
    float rayleighPhase = 0.75 * (1.0 + pow(dot(viewDir, lightDir), 2.0));
    vec3 rayleigh = atmosphereColor * rayleighPhase * rayleighStrength;

    // Mie scattering - warm glow near sun
    float miePhase = pow(saturate2(dot(viewDir, lightDir)), 12.0);
    vec3 mie = vec3(1.0, 0.7, 0.4) * miePhase * mieStrength;

    // Sunset glow at horizon
    float horizon = pow(1.0 - abs(sunDot), 3.0) * horizonGlow;
    vec3 sunset = vec3(1.0, 0.45, 0.2) * horizon * sunsetStrength;

    // Combine scattering components
    vec3 color = (rayleigh + mie + sunset) * atmosphereIntensity * mix(0.5, 1.0, daylight);

    // Alpha: only visible at limb, never in center
    float alpha = limb * atmosphereOpacity * mix(0.4, 1.0, daylight);

    // Clamp alpha to avoid visible overlay on the planet center
    alpha = saturate2(alpha);

    gl_FragColor = vec4(color, alpha);
  }
`;
