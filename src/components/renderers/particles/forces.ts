import { sampleNoise } from './noise'
import type { Force } from './types'

const MIN_DIST = 0.1

function falloffFn(dist: number, falloff: string): number {
  const d = Math.max(dist, MIN_DIST)
  switch (falloff) {
    case 'inverse_square':
      return 1 / (d * d)
    case 'linear':
      return 1 / d
    case 'constant':
      return 1
    default:
      return 1 / (d * d)
  }
}

function applyAttractor(
  px: number, py: number, pz: number,
  force: { position: [number, number, number]; strength: number; falloff: string },
  sign: number,
): [number, number, number] {
  const dx = force.position[0] - px
  const dy = force.position[1] - py
  const dz = force.position[2] - pz
  const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
  if (dist < MIN_DIST) return [0, 0, 0]
  const mag = sign * force.strength * falloffFn(dist, force.falloff)
  const inv = mag / dist
  return [dx * inv, dy * inv, dz * inv]
}

function applyVortex(
  px: number, py: number, pz: number,
  force: { axis: [number, number, number]; strength: number; position: [number, number, number] },
): [number, number, number] {
  const ax = force.axis?.[0] ?? 0
  const ay = force.axis?.[1] ?? 1
  const az = force.axis?.[2] ?? 0
  const dx = force.position[0] - px
  const dy = force.position[1] - py
  const dz = force.position[2] - pz
  // cross(axis, toCenter) = tangential force
  const tx = ay * dz - az * dy
  const ty = az * dx - ax * dz
  const tz = ax * dy - ay * dx
  const len = Math.sqrt(tx * tx + ty * ty + tz * tz)
  if (len < MIN_DIST) return [0, 0, 0]
  const s = force.strength / len
  return [tx * s, ty * s, tz * s]
}

function applyNoise(
  px: number, py: number, pz: number,
  force: { scale: number; strength: number; speed: number },
  time: number,
): [number, number, number] {
  const sc = force.scale
  const sp = force.speed * time
  const s = force.strength
  return [
    sampleNoise(px * sc + sp, py * sc, pz * sc) * s,
    sampleNoise(px * sc, py * sc + sp + 100, pz * sc) * s,
    sampleNoise(px * sc, py * sc, pz * sc + sp + 200) * s,
  ]
}

function applyGravity(
  force: { direction: [number, number, number]; strength: number },
): [number, number, number] {
  const d = force.direction
  return [d[0] * force.strength, d[1] * force.strength, d[2] * force.strength]
}

function applySpring(
  px: number, py: number, pz: number,
  force: { stiffness: number; origin: [number, number, number] },
): [number, number, number] {
  const k = force.stiffness
  return [
    (force.origin[0] - px) * k,
    (force.origin[1] - py) * k,
    (force.origin[2] - pz) * k,
  ]
}

function applyBoundary(
  px: number, py: number, pz: number,
  force: { shape: string; radius: number },
): [number, number, number] {
  const r = force.radius
  const pushStrength = 10

  if (force.shape === 'sphere') {
    const dist = Math.sqrt(px * px + py * py + pz * pz)
    if (dist > r) {
      const over = dist - r
      const s = -pushStrength * over / dist
      return [px * s, py * s, pz * s]
    }
    return [0, 0, 0]
  }

  // box (default)
  let ax = 0, ay = 0, az = 0
  if (px > r) ax = -pushStrength * (px - r)
  else if (px < -r) ax = -pushStrength * (px + r)
  if (py > r) ay = -pushStrength * (py - r)
  else if (py < -r) ay = -pushStrength * (py + r)
  if (pz > r) az = -pushStrength * (pz - r)
  else if (pz < -r) az = -pushStrength * (pz + r)
  return [ax, ay, az]
}

export function computeAcceleration(
  px: number, py: number, pz: number,
  _vx: number, _vy: number, _vz: number,
  forces: Force[],
  time: number,
): [number, number, number] {
  let ax = 0, ay = 0, az = 0

  for (const f of forces) {
    let contrib: [number, number, number]
    switch (f.type) {
      case 'attractor':
        contrib = applyAttractor(px, py, pz, f, 1)
        break
      case 'repulsor':
        contrib = applyAttractor(px, py, pz, f, -1)
        break
      case 'vortex':
        contrib = applyVortex(px, py, pz, f)
        break
      case 'noise':
        contrib = applyNoise(px, py, pz, f, time)
        break
      case 'gravity':
        contrib = applyGravity(f)
        break
      case 'spring':
        contrib = applySpring(px, py, pz, f)
        break
      case 'boundary':
        contrib = applyBoundary(px, py, pz, f)
        break
      default:
        continue
    }
    ax += contrib[0]
    ay += contrib[1]
    az += contrib[2]
  }

  return [ax, ay, az]
}
