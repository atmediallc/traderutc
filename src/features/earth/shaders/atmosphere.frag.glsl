// Atmosphere Fragment Shader
//
// Renders a Fresnel-based atmospheric glow around the Earth.
// The effect is strongest at the edges (limb) and transparent
// at the center, creating a realistic scattering halo.
//
// Rendered on a slightly larger sphere with BackSide culling.

precision highp float;

uniform vec3 atmosphereColor;
uniform float fresnelPower;
uniform float atmosphereOpacity;
uniform float atmosphereIntensity;
uniform vec3 sunDirection;

varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  // View direction (from surface to camera)
  vec3 viewDir = normalize(-vPosition);

  // Fresnel effect: stronger glow at edges
  float fresnel = 1.0 - dot(viewDir, vNormal);
  fresnel = pow(fresnel, fresnelPower);

  // Sun-facing side gets brighter atmosphere
  float sunFacing = max(dot(vNormal, sunDirection), 0.0);
  float sunInfluence = 0.5 + 0.5 * sunFacing;

  // Atmosphere color with sun influence
  // Slightly warm on the sun-facing side
  vec3 warmColor = mix(atmosphereColor, vec3(0.6, 0.5, 0.3), sunFacing * 0.2);
  vec3 color = warmColor * atmosphereIntensity * sunInfluence;

  // Final alpha from Fresnel
  float alpha = fresnel * atmosphereOpacity * sunInfluence;

  gl_FragColor = vec4(color, alpha);
}
