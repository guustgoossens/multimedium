# Multimedium

**Your AI professor who actually shows you things instead of just talking at you.**

> "What if ChatGPT went to art school, learned 3D animation, and still somehow graduated with honors in physics?"

## What is this?

Multimedium is an AI-powered visual learning platform that refuses to explain anything with a wall of text. Ask it a question, and instead of typing you an essay, it spins up a 3D talking avatar that narrates the answer while conjuring math animations, particle simulations, and interactive diagrams in real-time.

It's like having a private tutor who moonlights as a VFX artist.

## How it works

1. You ask a question (the easy part)
2. An AI **director agent** plans a narrative arc — think of it as your personal Spielberg, but for calculus
3. Specialized **visual sub-agents** render each frame using the best medium for the job (math animations, particle physics, interactive UI)
4. A 3D avatar narrates the whole thing with lip-synced audio, because reading is *so* 2023

## Features

- **3D Talking Avatar** — A lip-synced speaking head powered by ElevenLabs TTS. It has moods. Don't make it sad.
- **Manim-style Math Animations** — 3Blue1Brown-inspired animations for equations, graphs, geometry, and proofs. Your math teacher could never.
- **3D Particle Simulations** — Physics forces, waves, fields, molecular behavior. Basically a tiny universe in your browser.
- **Interactive UI Components** — Summaries, comparisons, quizzes, and action cards. Learning, but make it clickable.
- **Multi-Agent Architecture** — A director agent orchestrates visual sub-agents. It's agents all the way down.
- **Frame Navigation** — Arrow keys, scroll, or click dots. Navigate your explanation like a presentation that doesn't put you to sleep.

## Tech Stack

| Tech | Why |
|------|-----|
| **TanStack Start** | React meta-framework for people who like their routing file-based |
| **Convex** | Backend-as-a-service, because databases should be someone else's problem |
| **Claude Sonnet 4.6** | The brains of the operation (via Anthropic SDK) |
| **ElevenLabs** | Text-to-speech with word-level timing, so the avatar doesn't look like a dubbed anime |
| **Three.js + R3F** | 3D rendering for the avatar and particle sims |
| **Manim-web** | Mathematical animations that make you feel like you're watching a YouTube video with 10M views |
| **Tailwind CSS** | Styling for people who think CSS files are a code smell |
| **Shadcn/ui** | Beautiful components you didn't have to design yourself |
| **WorkOS AuthKit** | Auth, because not everyone deserves to see your AI professor |
| **Bun** | Fast. Like, really fast. That's it, that's the pitch. |

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) installed
- A [Convex](https://convex.dev) account (free tier works)
- API keys for: Anthropic (Claude), ElevenLabs
- A [WorkOS](https://workos.com) account for auth
- Patience (optional but recommended)

### Environment Variables

Create a `.env.local` file in the project root:

```env
VITE_WORKOS_CLIENT_ID=client_...
VITE_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOYMENT=dev:your-deployment
ELEVENLABS_API_KEY=sk_...
ELEVENLABS_VOICE_ID=your-voice-id
ANTHROPIC_API_KEY=sk-ant-...
```

### Run it

```bash
# Install dependencies (grab a coffee, just kidding, Bun is fast)
bun install

# Start the Convex backend (in a separate terminal, it likes its space)
bunx convex dev

# Sync skill definitions to Convex (first time + whenever skills change)
bun run skills:sync

# Start the dev server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) and ask it something. Go on. It won't bite.

## Available Scripts

| Script | What it does |
|--------|-------------|
| `bun run dev` | Starts the dev server on port 3000 |
| `bun run build` | Builds for production (for when you're feeling brave) |
| `bun run preview` | Preview the production build |
| `bun run test` | Run tests with Vitest |
| `bun run lint` | Lint your code (it will judge you) |
| `bun run format` | Check formatting with Prettier |
| `bun run check` | Auto-fix linting & formatting (the "fix my mess" button) |
| `bun run skills:sync` | Sync skill definitions from filesystem to Convex |
| `bun run skills:sync:dry` | Dry run — see what *would* sync without committing to it |

## Project Structure

```
multimedium/
├── src/
│   ├── routes/               # Pages (file-based routing)
│   ├── components/           # React components (avatar, frames, renderers)
│   ├── components/renderers/ # Skill renderers (Manim, UI, Particles)
│   ├── integrations/         # Convex & WorkOS providers
│   ├── hooks/                # Custom React hooks
│   └── lib/                  # Utilities
├── convex/
│   ├── agent.ts              # Director & visual sub-agents (the brains)
│   ├── chat.ts               # Frontend-facing actions
│   ├── tts.ts                # ElevenLabs TTS integration
│   ├── explanations.ts       # Visual frame mutations
│   ├── skills.ts             # Skill management
│   └── schema.ts             # Database schema
├── skills/
│   └── visual/               # Skill definitions (Manim, Particles, UI)
└── package.json              # The usual suspects
```

## Contributing

Found a bug? Want to add a new visual skill? PRs welcome. Just make sure `bun run check` passes or the CI will publicly shame you.

---

*Built with an mass of API keys, questionable amounts of WebGL, and the firm belief that learning should look cooler than a Wikipedia article.*
