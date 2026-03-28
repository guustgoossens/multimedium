import { createFileRoute } from '@tanstack/react-router'
import { ParticlesRenderer } from '../components/renderers/particles'

const TEST_CONFIGS = {
  gravity: {
    particleCount: 3000,
    bounds: { x: [-10, 10], y: [-10, 10], z: [-10, 10] },
    camera: { position: [0, 8, 20] as [number, number, number], lookAt: [0, 0, 0] as [number, number, number] },
    forces: [
      { type: 'attractor' as const, position: [0, 0, 0] as [number, number, number], strength: 5, falloff: 'inverse_square' as const },
      { type: 'boundary' as const, shape: 'sphere' as const, radius: 10 },
    ],
    appearance: {
      colorMode: 'velocity' as const,
      colorMap: ['#3b82f6', '#8b5cf6', '#ef4444'],
      size: 0.06,
      opacity: 0.8,
    },
    physics: { damping: 0.98, maxVelocity: 3 },
  },
  vortex: {
    particleCount: 4000,
    bounds: { x: [-8, 8], y: [-8, 8], z: [-8, 8] },
    camera: { position: [0, 12, 12] as [number, number, number], lookAt: [0, 0, 0] as [number, number, number] },
    forces: [
      { type: 'vortex' as const, axis: [0, 1, 0] as [number, number, number], strength: 3, position: [0, 0, 0] as [number, number, number] },
      { type: 'attractor' as const, position: [0, 0, 0] as [number, number, number], strength: 1.5, falloff: 'linear' as const },
      { type: 'noise' as const, scale: 0.3, strength: 0.8, speed: 0.5 },
      { type: 'boundary' as const, shape: 'sphere' as const, radius: 8 },
    ],
    appearance: {
      colorMode: 'gradient' as const,
      colorMap: ['#06b6d4', '#8b5cf6', '#ec4899'],
      size: 0.04,
      opacity: 0.7,
    },
    physics: { damping: 0.97, maxVelocity: 2.5 },
  },
  wave: {
    particleCount: 5000,
    bounds: { x: [-12, 12], y: [-6, 6], z: [-12, 12] },
    camera: { position: [15, 10, 15] as [number, number, number], lookAt: [0, 0, 0] as [number, number, number] },
    forces: [
      { type: 'noise' as const, scale: 0.2, strength: 2, speed: 0.8 },
      { type: 'gravity' as const, direction: [0, -0.3, 0] as [number, number, number], strength: 1 },
      { type: 'spring' as const, stiffness: 0.1, origin: [0, 0, 0] as [number, number, number] },
      { type: 'boundary' as const, shape: 'box' as const, radius: 12 },
    ],
    appearance: {
      colorMode: 'position' as const,
      colorMap: ['#22c55e', '#3b82f6', '#f59e0b'],
      size: 0.05,
      opacity: 0.75,
    },
    physics: { damping: 0.96, maxVelocity: 2 },
  },
}

export const Route = createFileRoute('/test-particles')({
  component: TestParticles,
})

function TestParticles() {
  return (
    <div className="canvas min-h-screen p-8">
      <div className="max-w-[900px] mx-auto space-y-12">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Particles Skill — Test Page
        </h1>

        {Object.entries(TEST_CONFIGS).map(([name, config]) => (
          <div key={name} className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-300 capitalize">{name}</h2>
            <ParticlesRenderer config={config} />
          </div>
        ))}
      </div>
    </div>
  )
}
