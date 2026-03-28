import { useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending } from 'three'
import type { BufferAttribute, Points } from 'three'
import { computeAcceleration } from './forces'
import { computeParticleColor, parseHexColor } from './colors'
import type { ParticlesConfig } from './types'

export function ParticleSystem({ config }: { config: ParticlesConfig }) {
  const count = Math.min(Math.max(config.particleCount, 1), 10000)
  const pointsRef = useRef<Points>(null)

  // Pre-allocate buffers
  const buffers = useMemo(() => ({
    positions: new Float32Array(count * 3),
    velocities: new Float32Array(count * 3),
    colors: new Float32Array(count * 3),
    ages: new Float32Array(count),
  }), [count])

  // Parse color map once
  const parsedColors = useMemo(
    () => config.appearance.colorMap.map(parseHexColor),
    [config.appearance.colorMap],
  )

  // Initialize particle positions within bounds
  useEffect(() => {
    const { positions, velocities, ages } = buffers
    const { bounds } = config

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      positions[i3] = bounds.x[0] + Math.random() * (bounds.x[1] - bounds.x[0])
      positions[i3 + 1] = bounds.y[0] + Math.random() * (bounds.y[1] - bounds.y[0])
      positions[i3 + 2] = bounds.z[0] + Math.random() * (bounds.z[1] - bounds.z[0])
      velocities[i3] = 0
      velocities[i3 + 1] = 0
      velocities[i3 + 2] = 0
      ages[i] = 0
    }

    // Set initial colors
    const { colors } = buffers
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const [r, g, b] = computeParticleColor(
        positions[i3], positions[i3 + 1], positions[i3 + 2],
        0, 0, 0, 0,
        config.appearance, config.bounds, config.physics.maxVelocity,
        parsedColors,
      )
      colors[i3] = r
      colors[i3 + 1] = g
      colors[i3 + 2] = b
    }

    // Force buffer upload
    const pts = pointsRef.current
    if (pts) {
      const posAttr = pts.geometry.getAttribute('position') as BufferAttribute
      const colAttr = pts.geometry.getAttribute('color') as BufferAttribute
      if (posAttr) posAttr.needsUpdate = true
      if (colAttr) colAttr.needsUpdate = true
    }
  }, [buffers, config, count, parsedColors])

  // Physics + color update loop
  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    const time = state.clock.elapsedTime
    const { positions, velocities, colors, ages } = buffers
    const { forces, physics, appearance, bounds } = config
    const { damping, maxVelocity } = physics
    const isUniform = appearance.colorMode === 'uniform'

    for (let i = 0; i < count; i++) {
      const i3 = i * 3

      // Compute acceleration
      const [ax, ay, az] = computeAcceleration(
        positions[i3], positions[i3 + 1], positions[i3 + 2],
        velocities[i3], velocities[i3 + 1], velocities[i3 + 2],
        forces, time,
      )

      // Euler integration + damping
      velocities[i3] = (velocities[i3] + ax * dt) * damping
      velocities[i3 + 1] = (velocities[i3 + 1] + ay * dt) * damping
      velocities[i3 + 2] = (velocities[i3 + 2] + az * dt) * damping

      // Clamp velocity
      const speed = Math.sqrt(
        velocities[i3] ** 2 + velocities[i3 + 1] ** 2 + velocities[i3 + 2] ** 2,
      )
      if (speed > maxVelocity) {
        const scale = maxVelocity / speed
        velocities[i3] *= scale
        velocities[i3 + 1] *= scale
        velocities[i3 + 2] *= scale
      }

      // Update position
      positions[i3] += velocities[i3] * dt
      positions[i3 + 1] += velocities[i3 + 1] * dt
      positions[i3 + 2] += velocities[i3 + 2] * dt

      // Update age
      ages[i] += dt

      // Update color (skip for uniform — set once)
      if (!isUniform) {
        const [r, g, b] = computeParticleColor(
          positions[i3], positions[i3 + 1], positions[i3 + 2],
          velocities[i3], velocities[i3 + 1], velocities[i3 + 2],
          ages[i],
          appearance, bounds, maxVelocity,
          parsedColors,
        )
        colors[i3] = r
        colors[i3 + 1] = g
        colors[i3 + 2] = b
      }
    }

    // Flag buffers for GPU upload
    const pts = pointsRef.current
    if (pts) {
      const posAttr = pts.geometry.getAttribute('position') as BufferAttribute
      const colAttr = pts.geometry.getAttribute('color') as BufferAttribute
      if (posAttr) posAttr.needsUpdate = true
      if (!isUniform && colAttr) colAttr.needsUpdate = true
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={buffers.positions}
          count={count}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          array={buffers.colors}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        vertexColors
        size={config.appearance.size}
        sizeAttenuation
        transparent
        opacity={config.appearance.opacity}
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  )
}
