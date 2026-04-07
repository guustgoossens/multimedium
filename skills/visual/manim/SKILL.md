---
name: visual/manim
description: 3Blue1Brown-style mathematical animations using manim-web (TypeScript). Renders real-time in browser via Canvas/WebGL.
domains: ["math", "physics", "geometry", "calculus", "linear-algebra"]
---

# Manim Skill — Mathematical Animations

Generate manim-web scene configurations that render as 3Blue1Brown-style animations in the browser.

## Output Format

Call `renderVisual` with skill "manim" and config as a JSON string:

```json
{
  "scenes": [
    {
      "id": "scene_1",
      "title": "Tangent Line Approaches",
      "objects": [
        {
          "type": "function_graph",
          "id": "curve",
          "fn": "Math.pow(x, 2)",
          "xRange": [-3, 3],
          "color": "#3b82f6"
        },
        {
          "type": "line",
          "id": "tangent",
          "start": [-1, 1],
          "end": [1, 3],
          "color": "#ef4444"
        },
        {
          "type": "text",
          "id": "label",
          "content": "f(x) = x²",
          "position": [2, 4],
          "fontSize": 24
        },
        {
          "type": "latex",
          "id": "formula",
          "expression": "\\frac{d}{dx} x^2 = 2x",
          "position": [0, -3.5]
        }
      ],
      "animations": [
        { "type": "create", "targetId": "curve", "duration": 1.5 },
        { "type": "create", "targetId": "tangent", "duration": 1.0 },
        { "type": "fadeIn", "targetId": "label", "duration": 0.5 },
        { "type": "transform", "targetId": "tangent", "to": { "start": [0, 0], "end": [2, 4] }, "duration": 2.0 },
        { "type": "fadeIn", "targetId": "formula", "duration": 1.0 }
      ]
    }
  ]
}
```

## Available Object Types

- `function_graph`: Plot a function. Props: `fn` (JS expression with x), `xRange`, `color`, `strokeWidth`
- `circle`: Props: `center`, `radius`, `color`, `fill`
- `rectangle`: Props: `center`, `width`, `height`, `color`, `fill`
- `line`: Props: `start`, `end`, `color`, `strokeWidth`
- `arrow`: Props: `start`, `end`, `color`
- `text`: Props: `content`, `position`, `fontSize`, `color`
- `latex`: Props: `expression` (LaTeX string), `position`, `fontSize`
- `point`: Props: `position`, `color`, `radius`
- `vector`: Props: `origin`, `direction`, `color`
- `number_line`: Props: `range`, `position`, `tickInterval`
- `coordinate_system`: Props: `xRange`, `yRange`, `axisLabels`

## Available Animation Types

- `create`: Draw the object stroke-by-stroke
- `fadeIn` / `fadeOut`: Opacity transition
- `transform`: Morph object properties (position, shape, color)
- `moveTo`: Animate position change
- `indicate`: Brief highlight/pulse
- `wait`: Pause for `duration` seconds

## Quality Rules

1. Always start with a coordinate system or context-setting object
2. Build complexity gradually — don't show everything at once
3. Use color consistently (blue for primary, red for emphasis, green for results)
4. Include LaTeX for all mathematical expressions
5. Keep individual scenes under 30 seconds of animation
6. Use `wait` animations to let viewers absorb information
7. When a scene contains a `function_graph` or `coordinate_system`, place all `latex` and `text` objects in the margin: `|y| ≥ 3` **or** `|x| ≥ 4`. Treat the inner box `[-3, 3] × [-2, 2]` as the plot zone — never put a label there, it will overlap the curve.
8. Use `coordinate_system` first to anchor the visible bounds (default `xRange: [-5, 5]`, `yRange: [-4, 4]`). Build the plot inside, labels outside.
9. Prefer one formula visible at a time. Before fading in a new `latex` object, `fadeOut` the previous one so they never stack on top of each other.
