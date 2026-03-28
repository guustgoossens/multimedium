---
name: visual/ui
description: Interactive UI components via json-render. Best for data display, comparisons, quizzes, and structured exploration.
domains: ["data", "comparison", "quiz", "exploration", "interactive"]
---

# UI Skill — Interactive Components

Generate json-render component trees for interactive, structured visual content.

## Output Format

Call `renderVisual` with skill "ui" and config as a JSON string:

```json
{
  "component": "Stack",
  "props": { "gap": 4 },
  "children": [
    {
      "component": "Heading",
      "props": { "level": 2 },
      "children": "Newton's Laws of Motion"
    },
    {
      "component": "Grid",
      "props": { "columns": 3, "gap": 4 },
      "children": [
        {
          "component": "Card",
          "props": { "variant": "outlined" },
          "children": [
            { "component": "Heading", "props": { "level": 3 }, "children": "1st Law" },
            { "component": "Text", "children": "An object at rest stays at rest" },
            { "component": "Badge", "props": { "variant": "blue" }, "children": "Inertia" }
          ]
        },
        {
          "component": "Card",
          "props": { "variant": "outlined" },
          "children": [
            { "component": "Heading", "props": { "level": 3 }, "children": "2nd Law" },
            { "component": "Text", "children": "F = ma" },
            { "component": "Badge", "props": { "variant": "green" }, "children": "Force" }
          ]
        },
        {
          "component": "Card",
          "props": { "variant": "outlined" },
          "children": [
            { "component": "Heading", "props": { "level": 3 }, "children": "3rd Law" },
            { "component": "Text", "children": "Every action has an equal and opposite reaction" },
            { "component": "Badge", "props": { "variant": "red" }, "children": "Pairs" }
          ]
        }
      ]
    }
  ]
}
```

## Available Components

### Layout
- `Stack`: Vertical stack. Props: `gap`, `align`
- `Grid`: Grid layout. Props: `columns`, `gap`
- `Flex`: Flexbox. Props: `direction`, `gap`, `justify`, `align`

### Content
- `Heading`: h1-h6. Props: `level`
- `Text`: Paragraph text. Props: `size`, `color`, `weight`
- `Badge`: Small label. Props: `variant` (blue/green/red/yellow/gray)
- `Code`: Code block. Props: `language`

### Data
- `Card`: Container with border. Props: `variant` (outlined/filled/elevated)
- `Table`: Data table. Props: `headers` (string[]), `rows` (string[][])
- `List`: Bullet/number list. Props: `ordered`, `items` (string[])
- `Progress`: Progress bar. Props: `value` (0-100), `label`

### Interactive
- `Tabs`: Tabbed content. Props: `tabs` (array of {label, content})
- `Accordion`: Expandable sections. Props: `items` (array of {title, content})
- `Alert`: Info/warning/error box. Props: `variant`, `title`, `message`

## Quality Rules

1. Always use a Stack as the root element
2. Use Grid for comparing 2-4 items side by side
3. Keep text minimal — this is supposed to REPLACE text with structure
4. Use Badges and color coding for quick scanning
5. Use Tabs for multiple facets of the same concept
6. Prefer cards over paragraphs for chunked information
