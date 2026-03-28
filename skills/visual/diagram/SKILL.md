---
name: visual/diagram
description: System diagrams using Excalidraw. Best for concept maps, flowcharts, system architecture, and relationships.
domains: ["systems", "architecture", "concepts", "processes", "relationships"]
---

# Diagram Skill — Excalidraw

Generate an array of valid Excalidraw elements. The frontend passes them directly to the Excalidraw component — no conversion.

## Output Format

Call `renderVisual` with skill "diagram" and config as a JSON string containing an `elements` array:

```json
{
  "elements": [
    {
      "id": "rect1",
      "type": "rectangle",
      "x": 100,
      "y": 100,
      "width": 200,
      "height": 80,
      "strokeColor": "#1971c2",
      "backgroundColor": "#a5d8ff",
      "fillStyle": "solid",
      "strokeWidth": 2,
      "roughness": 1,
      "opacity": 100,
      "angle": 0,
      "seed": 1,
      "version": 1,
      "versionNonce": 1,
      "isDeleted": false,
      "groupIds": [],
      "boundElements": [{"id": "text1", "type": "text"}],
      "roundness": {"type": 3}
    },
    {
      "id": "text1",
      "type": "text",
      "x": 140,
      "y": 130,
      "width": 120,
      "height": 20,
      "text": "Input Layer",
      "fontSize": 16,
      "fontFamily": 1,
      "textAlign": "center",
      "verticalAlign": "middle",
      "strokeColor": "#ffffff",
      "backgroundColor": "transparent",
      "fillStyle": "solid",
      "strokeWidth": 1,
      "roughness": 0,
      "opacity": 100,
      "angle": 0,
      "seed": 2,
      "version": 1,
      "versionNonce": 2,
      "isDeleted": false,
      "groupIds": [],
      "containerId": "rect1"
    },
    {
      "id": "arrow1",
      "type": "arrow",
      "x": 200,
      "y": 180,
      "width": 0,
      "height": 70,
      "points": [[0, 0], [0, 70]],
      "strokeColor": "#495057",
      "backgroundColor": "transparent",
      "fillStyle": "solid",
      "strokeWidth": 2,
      "roughness": 1,
      "opacity": 100,
      "angle": 0,
      "seed": 3,
      "version": 1,
      "versionNonce": 3,
      "isDeleted": false,
      "groupIds": [],
      "startArrowhead": null,
      "endArrowhead": "arrow"
    }
  ]
}
```

## Required Fields on Every Element

Every element MUST have these fields:
- `id`: unique string
- `type`: "rectangle" | "ellipse" | "diamond" | "arrow" | "line" | "text"
- `x`, `y`: position (number)
- `width`, `height`: size (number)
- `strokeColor`: CSS color string
- `backgroundColor`: CSS color or "transparent"
- `fillStyle`: "solid" | "hachure" | "cross-hatch"
- `strokeWidth`: number (1-4)
- `roughness`: 0 (clean) or 1 (hand-drawn)
- `opacity`: 100
- `angle`: 0
- `seed`: any integer (used for hand-drawn randomness)
- `version`: 1
- `versionNonce`: any integer
- `isDeleted`: false
- `groupIds`: []

## Element-Specific Fields

**rectangle / ellipse / diamond:**
- `roundness`: `{"type": 3}` for rounded corners, or omit
- `boundElements`: array of `{"id": "textId", "type": "text"}` if containing text

**text:**
- `text`: the string content
- `fontSize`: number (14-28)
- `fontFamily`: 1 (hand-drawn) or 2 (normal) or 3 (mono)
- `textAlign`: "left" | "center" | "right"
- `verticalAlign`: "top" | "middle"
- `containerId`: id of parent shape (if bound inside a shape)

**arrow / line:**
- `points`: array of [x, y] offsets from the element's x,y (e.g., `[[0,0], [0, 100]]` for vertical)
- `startArrowhead`: null
- `endArrowhead`: "arrow" | null

## Color Palette

- Blue: `#a5d8ff` bg / `#1971c2` stroke
- Green: `#b2f2bb` bg / `#2f9e44` stroke
- Red: `#ffc9c9` bg / `#c92a2a` stroke
- Yellow: `#fff3bf` bg / `#e67700` stroke
- Gray: `#dee2e6` bg / `#495057` stroke
- White text: `#ffffff`
- Muted text: `#888888`

## Tips

- To label a shape: create the shape with `boundElements` referencing a text element, then create the text element with `containerId` pointing back. Center the text inside the shape.
- For arrows between shapes: position the arrow's x,y at the start point, use `points` to define the path.
- Keep diagrams clean — max 15-20 elements total (shapes + text + arrows).
- Use consistent spacing: 120px vertical gaps, 250px horizontal gaps.
- Always include a title as a large text element (fontSize 24-28) at the top.
