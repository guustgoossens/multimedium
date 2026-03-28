# PRD: Visual Learning AI — NullHack

## Vision

An AI-powered learning tool that replaces text-heavy explanations with rich, real-time visual content. The AI reasons about concepts and chooses the best visual medium to explain them — math animations, particle simulations, system diagrams, or interactive UI components — narrated by voice instead of walls of text.

**Core principle**: Eliminate text. Think in systems. Show, don't tell.

## Stack

| Layer | Technology |
|---|---|
| Framework | TanStack Start (RC) |
| Database / Backend | Convex |
| Auth | WorkOS AuthKit |
| AI Reasoning | Claude API (Anthropic) |
| Voice Output | ElevenLabs TTS |
| Voice Input (stretch) | Voxtral (Mistral) for speech-to-text |
| Package Manager | bun |

## Convex Components

### Must-Have

| Component | Package | Purpose |
|---|---|---|
| **Agent** | `@convex-dev/agent` | Core AI layer — Claude threads, websocket streaming, tool calls (triggers visual skills), RAG integration, usage tracking. Replaces custom Claude API code |
| **WorkOS AuthKit** | `@convex-dev/workos-authkit` | Webhook sync + auth state for WorkOS |
| **Workflow** | `@convex-dev/workflow` | Durable multi-step pipeline: Claude reasons → generate visual → ElevenLabs narration → assemble. Retries, real-time progress |
| **Rate Limiter** | `@convex-dev/rate-limiter` | Throttle Claude/ElevenLabs calls per user. Integrates with Agent |

### Should-Have

| Component | Package | Purpose |
|---|---|---|
| **RAG** | `@convex-dev/rag` | Semantic search over learning content for Claude context. Native Agent integration |
| **R2** | `@convex-dev/r2` | Store generated audio, exported animations, diagram SVGs |
| **Action Cache** | `@convex-dev/action-cache` | Cache Claude responses for repeated topics — saves API cost |
| **Helpers** | `convex-helpers` | Middleware, Zod validation, session helpers |

### Nice-to-Have (Phase 3)

| Component | Package | Purpose |
|---|---|---|
| **Workpool** | `@convex-dev/workpool` | Separate pools for rendering vs API calls |
| **Aggregate** | `@convex-dev/aggregate` | Learning analytics |
| **Persistent Streaming** | `@convex-dev/persistent-text-streaming` | Non-agent streaming scenarios |

## Architecture: Skills System

The AI has access to **visual skills** — each skill is a self-contained module that knows how to render a specific type of visualization. The AI picks the right skill (or combines multiple) based on the concept being explained.

### Skills

| Skill | Library | Renders | Best For |
|---|---|---|---|
| `manim` | `manim-web` | Canvas/WebGL animations | Math, physics, step-by-step proofs, transformations |
| `particles` | `particle-architect` (React Three Fiber) | 3D particle simulations | Physics forces, wave mechanics, field visualizations |
| `diagram` | `@excalidraw/excalidraw` | Hand-drawn diagrams | System thinking, concept maps, flowcharts, architecture |
| `ui` | `@json-render/react` + shadcn | Interactive components | Data display, comparisons, quizzes, interactive exploration |
| `voice` | ElevenLabs TTS | Audio narration | Layered on any visual — explains what's being shown |

### How Skills Work

1. User asks a question (text or voice)
2. Claude API receives the question + a **skill manifest** (describes available skills and when to use each)
3. Claude decides which skill(s) to use and generates structured output:
   - For `manim`: a scene description (TypeScript function body)
   - For `particles`: particle behavior config (position/color/physics functions)
   - For `diagram`: Excalidraw element JSON or Mermaid syntax
   - For `ui`: JSON matching the `@json-render` component catalog
   - For `voice`: narration text sent to ElevenLabs
4. Frontend receives the structured output and renders it in the appropriate component
5. Multiple skills can run **in parallel** (e.g., diagram + voice narration)

### Progressive Disclosure

Skills are not all loaded at once. The Claude system prompt starts minimal. When a topic is detected (e.g., "explain derivatives"), the relevant skill definitions are injected into the conversation context — similar to how Claude Code loads skill files on demand.

This keeps token usage low and responses fast.

## Shared Primitives

All visual skills render inside a common **VisualFrame** component:

```
┌─────────────────────────────────────────┐
│  VisualFrame                            │
│  ┌───────────────────────────────────┐  │
│  │                                   │  │
│  │     [Skill renders here]          │  │
│  │                                   │  │
│  └───────────────────────────────────┘  │
│  🔊 Voice playing... ━━━━━━━━━━━━━━━━  │
│  ← prev  step 2/5  next →              │
└─────────────────────────────────────────┘
```

- Consistent container with step navigation
- Voice playback bar
- Skills don't know about each other — they just render inside the frame
- The frame handles sequencing (step 1: show diagram, step 2: animate, etc.)

## Data Model (Convex)

```
# Managed by @convex-dev/agent (don't define manually):
agent_threads  — conversation threads with full message history
agent_messages — user + assistant messages, tool calls, streaming state

# Custom tables:
users          — WorkOS auth, preferences, learning history
explanations   — generated visual content (skill type, config JSON, narration)
                 linked to agent thread/message
```

## MVP Scope (Hackathon)

### Phase 1: Parallel Skill Development (NOW)

Three workstreams running simultaneously:

**Person A (Guust): Core Setup**
- TanStack Start project scaffold
- Convex setup + schema
- WorkOS auth
- Claude API integration (skill router)
- VisualFrame component
- ElevenLabs voice integration

**Person B: Manim Skill**
- `manim-web` React integration
- Skill definition file (what Claude needs to know to generate scenes)
- 3-5 example scenes (derivatives, sine waves, matrix transforms, etc.)
- Test: Claude prompt → manim scene → renders in browser

**Person C: Diagram + UI Skills**
- `@excalidraw/excalidraw` integration
- `@json-render/react` setup with component catalog (Zod schemas)
- Skill definitions for both
- Test: Claude prompt → Excalidraw JSON → renders / Claude prompt → UI JSON → renders

**Person D (whoever has bandwidth): Particles Skill**
- `particle-architect` extraction into reusable component
- Skill definition file
- Test: Claude prompt → particle config → renders

> Note: With 3 people, suggest Person B does Manim, Person C does Diagram + UI, and Person D (particles) gets picked up by whoever finishes first OR is Phase 2.

### Phase 2: Integration

- Merge all skills into the main app
- Wire up the Claude skill router (picks skill based on topic)
- Add voice narration layer
- Unified styling pass
- Demo flow: user asks question → AI picks visual → renders + narrates

### Phase 3: Polish (if time)

- Step-by-step sequencing (multi-step explanations)
- Voice input (Voxtral)
- Learning history / skill tree
- Multiple skills in one explanation (diagram + animation)

## Claude Integration via @convex-dev/agent

Instead of raw Claude API calls, the **Agent component** handles everything:

### Agent Setup

```typescript
// convex/agent.ts
const visualAgent = new Agent(components.agent, {
  model: "claude-sonnet-4-6", // fast + capable
  instructions: `You are a visual learning AI. You explain concepts
    using visuals, not text. Choose the best visual skill for each concept.`,
  tools: {
    renderManim: /* generates manim-web scene config */,
    renderDiagram: /* generates Excalidraw element JSON */,
    renderUI: /* generates json-render component JSON */,
    renderParticles: /* generates particle behavior config */,
    narrate: /* sends text to ElevenLabs TTS */,
  },
});
```

### How It Works

1. User sends message → stored in Agent thread (persistent)
2. Agent streams response over **websockets** (not HTTP) → instant UI updates
3. Agent calls **tools** to trigger visual skills — each tool returns structured JSON
4. Frontend subscribes reactively to thread messages + tool results
5. SkillRouter component maps tool results → correct visual renderer
6. Follow-up questions stay in the same thread (full context preserved)

### Skill Definitions as Tools

Each visual skill becomes a Convex Agent **tool**. The tool description tells Claude when/how to use it, and the tool's Zod schema enforces valid output. This replaces the "skill manifest" concept — tools ARE the skills.

### Progressive Disclosure via Tool Selection

- Start with a minimal tool set (diagram + ui)
- When the topic is STEM/math, dynamically add manim + particles tools
- Agent component supports per-message tool overrides

### Token Efficiency

- Agent component manages thread history automatically
- Tool definitions are compact (Zod schemas, not long markdown)
- RAG component injects relevant learning content only when needed

## Key Design Decisions

1. **Claude does ALL reasoning** — ElevenLabs is purely voice synthesis, no AI logic
2. **Skills are independent** — each developer can work in isolation, merge later
3. **JSON-first** — all AI output is structured JSON, never raw code that needs eval
4. **Progressive disclosure** — start simple, inject complexity only when needed
5. **No Remotion** — too slow for real-time; use manim-web and R3F instead
6. **Shared VisualFrame** — consistent UX regardless of which skill renders

## File Structure (Target)

```
app/
  routes/
    __root.tsx          — layout, providers (Convex, WorkOS, QueryClient)
    index.tsx           — landing / main learning interface
    _auth.login.tsx     — WorkOS login
  components/
    VisualFrame.tsx      — shared frame for all skills
    VoicePlayer.tsx      — ElevenLabs narration bar
    SkillRouter.tsx      — receives Claude output, delegates to correct skill
  skills/
    manim/
      ManimRenderer.tsx  — wraps <ManimScene>
      skill.md           — Claude skill definition
    diagram/
      DiagramRenderer.tsx — wraps <Excalidraw>
      skill.md
    ui/
      UIRenderer.tsx     — wraps json-render
      catalog.ts         — Zod component schemas
      skill.md
    particles/
      ParticleRenderer.tsx — wraps particle-architect
      skill.md
    voice/
      VoiceSkill.ts      — ElevenLabs API calls
convex/
  schema.ts              — custom tables + agent component tables
  agent.ts               — Agent definition, tools, skill routing
  explanations.ts        — store/retrieve generated visual content
  auth.config.ts         — WorkOS provider
  workflow.ts            — multi-step generation pipelines
```

## Success Criteria (Demo)

A user types "explain how derivatives work" and:
1. Claude picks the `manim` skill
2. A 3B1B-style animation shows a curve, tangent line, and slope changing
3. ElevenLabs narrates: "A derivative measures how fast something changes..."
4. No wall of text. Just visuals + voice.
5. The user can step through the explanation or ask follow-ups
