// ─── Config Types (matches skills/visual/particles/SKILL.md) ───

export interface ParticlesConfig {
  particleCount: number
  bounds: { x: [number, number]; y: [number, number]; z: [number, number] }
  camera: { position: [number, number, number]; lookAt: [number, number, number] }
  forces: Force[]
  appearance: Appearance
  physics: PhysicsConfig
}

// ─── Forces ───

export type Force =
  | AttractorForce
  | RepulsorForce
  | VortexForce
  | NoiseForce
  | GravityForce
  | SpringForce
  | BoundaryForce

export interface AttractorForce {
  type: 'attractor'
  position: [number, number, number]
  strength: number
  falloff: 'linear' | 'inverse_square' | 'constant'
}

export interface RepulsorForce {
  type: 'repulsor'
  position: [number, number, number]
  strength: number
  falloff: 'linear' | 'inverse_square' | 'constant'
}

export interface VortexForce {
  type: 'vortex'
  axis: [number, number, number]
  strength: number
  position: [number, number, number]
}

export interface NoiseForce {
  type: 'noise'
  scale: number
  strength: number
  speed: number
}

export interface GravityForce {
  type: 'gravity'
  direction: [number, number, number]
  strength: number
}

export interface SpringForce {
  type: 'spring'
  stiffness: number
  origin: [number, number, number]
}

export interface BoundaryForce {
  type: 'boundary'
  shape: 'sphere' | 'box'
  radius: number
}

// ─── Appearance ───

export interface Appearance {
  colorMode: 'velocity' | 'position' | 'age' | 'uniform' | 'gradient'
  colorMap: string[]
  size: number
  opacity: number
}

// ─── Physics ───

export interface PhysicsConfig {
  damping: number
  maxVelocity: number
}
