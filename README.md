# multimedium

**Ask anything. See it visually.**

An AI tutor that explains concepts through real-time visuals — math animations, particle simulations, system diagrams, and interactive components — narrated by a talking avatar. Built at the [Anthropic NullHack Hackathon](https://nullhack.anthropic.com), March 2026.

Built by [Guust Goossens](https://github.com/guustgoossens), [Elias Teikari](https://github.com/), and Ludwig Illies.

---

## The Problem

School is broken. It's text-based, one-directional, and treats every student the same — even though decades of research show that visual, personalized learning is dramatically more effective.

```
Traditional Education          AI Tutoring

   Teacher                      AI Tutor
   /  |  \                        |
  /   |   \                       |
 v    v    v                      v
 30 students              ONE student
 (same pace)              (adapted pace)
 (no feedback loop)       (continuous feedback)
```

The greatest minds in history — Marcus Aurelius, Alexander the Great — had private tutors. Not textbooks, not lectures. A person who adapted to *them*, challenged *their* thinking, and engaged *them* in dialogue. That model produces better thinkers. But it doesn't scale.

Until now. AI makes one-to-one education the first scalable, cost-efficient model for high-quality knowledge transfer.

But current LLMs still communicate in walls of text. That's a problem because **humans don't think in text**. We think in structures, systems, spatial relationships, and patterns. We have more senses than just reading. Text is linear and flat. Understanding is not.

Multimedium fixes this. It's an AI that communicates the way humans actually think — through visuals, animation, and voice — keeping you in flow instead of drowning you in paragraphs.

---

## How It Works

You ask a question. The AI plans a visual narrative, then renders it frame by frame.

```
 "Explain derivatives"
         |
         v
  +--------------+
  | Director AI  |  Plans 2-5 narrative segments
  +--------------+
    |    |    |
    v    v    v
  +--+ +--+ +--+
  |S1| |S2| |S3|   Sub-agents render each frame
  +--+ +--+ +--+   independently & in parallel
    |    |    |
    v    v    v
  Manim  Manim  UI     Each picks the best medium:
  anim   anim   cards   math, diagram, particles, or UI
```

1. **Director Agent** receives your question, plans a narrative arc (intro, build-up, key insight, summary, next actions)
2. **Visual Sub-Agents** each load a skill spec, generate structured JSON config, and save a frame
3. **Renderers** display each frame in real time as it arrives
4. **Avatar** narrates with ElevenLabs TTS, synced word-by-word
5. **ActionCards** let you branch into follow-up questions

The director never generates visuals itself — it orchestrates. The sub-agents never plan — they execute. Clean separation prevents context pollution and keeps each agent focused.

---

## Visual Skills

| Skill | Best For | Powered By |
|-------|----------|------------|
| **Manim** | Equations, graphs, geometry, step-by-step proofs | manim-web (3Blue1Brown style) |
| **Diagram** | Concept maps, flowcharts, architecture, relationships | Excalidraw |
| **Particles** | Physics forces, waves, fields, molecular behavior | React Three Fiber |
| **UI** | Summaries, comparisons, quizzes, next-step actions | Custom component renderer |

The AI chooses the right medium for each segment. A derivative explanation might use Manim for the math, then a UI card for the summary and follow-up prompts.

---

## Architecture

```
Browser (React + TanStack Start)
  |
  |-- TalkingHead         3D wireframe avatar (Three.js)
  |-- FrameContainer      Carousel of visual frames
  |-- SkillRouter         Routes to correct renderer
  |-- PromptInput         Text + speech input
  |
  v
Convex (Backend)
  |
  |-- Director Agent      Plans narrative, dispatches sub-agents
  |-- Visual Sub-Agents   Load skill specs, generate config JSON
  |-- TTS (ElevenLabs)    Async audio generation with word timings
  |-- Explanations DB     Stores frames, audio, timings per thread
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | TanStack Start + React 19 |
| Backend | Convex + @convex-dev/agent |
| AI | Claude Sonnet 4.6 (via @ai-sdk/anthropic) |
| Voice | ElevenLabs TTS (word-level timestamps) |
| 3D Avatar | @met4citizen/talkinghead + Three.js |
| Math Animations | manim-web |
| Diagrams | Excalidraw |
| Particle Sims | React Three Fiber |
| Auth | WorkOS AuthKit |
| Styling | Tailwind CSS 4 |

---

## Getting Started

### Prerequisites

- [Bun](https://bun.sh)
- [Convex](https://convex.dev) account
- Anthropic API key
- ElevenLabs API key + voice ID (for narration)

### Setup

```bash
git clone https://github.com/guustgoossens/multimedium.git
cd multimedium
bun install
```

Set up environment variables in `.env.local`:

```env
VITE_CONVEX_URL=your_convex_url
CONVEX_DEPLOYMENT=your_deployment
ANTHROPIC_API_KEY=your_key
ELEVENLABS_API_KEY=your_key
ELEVENLABS_VOICE_ID=your_voice_id
VITE_WORKOS_CLIENT_ID=your_client_id
```

### Run

```bash
# Terminal 1: Convex backend
bunx convex dev

# Terminal 2: Frontend
bun run dev
```

Sync visual skills to the database:

```bash
bun run skills:sync
```

---

## Why This Matters

Education has a scaling problem. The best way to learn is one-to-one with an expert who adapts to you. But that costs $100+/hour and doesn't scale beyond the privileged few.

AI changes the economics. But most AI tutors just generate more text — the same medium that makes traditional education ineffective. Multimedium takes the insight that humans learn visually and makes it the *default* communication mode.

The goal: democratize the kind of education that used to be reserved for emperors and their children.

---

*Built at the Anthropic NullHack Hackathon, March 2026.*
