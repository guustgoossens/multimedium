---
name: visual/particles
description: 3D particle simulations using React Three Fiber. Best for physics forces, wave mechanics, field visualizations, and molecular behavior.
domains: ["physics", "simulation", "forces", "waves", "fields", "molecular"]
---

# Particles Skill — 3D Particle Simulations

Generate particle simulation configs that render as real-time 3D visualizations using React Three Fiber.

## Output Format

Call `renderVisual` with skill "particles" and config as a JSON string:

```json
{
  "particleCount": 5000,
  "bounds": { "x": [-10, 10], "y": [-10, 10], "z": [-10, 10] },
  "camera": { "position": [0, 5, 15], "lookAt": [0, 0, 0] },
  "forces": [
    {
      "type": "attractor",
      "position": [0, 0, 0],
      "strength": 5.0,
      "falloff": "inverse_square"
    },
    {
      "type": "noise",
      "scale": 0.5,
      "strength": 1.0
    }
  ],
  "appearance": {
    "colorMode": "velocity",
    "colorMap": ["#3b82f6", "#8b5cf6", "#ef4444"],
    "size": 0.05,
    "opacity": 0.8
  },
  "physics": {
    "damping": 0.98,
    "maxVelocity": 2.0
  }
}
```

## Force Types

- `attractor`: Pull toward point. Props: `position`, `strength`, `falloff` (linear/inverse_square/constant)
- `repulsor`: Push away from point. Same props as attractor
- `vortex`: Spiral around axis. Props: `axis` ([0,1,0]), `strength`, `position`
- `noise`: Perlin noise field. Props: `scale`, `strength`, `speed`
- `gravity`: Uniform direction. Props: `direction` ([0,-1,0]), `strength`
- `spring`: Attract to origin. Props: `stiffness`, `origin`
- `boundary`: Keep particles in bounds. Props: `shape` (sphere/box), `radius`

## Color Modes

- `velocity`: Color by speed (slow→fast maps to colorMap)
- `position`: Color by spatial position
- `age`: Color by particle lifetime
- `uniform`: Single color for all particles
- `gradient`: Gradient based on Y position

## Quality Rules

1. Start with 2000-5000 particles (balance visual impact vs. performance)
2. Always include a boundary force to keep particles in view
3. Use velocity-based coloring by default — it's the most informative
4. Include damping (0.95-0.99) to prevent chaos
5. Set camera position to show the most interesting angle
6. For gravity simulations, use fewer particles (1000-2000) with larger size
