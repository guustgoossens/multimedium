# Next Steps — Post-MVP

## V1.5: Director Agent (Narrative Control)

Right now the agent generates a slideshow of frames. The next step is a **director agent** that orchestrates a cohesive narrative — more like a short video than slides.

- **Director agent** receives the question, plans a narrative arc (intro → build-up → key insight → summary → actions)
- **Sub-agents per skill** — director dispatches to specialized agents that each generate one visual segment
- Director writes **transition narration** between segments ("Now that we've seen the overview, let's zoom into the math...")
- Each sub-agent works in parallel, director assembles the timeline
- Timing metadata per frame (how long to show, when to start narration)

## V1.5: Voice Narration

- ElevenLabs TTS for narration text on each frame
- Auto-play narration when frame becomes active
- Convex action that calls ElevenLabs API, stores audio URL on the explanation
- Fallback to Web Speech API when no credits / for development
- Lip-sync or waveform visualization while narrating

## V2: Branching Conversations (Tree Navigation)

Instead of linear frame sequences, users can ask follow-up questions about specific parts of an explanation, creating branches.

- Add `parentId` field to explanations schema
- Each branch starts from a specific frame
- UI becomes a **spatial tree** you can navigate — not just forward/back
- Think mind-map meets presentation
- Branches can be collapsed/expanded
- "Breadcrumb" trail showing your path through the tree
- Could visualize the full tree as an Excalidraw-style map

## V2: Scroll-as-Timeline

Connect scroll position to a continuous timeline instead of discrete frame snapping:

- Each frame has a duration (derived from narration length or content complexity)
- Smooth scroll maps to timeline position
- Animations within frames progress based on scroll
- Audio scrubs with scroll position
- Play/pause mode for hands-free viewing

## V2: More Visual Skills

### Manim (3Blue1Brown math animations)
- `manim-web` TypeScript library, renders in Canvas/WebGL
- React component: `<ManimScene>`
- Best for: calculus, linear algebra, geometry, proofs

### Excalidraw (System diagrams)
- `@excalidraw/excalidraw` React component
- Progressive reveal via `revealOrder`
- AI generates Excalidraw element JSON or Mermaid → convert
- Best for: system thinking, concept maps, architecture

### Code Visualization
- Syntax-highlighted code blocks with step-through animation
- Highlight lines as narration explains them
- Could use Shiki for highlighting

## V2: Interactive Learning

### Quizzes
- Agent generates quiz frames (multiple choice, fill-in-the-blank)
- ActionCards for answer options
- Immediate visual feedback (correct/incorrect animation)
- Track score across a session

### Skill Tree / Progress
- Map concepts the user has learned
- Suggest next topics based on knowledge gaps
- Visualize as a node graph (could use Excalidraw skill)

### Spaced Repetition
- Resurface concepts at optimal intervals
- "Review this concept" ActionCards appear in later sessions
- Store review schedule in Convex

## V2: Memory System

- **Logical memory, not chronological** — connect related concepts across sessions
- Build a knowledge graph per user
- When explaining something new, reference what the user already knows
- "You learned about derivatives last time — this builds on that"
- Store as embeddings in Convex RAG component

## V3: Multi-Modal Input

- **Voice input** via Voxtral (Mistral) for speech-to-text
- **Image input** — take a photo of a textbook page, get a visual explanation
- **Handwriting** — draw on screen, AI interprets and explains

## V3: Collaborative Learning

- Multiple users in the same session
- Shared tree navigation
- Use Convex presence component for cursors/avatars
- Teacher mode: one person controls the presentation, others follow

## V3: Export & Share

- Export a session as a shareable link
- Remotion server-side render to generate actual video files
- PDF export of key frames
- Embed in LMS (Canvas, Moodle)
