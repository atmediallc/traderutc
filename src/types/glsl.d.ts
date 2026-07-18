/**
 * GLSL Shader Module Declaration
 *
 * Allows TypeScript to import .glsl, .vert, and .frag files
 * as raw strings via webpack asset/source loader.
 */

declare module '*.glsl' {
  const value: string;
  export default value;
}

declare module '*.vert' {
  const value: string;
  export default value;
}

declare module '*.frag' {
  const value: string;
  export default value;
}
