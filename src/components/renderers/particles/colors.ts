import type { Appearance, ParticlesConfig } from './types'

type RGB = [number, number, number]

export function parseHexColor(hex: string): RGB {
  const h = hex.replace('#', '')
  return [
    parseInt(h.substring(0, 2), 16) / 255,
    parseInt(h.substring(2, 4), 16) / 255,
    parseInt(h.substring(4, 6), 16) / 255,
  ]
}

export function lerpColorMap(parsedColors: RGB[], t: number): RGB {
  const clamped = Math.max(0, Math.min(1, t))
  if (parsedColors.length === 0) return [1, 1, 1]
  if (parsedColors.length === 1) return parsedColors[0]

  const scaledT = clamped * (parsedColors.length - 1)
  const idx = Math.floor(scaledT)
  const frac = scaledT - idx

  const a = parsedColors[Math.min(idx, parsedColors.length - 1)]
  const b = parsedColors[Math.min(idx + 1, parsedColors.length - 1)]

  return [
    a[0] + (b[0] - a[0]) * frac,
    a[1] + (b[1] - a[1]) * frac,
    a[2] + (b[2] - a[2]) * frac,
  ]
}

export function computeParticleColor(
  px: number, py: number, _pz: number,
  vx: number, vy: number, vz: number,
  age: number,
  appearance: Appearance,
  bounds: ParticlesConfig['bounds'],
  maxVelocity: number,
  parsedColors: RGB[],
): RGB {
  let t: number

  switch (appearance.colorMode) {
    case 'velocity': {
      const speed = Math.sqrt(vx * vx + vy * vy + vz * vz)
      t = Math.min(speed / maxVelocity, 1)
      return lerpColorMap(parsedColors, t)
    }
    case 'position': {
      const rangeX = bounds.x[1] - bounds.x[0]
      t = rangeX > 0 ? (px - bounds.x[0]) / rangeX : 0.5
      return lerpColorMap(parsedColors, t)
    }
    case 'age': {
      // Map age over ~10 seconds
      t = Math.min(age / 10, 1)
      return lerpColorMap(parsedColors, t)
    }
    case 'uniform': {
      return parsedColors[0] ?? [1, 1, 1]
    }
    case 'gradient': {
      const rangeY = bounds.y[1] - bounds.y[0]
      t = rangeY > 0 ? (py - bounds.y[0]) / rangeY : 0.5
      return lerpColorMap(parsedColors, t)
    }
    default:
      return parsedColors[0] ?? [1, 1, 1]
  }
}
