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

### Actions (IMPORTANT — use these for navigation)
- `ActionCard`: Clickable option that sends a prompt to the AI. Props: `prompt` (the message to send when clicked), `icon` (emoji), `variant` (default/primary/subtle). The children text is what the user sees.

Example ActionCard usage:
```json
{
  "component": "ActionCard",
  "props": { "prompt": "Quiz me on photosynthesis", "icon": "🧪" },
  "children": "Quiz me on this"
}
```

## Quality Rules

1. Always use a Stack as the root element
2. Use Grid for comparing 2-4 items side by side
3. Keep text minimal — this is supposed to REPLACE text with structure
4. Use Badges and color coding for quick scanning
5. Use Tabs for multiple facets of the same concept
6. Prefer cards over paragraphs for chunked information
7. ALWAYS end explanations with a final renderVisual call containing 3-5 ActionCards as next steps. This is the primary way users navigate — text input is secondary. Include options like: quiz me, go deeper, show example, explain related concept.
8. Headings must be ≤ 60 characters. If the topic title is longer, split it into a short `Heading` plus a `Text` subtitle below.
9. Use `Grid` with `columns: 3` only when each card body is ≤ 80 characters. For longer card bodies use `columns: 2`, or drop the Grid and stack the cards in a `Stack`.
10. Never put multi-line, formula-like, or code-like text inside a Grid cell — use a full-width `Card` inside a `Stack` instead. Long unbroken tokens (e.g. `R̂_n(F)`) will overflow narrow grid cells.
