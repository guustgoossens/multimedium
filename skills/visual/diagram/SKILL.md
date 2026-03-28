---
name: visual/diagram
description: Hand-drawn system diagrams using Excalidraw. Best for concept maps, flowcharts, system architecture, and relationships.
domains: ["systems", "architecture", "concepts", "processes", "relationships"]
---

# Diagram Skill — Excalidraw Visualizations

Generate Excalidraw element arrays for system diagrams, concept maps, and flowcharts.

## Output Format

Call `renderVisual` with skill "diagram" and config as a JSON string:

```json
{
  "elements": [
    {
      "type": "rectangle",
      "x": 100,
      "y": 100,
      "width": 200,
      "height": 80,
      "backgroundColor": "#a5d8ff",
      "fillStyle": "solid",
      "strokeColor": "#1971c2",
      "label": "Input Layer"
    },
    {
      "type": "rectangle",
      "x": 100,
      "y": 250,
      "width": 200,
      "height": 80,
      "backgroundColor": "#b2f2bb",
      "fillStyle": "solid",
      "strokeColor": "#2f9e44",
      "label": "Processing"
    },
    {
      "type": "arrow",
      "startX": 200,
      "startY": 180,
      "endX": 200,
      "endY": 250,
      "strokeColor": "#495057",
      "label": "data flow"
    },
    {
      "type": "text",
      "x": 50,
      "y": 30,
      "text": "System Architecture",
      "fontSize": 28
    }
  ],
  "revealOrder": [0, 3, 1, 2]
}
```

## Available Element Types

- `rectangle`: Box/card. Props: `x`, `y`, `width`, `height`, `backgroundColor`, `fillStyle`, `strokeColor`, `label`, `roundness`
- `ellipse`: Circle/oval. Props: `x`, `y`, `width`, `height`, `backgroundColor`, `strokeColor`, `label`
- `diamond`: Decision/condition. Props: same as rectangle
- `arrow`: Connecting arrow. Props: `startX`, `startY`, `endX`, `endY`, `strokeColor`, `label`
- `line`: Non-directional connector. Props: same as arrow
- `text`: Free text. Props: `x`, `y`, `text`, `fontSize`, `color`

## Color Palette

Use these consistently:
- Blue (#a5d8ff / #1971c2): Primary concepts, inputs
- Green (#b2f2bb / #2f9e44): Positive outcomes, processing
- Red (#ffc9c9 / #c92a2a): Warnings, errors, constraints
- Yellow (#fff3bf / #e67700): Highlights, decisions
- Gray (#dee2e6 / #495057): Neutral, connectors

## Quality Rules

1. Use `revealOrder` to control progressive reveal (element indices in display order)
2. Keep diagrams clean — max 8-12 elements per view
3. Maintain consistent spacing (100px gaps between rows/columns)
4. Always add a title text element
5. Use arrows to show relationships and flow direction
6. Group related elements spatially
