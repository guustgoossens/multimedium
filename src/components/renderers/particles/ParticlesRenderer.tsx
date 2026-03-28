import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { ParticleSystem } from './ParticleSystem'
import type { ParticlesConfig } from './types'

function applyDefaults(config: Partial<ParticlesConfig>): ParticlesConfig {
  return {
    particleCount: config.particleCount ?? 3000,
    bounds: config.bounds ?? { x: [-10, 10], y: [-10, 10], z: [-10, 10] },
    camera: config.camera ?? { position: [0, 5, 15], lookAt: [0, 0, 0] },
    forces: config.forces ?? [],
    appearance: {
      colorMode: config.appearance?.colorMode ?? 'velocity',
      colorMap: config.appearance?.colorMap ?? ['#3b82f6', '#8b5cf6', '#ef4444'],
      size: config.appearance?.size ?? 0.05,
      opacity: config.appearance?.opacity ?? 0.8,
    },
    physics: {
      damping: config.physics?.damping ?? 0.98,
      maxVelocity: config.physics?.maxVelocity ?? 2.0,
    },
  }
}

export function ParticlesRenderer({ config }: { config: Partial<ParticlesConfig> }) {
  const safeConfig = applyDefaults(config)

  return (
    <div className="glass-card overflow-hidden rounded-2xl" style={{ aspectRatio: '16 / 9' }}>
      <Canvas
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
        dpr={[1, 2]}
      >
        <PerspectiveCamera
          makeDefault
          position={safeConfig.camera.position}
          fov={50}
        />
        <OrbitControls
          target={safeConfig.camera.lookAt}
          enableZoom
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
        />
        <ParticleSystem config={safeConfig} />
      </Canvas>
    </div>
  )
}
