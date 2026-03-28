export interface DiagramShapeElement {
  type: 'rectangle' | 'ellipse' | 'diamond'
  x: number
  y: number
  width: number
  height: number
  backgroundColor?: string
  fillStyle?: 'solid' | 'hachure' | 'cross-hatch'
  strokeColor?: string
  label?: string
  roundness?: number
}

export interface DiagramArrowElement {
  type: 'arrow' | 'line'
  startX: number
  startY: number
  endX: number
  endY: number
  strokeColor?: string
  label?: string
}

export interface DiagramTextElement {
  type: 'text'
  x: number
  y: number
  text: string
  fontSize?: number
  color?: string
}

export type DiagramElement =
  | DiagramShapeElement
  | DiagramArrowElement
  | DiagramTextElement

export interface DiagramConfig {
  elements: DiagramElement[]
  revealOrder?: number[]
}
