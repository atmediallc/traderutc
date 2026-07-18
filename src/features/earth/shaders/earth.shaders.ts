/**
 * Earth Shaders
 *
 * GLSL shaders inlined as TypeScript template literals.
 * This avoids the need for custom webpack/turbopack loaders.
 */

export const earthVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const earthFragmentShader = /* glsl */ `
  precision highp float;

  uniform sampler2D dayTexture;
  uniform sampler2D nightTexture;
  uniform sampler2D specularTexture;
  uniform sampler2D bumpTexture;

  uniform vec3 sunDirection;
  uniform float ambientIntensity;
  uniform float bumpStrength;
  uniform float specularStrength;
  uniform float nightIntensity;
  uniform float terminatorWidth;
  uniform float goldenHourIntensity;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  // Perturb normal using bump map for terrain relief
  vec3 perturbNormal(vec3 normal, vec2 uv) {
    float texelSize = 1.0 / 2048.0;
    float heightL = texture2D(bumpTexture, uv - vec2(texelSize, 0.0)).r;
    float heightR = texture2D(bumpTexture, uv + vec2(texelSize, 0.0)).r;
    float heightD = texture2D(bumpTexture, uv - vec2(0.0, texelSize)).r;
    float heightU = texture2D(bumpTexture, uv + vec2(0.0, texelSize)).r;

    vec3 perturbation = vec3(
      (heightL - heightR) * bumpStrength,
      (heightD - heightU) * bumpStrength,
      0.0
    );

    return normalize(normal + perturbation);
  }

  void main() {
    // Sample textures
    vec4 dayColor = texture2D(dayTexture, vUv);
    vec4 nightColor = texture2D(nightTexture, vUv);
    float specularMask = texture2D(specularTexture, vUv).r;

    // Perturb normal for terrain depth
    vec3 normal = perturbNormal(vNormal, vUv);

    // Core lighting: dot product of surface normal and sun direction
    float dotNL = dot(normal, sunDirection);

    // --- Day/Night Transition ---
    float dayFactor = smoothstep(-terminatorWidth, terminatorWidth, dotNL);

    // --- Golden Hour ---
    float goldenFactor = smoothstep(-terminatorWidth * 0.5, terminatorWidth * 1.5, dotNL)
                       - smoothstep(terminatorWidth * 0.5, terminatorWidth * 2.5, dotNL);
    vec3 goldenTint = vec3(1.0, 0.7, 0.3) * goldenFactor * goldenHourIntensity;

    // --- Diffuse Lighting ---
    float diffuse = max(dotNL, 0.0);
    vec3 dayLit = dayColor.rgb * (diffuse + ambientIntensity) + goldenTint * dayColor.rgb;

    // --- Night Emission (City Lights) ---
    float nightEmission = smoothstep(0.0, -0.2, dotNL) * nightIntensity;
    vec3 nightLit = nightColor.rgb * nightEmission;

    // --- Specular (Ocean Reflections) ---
    vec3 viewDir = normalize(-vPosition);
    vec3 halfDir = normalize(sunDirection + viewDir);
    float spec = pow(max(dot(normal, halfDir), 0.0), 64.0);
    vec3 specular = vec3(1.0, 0.95, 0.85) * spec * specularMask * specularStrength * dayFactor;

    // --- Twilight Atmosphere ---
    float twilightFactor = smoothstep(-terminatorWidth * 2.0, -terminatorWidth * 0.5, dotNL)
                         - smoothstep(-terminatorWidth * 0.5, terminatorWidth * 0.5, dotNL);
    vec3 twilightTint = vec3(0.15, 0.1, 0.3) * twilightFactor * 0.5;

    // --- Final Composition ---
    vec3 finalColor = mix(nightLit + twilightTint, dayLit + specular, dayFactor);
    finalColor += dayColor.rgb * ambientIntensity * 0.15;

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export const atmosphereVertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const atmosphereFragmentShader = /* glsl */ `
  precision highp float;

  uniform vec3 atmosphereColor;
  uniform float fresnelPower;
  uniform float atmosphereOpacity;
  uniform float atmosphereIntensity;
  uniform vec3 sunDirection;

  varying vec3 vNormal;
  varying vec3 vPosition;

  void main() {
    vec3 viewDir = normalize(-vPosition);
    float fresnel = 1.0 - dot(viewDir, vNormal);
    fresnel = pow(fresnel, fresnelPower);

    float sunFacing = max(dot(vNormal, sunDirection), 0.0);
    float sunInfluence = 0.5 + 0.5 * sunFacing;

    vec3 warmColor = mix(atmosphereColor, vec3(0.6, 0.5, 0.3), sunFacing * 0.2);
    vec3 color = warmColor * atmosphereIntensity * sunInfluence;
    float alpha = fresnel * atmosphereOpacity * sunInfluence;

    gl_FragColor = vec4(color, alpha);
  }
`;
