import { createFileRoute } from '@tanstack/react-router'
import { DiagramRenderer } from '../components/renderers/diagram'
import type { DiagramConfig } from '../components/renderers/diagram'

const TEST_CONFIGS: Record<string, DiagramConfig> = {
  flowchart: {
    elements: [
      {
        type: 'text',
        x: 120,
        y: 20,
        text: 'Data Pipeline',
        fontSize: 28,
      },
      {
        type: 'rectangle',
        x: 100,
        y: 80,
        width: 200,
        height: 70,
        backgroundColor: '#a5d8ff',
        fillStyle: 'solid',
        strokeColor: '#1971c2',
        label: 'Input',
      },
      {
        type: 'arrow',
        startX: 200,
        startY: 150,
        endX: 200,
        endY: 200,
        strokeColor: '#495057',
      },
      {
        type: 'rectangle',
        x: 100,
        y: 200,
        width: 200,
        height: 70,
        backgroundColor: '#b2f2bb',
        fillStyle: 'solid',
        strokeColor: '#2f9e44',
        label: 'Processing',
      },
      {
        type: 'arrow',
        startX: 200,
        startY: 270,
        endX: 200,
        endY: 320,
        strokeColor: '#495057',
      },
      {
        type: 'rectangle',
        x: 100,
        y: 320,
        width: 200,
        height: 70,
        backgroundColor: '#fff3bf',
        fillStyle: 'solid',
        strokeColor: '#e67700',
        label: 'Output',
      },
    ],
    revealOrder: [0, 1, 2, 3, 4, 5],
  },

  conceptMap: {
    elements: [
      {
        type: 'text',
        x: 180,
        y: 10,
        text: 'Machine Learning',
        fontSize: 28,
      },
      {
        type: 'ellipse',
        x: 200,
        y: 80,
        width: 180,
        height: 80,
        backgroundColor: '#a5d8ff',
        fillStyle: 'solid',
        strokeColor: '#1971c2',
        label: 'ML Model',
      },
      // Top-left: Training Data
      {
        type: 'rectangle',
        x: 0,
        y: 220,
        width: 160,
        height: 60,
        backgroundColor: '#b2f2bb',
        fillStyle: 'solid',
        strokeColor: '#2f9e44',
        label: 'Training Data',
      },
      // Top-right: Features
      {
        type: 'rectangle',
        x: 420,
        y: 220,
        width: 160,
        height: 60,
        backgroundColor: '#fff3bf',
        fillStyle: 'solid',
        strokeColor: '#e67700',
        label: 'Features',
      },
      // Bottom-left: Evaluation
      {
        type: 'rectangle',
        x: 0,
        y: 340,
        width: 160,
        height: 60,
        backgroundColor: '#ffc9c9',
        fillStyle: 'solid',
        strokeColor: '#c92a2a',
        label: 'Evaluation',
      },
      // Bottom-right: Prediction
      {
        type: 'rectangle',
        x: 420,
        y: 340,
        width: 160,
        height: 60,
        backgroundColor: '#dee2e6',
        fillStyle: 'solid',
        strokeColor: '#495057',
        label: 'Prediction',
      },
      // Arrows from center to nodes
      { type: 'arrow', startX: 240, startY: 160, endX: 80, endY: 220, strokeColor: '#495057', label: 'needs' },
      { type: 'arrow', startX: 340, startY: 160, endX: 500, endY: 220, strokeColor: '#495057', label: 'extracts' },
      { type: 'arrow', startX: 240, startY: 160, endX: 80, endY: 340, strokeColor: '#495057', label: 'tested by' },
      { type: 'arrow', startX: 340, startY: 160, endX: 500, endY: 340, strokeColor: '#495057', label: 'produces' },
    ],
  },

  decisionTree: {
    elements: [
      {
        type: 'text',
        x: 160,
        y: 10,
        text: 'Should I Use a Database?',
        fontSize: 24,
      },
      // Root decision
      {
        type: 'diamond',
        x: 175,
        y: 70,
        width: 180,
        height: 100,
        backgroundColor: '#fff3bf',
        fillStyle: 'solid',
        strokeColor: '#e67700',
        label: 'Need persistence?',
      },
      // Left: No
      {
        type: 'rectangle',
        x: 0,
        y: 250,
        width: 150,
        height: 60,
        backgroundColor: '#ffc9c9',
        fillStyle: 'solid',
        strokeColor: '#c92a2a',
        label: 'Use in-memory',
      },
      // Right: Yes -> another decision
      {
        type: 'diamond',
        x: 380,
        y: 220,
        width: 180,
        height: 100,
        backgroundColor: '#fff3bf',
        fillStyle: 'solid',
        strokeColor: '#e67700',
        label: 'Relational data?',
      },
      // Right-Left: No
      {
        type: 'rectangle',
        x: 300,
        y: 380,
        width: 140,
        height: 60,
        backgroundColor: '#b2f2bb',
        fillStyle: 'solid',
        strokeColor: '#2f9e44',
        label: 'Use NoSQL',
      },
      // Right-Right: Yes
      {
        type: 'rectangle',
        x: 500,
        y: 380,
        width: 140,
        height: 60,
        backgroundColor: '#a5d8ff',
        fillStyle: 'solid',
        strokeColor: '#1971c2',
        label: 'Use SQL',
      },
      // Arrows
      { type: 'arrow', startX: 220, startY: 170, endX: 75, endY: 250, strokeColor: '#c92a2a', label: 'No' },
      { type: 'arrow', startX: 355, startY: 120, endX: 470, endY: 220, strokeColor: '#2f9e44', label: 'Yes' },
      { type: 'arrow', startX: 430, startY: 320, endX: 370, endY: 380, strokeColor: '#c92a2a', label: 'No' },
      { type: 'arrow', startX: 510, startY: 320, endX: 570, endY: 380, strokeColor: '#2f9e44', label: 'Yes' },
    ],
    revealOrder: [0, 1, 6, 2, 7, 3, 8, 4, 9, 5],
  },
}

export const Route = createFileRoute('/test-diagram')({
  component: TestDiagram,
})

function TestDiagram() {
  return (
    <div className="canvas min-h-screen p-8">
      <div className="max-w-[900px] mx-auto space-y-12">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Diagram Skill — Test Page
        </h1>

        {Object.entries(TEST_CONFIGS).map(([name, config]) => (
          <div key={name} className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-300 capitalize">
              {name.replace(/([A-Z])/g, ' $1').trim()}
            </h2>
            <DiagramRenderer config={config} />
          </div>
        ))}
      </div>
    </div>
  )
}
