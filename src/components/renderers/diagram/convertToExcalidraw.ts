import type { DiagramConfig, DiagramElement } from './types'

/**
 * Converts our simplified diagram config into Excalidraw element skeletons
 * that can be passed to convertToExcalidrawElements() from the Excalidraw lib.
 */
export function toExcalidrawSkeletons(elements: DiagramElement[]): any[] {
  const skeletons: any[] = []

  for (const el of elements) {
    switch (el.type) {
      case 'rectangle':
      case 'ellipse':
      case 'diamond': {
        const skeleton: any = {
          type: el.type,
          x: el.x,
          y: el.y,
          width: el.width,
          height: el.height,
          backgroundColor: el.backgroundColor ?? 'transparent',
          fillStyle: el.fillStyle ?? 'solid',
          strokeColor: el.strokeColor ?? '#dee2e6',
          strokeWidth: 2,
          roughness: 1,
          opacity: 100,
        }
        if (el.roundness != null) {
          skeleton.roundness = { type: 3, value: el.roundness }
        }
        if (el.label) {
          skeleton.label = {
            text: el.label,
            fontSize: 16,
            textAlign: 'center',
            verticalAlign: 'middle',
          }
        }
        skeletons.push(skeleton)
        break
      }

      case 'arrow':
      case 'line': {
        const dx = el.endX - el.startX
        const dy = el.endY - el.startY
        const skeleton: any = {
          type: el.type === 'arrow' ? 'arrow' : 'line',
          x: el.startX,
          y: el.startY,
          width: Math.abs(dx),
          height: Math.abs(dy),
          points: [[0, 0], [dx, dy]],
          strokeColor: el.strokeColor ?? '#495057',
          strokeWidth: 2,
          roughness: 1,
          opacity: 100,
          endArrowhead: el.type === 'arrow' ? 'arrow' : null,
          startArrowhead: null,
        }
        if (el.label) {
          skeleton.label = {
            text: el.label,
            fontSize: 14,
          }
        }
        skeletons.push(skeleton)
        break
      }

      case 'text': {
        skeletons.push({
          type: 'text',
          x: el.x,
          y: el.y,
          text: el.text,
          fontSize: el.fontSize ?? 20,
          strokeColor: el.color ?? '#e9ecef',
          strokeWidth: 1,
          roughness: 0,
          opacity: 100,
        })
        break
      }
    }
  }

  return skeletons
}

/**
 * Filters elements by revealOrder up to a given step.
 * Returns indices of elements that should be visible.
 */
export function getVisibleIndices(
  config: DiagramConfig,
  step: number,
): Set<number> {
  if (!config.revealOrder || config.revealOrder.length === 0) {
    return new Set(config.elements.map((_, i) => i))
  }
  return new Set(config.revealOrder.slice(0, step))
}
