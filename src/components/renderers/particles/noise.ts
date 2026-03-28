import { createNoise3D } from 'simplex-noise'

const noise3D = createNoise3D()

export function sampleNoise(x: number, y: number, z: number): number {
  return noise3D(x, y, z)
}
