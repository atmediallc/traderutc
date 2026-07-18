/**
 * Earth Shaders
 *
 * GLSL shaders inlined as TypeScript template literals.
 * This avoids the need for custom webpack/turbopack loaders.
 */

export const earthVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
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
  uniform sampler2D normalTexture;
  uniform sampler2D roughnessTexture;
  uniform sampler2D ambientOcclusionTexture;
  uniform sampler2D cloudTexture;

  uniform vec3 sunDirection;
  uniform float ambientIntensity;
  uniform float bumpStrength;
  uniform float specularStrength;
  uniform float nightIntensity;
  uniform float terminatorWidth;
  uniform float goldenHourIntensity;
  uniform float oceanFresnelPower;
  uniform float oceanSpecularPower;
  uniform float iceReflectance;
  uniform float cityBloomStrength;
  uniform float auroraStrength;
  uniform float lightningStrength;
  uniform float cloudShadowStrength;
  uniform float time;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;

  float saturate(float value) {
    return clamp(value, 0.0, 1.0);
  }

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  vec3 perturbNormal(vec3 normal, vec2 uv) {
    float texelSize = 1.0 / 2048.0;
    float heightL = texture2D(bumpTexture, uv - vec2(texelSize, 0.0)).r;
    float heightR = texture2D(bumpTexture, uv + vec2(texelSize, 0.0)).r;
    float heightD = texture2D(bumpTexture, uv - vec2(0.0, texelSize)).r;
    float heightU = texture2D(bumpTexture, uv + vec2(0.0, texelSize)).r;
    vec3 mapNormal = texture2D(normalTexture, uv).rgb * 2.0 - 1.0;

    vec3 relief = vec3(
      (heightL - heightR) * bumpStrength,
      (heightD - heightU) * bumpStrength,
      0.0
    );

    return normalize(normal + relief + mapNormal * 0.045);
  }

  void main() {
    vec4 dayColor = texture2D(dayTexture, vUv);
    vec4 nightColor = texture2D(nightTexture, vUv);
    float oceanMask = texture2D(specularTexture, vUv).r;
    float roughness = 1.0 - texture2D(roughnessTexture, vUv).r * 0.82;
    float ao = mix(0.76, 1.0, texture2D(ambientOcclusionTexture, vUv).r);
    float cloudCoverage = texture2D(cloudTexture, vUv + vec2(time * 0.0012, 0.0)).r;

    vec3 normal = perturbNormal(vWorldNormal, vUv);
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    vec3 lightDir = normalize(sunDirection);
    float dotNL = dot(normal, lightDir);
    float dayFactor = smoothstep(-terminatorWidth, terminatorWidth, dotNL);
    float nightFactor = 1.0 - dayFactor;

    float diffuse = max(dotNL, 0.0);
    float polarIce = smoothstep(0.63, 0.9, abs(vWorldNormal.y)) * smoothstep(0.48, 0.9, dayColor.b);
    vec3 terrain = mix(dayColor.rgb, vec3(0.88, 0.94, 1.0), polarIce * iceReflectance);

    float goldenFactor = smoothstep(-terminatorWidth * 0.45, terminatorWidth * 1.5, dotNL)
                       - smoothstep(terminatorWidth * 0.55, terminatorWidth * 2.4, dotNL);
    vec3 sunsetTint = vec3(1.0, 0.48, 0.19) * goldenFactor * goldenHourIntensity;

    vec3 halfDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(normal, halfDir), 0.0), oceanSpecularPower * max(roughness, 0.18));
    float fresnel = pow(1.0 - saturate(dot(viewDir, normal)), oceanFresnelPower);
    vec3 oceanReflection = vec3(0.46, 0.72, 1.0) * fresnel * oceanMask * 0.42;
    vec3 oceanSpecular = vec3(1.0, 0.94, 0.78) * spec * oceanMask * specularStrength * dayFactor;

    float cloudShadow = smoothstep(0.45, 0.78, cloudCoverage) * dayFactor * cloudShadowStrength;
    vec3 dayLit = terrain * (ambientIntensity + diffuse * (1.0 - cloudShadow)) * ao;
    dayLit += sunsetTint * terrain;
    dayLit += oceanReflection + oceanSpecular;

    float cityMask = max(max(nightColor.r, nightColor.g), nightColor.b);
    vec3 cityLights = nightColor.rgb * nightIntensity * cityBloomStrength * smoothstep(0.12, 0.78, nightFactor);
    float lightningNoise = step(0.9975, hash(vUv * vec2(320.0, 170.0) + floor(time * 1.8))) * smoothstep(0.35, 0.85, cloudCoverage);
    vec3 lightning = vec3(0.55, 0.75, 1.0) * lightningNoise * lightningStrength * nightFactor;
    float auroraBand = smoothstep(0.56, 0.78, abs(vWorldNormal.y)) * smoothstep(0.16, 0.72, nightFactor);
    vec3 aurora = mix(vec3(0.0, 0.75, 0.46), vec3(0.38, 0.22, 0.9), hash(vUv * 12.0)) * auroraBand * auroraStrength;
    vec3 moonFill = terrain * vec3(0.12, 0.16, 0.24) * nightFactor * (1.0 - cityMask);

    float twilightFactor = smoothstep(-terminatorWidth * 2.0, -terminatorWidth * 0.35, dotNL)
                         - smoothstep(-terminatorWidth * 0.25, terminatorWidth * 0.9, dotNL);
    vec3 twilight = vec3(0.11, 0.16, 0.34) * twilightFactor;

    vec3 finalColor = mix(cityLights + moonFill + aurora + lightning + twilight, dayLit, dayFactor);
    finalColor += dayColor.rgb * ambientIntensity * 0.08;

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export const atmosphereVertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vWorldNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
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
  uniform float rayleighStrength;
  uniform float mieStrength;
  uniform float horizonGlow;
  uniform float sunsetStrength;
  uniform vec3 sunDirection;

  varying vec3 vNormal;
  varying vec3 vWorldNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;

  float saturate(float value) {
    return clamp(value, 0.0, 1.0);
  }

  void main() {
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    vec3 lightDir = normalize(sunDirection);
    float viewDot = saturate(dot(viewDir, vWorldNormal));
    float sunDot = dot(vWorldNormal, lightDir);
    float limb = pow(1.0 - viewDot, fresnelPower);
    float horizon = pow(1.0 - abs(sunDot), 2.4) * horizonGlow;

    float rayleighPhase = 0.75 * (1.0 + pow(dot(viewDir, lightDir), 2.0));
    float miePhase = pow(saturate(dot(viewDir, lightDir)), 8.0);
    vec3 rayleigh = atmosphereColor * rayleighPhase * rayleighStrength;
    vec3 mie = vec3(1.0, 0.62, 0.28) * miePhase * mieStrength;
    vec3 sunset = vec3(1.0, 0.36, 0.13) * horizon * sunsetStrength;
    vec3 highAltitude = vec3(0.18, 0.42, 1.0) * pow(limb, 1.4);

    float daylight = smoothstep(-0.32, 0.18, sunDot);
    vec3 color = (rayleigh + mie + sunset + highAltitude) * atmosphereIntensity * mix(0.42, 1.0, daylight);
    float alpha = limb * atmosphereOpacity * mix(0.45, 1.0, daylight) + horizon * 0.055;

    gl_FragColor = vec4(color, saturate(alpha));
  }
`;
