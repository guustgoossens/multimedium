import { useCallback } from 'react'
import { ManimScene } from 'manim-web/react'
import {
  Circle, Square, Rectangle, Line, Arrow, Dot, Text, MathTex,
  FunctionGraph, Axes,
  Create, FadeIn, FadeOut, Transform, Write,
  type Scene, type Mobject,
} from 'manim-web'

// ─── Config Types (matches skills/visual/manim/SKILL.md) ───

interface SceneConfig {
  scenes: SceneDefinition[]
}

interface SceneDefinition {
  id?: string
  title?: string
  objects: ObjectDef[]
  animations: AnimationDef[]
}

interface ObjectDef {
  type: string
  id: string
  [key: string]: any
}

interface AnimationDef {
  type: string
  targetId?: string
  duration?: number
  to?: Record<string, any>
  [key: string]: any
}

// ─── Object Factory ───

function createObject(def: ObjectDef): Mobject | null {
  try {
    switch (def.type) {
      case 'function_graph':
        return new FunctionGraph({
          func: new Function('x', `return ${def.fn}`) as (x: number) => number,
          xRange: def.xRange ?? [-5, 5],
          color: def.color ?? '#3b82f6',
          numSamples: def.numSamples ?? 200,
        })
      case 'circle':
        return new Circle({
          radius: def.radius ?? 1,
          color: def.color ?? '#3b82f6',
          fillOpacity: def.fill ? 0.3 : 0,
          center: def.center ?? [0, 0, 0],
        })
      case 'rectangle':
        return new Rectangle({
          width: def.width ?? 2,
          height: def.height ?? 1,
          color: def.color ?? '#3b82f6',
          fillOpacity: def.fill ? 0.3 : 0,
          center: def.center ?? [0, 0, 0],
        })
      case 'square':
        return new Square({
          sideLength: def.sideLength ?? 2,
          color: def.color ?? '#3b82f6',
          fillOpacity: def.fill ? 0.3 : 0,
          center: def.center ?? [0, 0, 0],
        })
      case 'line':
        return new Line({
          start: def.start ?? [-1, 0, 0],
          end: def.end ?? [1, 0, 0],
          color: def.color ?? '#ffffff',
          strokeWidth: def.strokeWidth ?? 2,
        })
      case 'arrow':
        return new Arrow({
          start: def.start ?? [-1, 0, 0],
          end: def.end ?? [1, 0, 0],
          color: def.color ?? '#ffffff',
        })
      case 'point':
      case 'dot':
        return new Dot({
          radius: def.radius ?? 0.08,
          color: def.color ?? '#ef4444',
          point: def.position ?? [0, 0, 0],
        })
      case 'text': {
        const text = new Text({
          text: def.content ?? def.text ?? '',
          fontSize: def.fontSize ?? 24,
          color: def.color ?? '#ffffff',
        })
        if (def.position) text.moveTo(def.position)
        return text
      }
      case 'latex': {
        const tex = new MathTex({
          latex: def.expression ?? '',
          color: def.color ?? '#ffffff',
        })
        if (def.position) tex.moveTo(def.position)
        return tex
      }
      case 'coordinate_system':
      case 'axes':
        return new Axes({
          xRange: def.xRange ?? [-5, 5, 1],
          yRange: def.yRange ?? [-3, 3, 1],
          color: '#444444',
        })
      default:
        console.warn(`Unknown manim object type: ${def.type}`)
        return null
    }
  } catch (err) {
    console.warn(`Failed to create ${def.type}:`, err)
    return null
  }
}

// ─── Animation Factory ───

function createAnimation(
  def: AnimationDef,
  objects: Map<string, Mobject>
): any | null {
  const target = def.targetId ? objects.get(def.targetId) : null
  if (def.targetId && !target) return null

  const opts = { duration: def.duration ?? 1 }

  try {
    switch (def.type) {
      case 'create':
        return target ? new Create(target, opts) : null
      case 'write':
        return target ? new Write(target as any, opts) : null
      case 'fadeIn':
        return target ? new FadeIn(target, opts) : null
      case 'fadeOut':
        return target ? new FadeOut(target, opts) : null
      case 'transform':
        if (!target || !def.to) return null
        // Build a target object from the 'to' config
        const targetObj = createObject({ ...def.to, type: def.to.type ?? 'circle', id: '_transform_target' })
        return targetObj ? new Transform(target, targetObj, opts) : null
      case 'wait':
        return null // handled as scene.wait()
      default:
        return target ? new FadeIn(target, opts) : null
    }
  } catch {
    return null
  }
}

// ─── Renderer ───

export function ManimRenderer({ config }: { config: SceneConfig }) {
  const sceneDef = config.scenes?.[0]
  if (!sceneDef) {
    return (
      <div className="glass-card p-8 text-center text-gray-500 text-sm font-mono">
        no scene data
      </div>
    )
  }

  const onSceneReady = useCallback(async (scene: Scene) => {
    const objects = new Map<string, Mobject>()

    // Defensive: if the scene has a graph/coordinate system, nudge any
    // text/latex labels out of the plot zone so the LLM can't overlap them.
    const hasPlot = sceneDef.objects.some(
      (o) => o.type === 'function_graph' || o.type === 'coordinate_system' || o.type === 'axes',
    )
    const PLOT_X = 3
    const PLOT_Y = 2
    const SAFE_Y = 3.5
    const nudge = (pos: any): any => {
      if (!Array.isArray(pos) || pos.length < 2) return pos
      const [x, y, z] = pos
      if (Math.abs(x) >= PLOT_X + 1 || Math.abs(y) >= PLOT_Y + 1) return pos
      const newY = y === 0 ? -SAFE_Y : Math.sign(y) * SAFE_Y
      return z != null ? [x, newY, z] : [x, newY]
    }

    // Create all objects
    const MAX_LABEL_WIDTH = 8 // units, ~half of the 16:9 manim canvas width
    for (const def of sceneDef.objects) {
      const safeDef =
        hasPlot && (def.type === 'latex' || def.type === 'text') && def.position
          ? { ...def, position: nudge(def.position) }
          : def
      const obj = createObject(safeDef)
      if (!obj) continue

      // Defensive width clamp: oversized formulas/labels overflow the canvas
      // and overlap whatever else is on screen. Scale them down in place.
      if (def.type === 'latex' || def.type === 'text') {
        try {
          const bbox = (obj as any).getBoundingBox?.()
          if (bbox && bbox.width > MAX_LABEL_WIDTH) {
            const factor = MAX_LABEL_WIDTH / bbox.width
            ;(obj as any).scale?.(factor)
          }
        } catch {
          // ignore — defensive only
        }
      }

      objects.set(def.id, obj)
    }

    // Play animations
    for (const animDef of sceneDef.animations) {
      if (animDef.type === 'wait') {
        await scene.wait(animDef.duration ?? 1)
        continue
      }

      const anim = createAnimation(animDef, objects)
      if (anim) {
        await scene.play(anim)
      }
    }
  }, [sceneDef])

  return (
    <div className="glass-card overflow-hidden manim-scene" data-no-frame-scroll style={{ aspectRatio: '16 / 9' }}>
      <ManimScene
        width={960}
        height={540}
        backgroundColor="#000000"
        backgroundOpacity={0}
        onSceneReady={onSceneReady}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  )
}
