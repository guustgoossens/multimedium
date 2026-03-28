/**
 * Director + Sub-Agent Architecture
 *
 * directorAgent: Plans narrative arc, dispatches sub-agents per visual frame
 * visualAgent: Renders one frame — loads a skill, generates config, calls renderVisual
 */

import { Agent, createTool } from "@convex-dev/agent";
import { anthropic } from "@ai-sdk/anthropic";
import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { z } from "zod";
import { components, internal } from "./_generated/api";

// =============================================================================
// DIRECTOR AGENT — plans narrative, dispatches sub-agents
// =============================================================================

const DIRECTOR_INSTRUCTIONS = `You are a narrative director for visual learning. You plan how to explain concepts visually, then dispatch specialized sub-agents to render each frame.

RULES:
1. NEVER generate visual configs yourself. ALWAYS delegate to launchVisualAgent.
2. Plan a narrative arc of 2-5 segments. Think: intro → build-up → key insight → summary → next actions.
3. For each segment, call launchVisualAgent with a focused prompt explaining what that frame should show.
4. ALWAYS end with a final launchVisualAgent call using skill "ui" that generates ActionCards for next steps.
5. ALWAYS call done() as your very last action.
6. Keep segment prompts concise and specific — the sub-agent handles the details.

AVAILABLE SKILLS:
- manim: Mathematical animations (3Blue1Brown style). Use for equations, graphs, geometry, proofs, step-by-step math.
- diagram: System diagrams (Excalidraw). Use for concept maps, flowcharts, architecture, relationships.
- particles: 3D particle simulations. Use for physics forces, waves, fields, molecular behavior.
- ui: Interactive components. Use for summaries, comparisons, quizzes, AND always for the final "next actions" frame with ActionCards.

EXAMPLE NARRATIVE for "explain derivatives":
1. launchVisualAgent(skill="manim", step=1, prompt="Show a curve f(x)=x² with a secant line between two points. Animate the second point approaching the first to show the limit concept. Narrate: A derivative measures the instantaneous rate of change.")
2. launchVisualAgent(skill="manim", step=2, prompt="Show the tangent line at x=1 on f(x)=x². Display the formula f'(x)=2x. Narrate: The derivative at any point gives us the slope of the tangent line.")
3. launchVisualAgent(skill="ui", step=3, prompt="Show a summary card with the derivative rules (power rule, chain rule, product rule) and 4 ActionCards: 'Quiz me on derivatives', 'Explain the chain rule in depth', 'Show real-world applications', 'Visualize integration (the reverse)'.")
4. done(totalFrames=3)`;

const launchVisualAgent = createTool({
  description: `Launch a sub-agent to render one visual frame. The sub-agent loads the skill, generates visual config, and saves the frame. Call this for each segment of your narrative.`,
  inputSchema: z.object({
    segmentPrompt: z
      .string()
      .describe(
        "Detailed prompt for this segment — what to explain, what to show, what to narrate"
      ),
    skill: z
      .enum(["manim", "diagram", "ui", "particles"])
      .describe("Which visual skill the sub-agent should use"),
    step: z
      .number()
      .describe("Step number in the sequence (1-based)"),
    narrationHint: z
      .string()
      .optional()
      .describe("Key narration phrases or tone guidance"),
  }),
  execute: async (ctx, args): Promise<string> => {
    try {
      await ctx.runAction(internal.agent.runSubAgent, {
        threadId: ctx.threadId!,
        segmentPrompt: args.segmentPrompt,
        skill: args.skill,
        step: args.step,
        narrationHint: args.narrationHint,
      });
      return `Frame ${args.step} (${args.skill}) generated successfully.`;
    } catch (error) {
      return `Frame ${args.step} (${args.skill}) failed: ${error instanceof Error ? error.message : "unknown error"}. Continue with the next segment.`;
    }
  },
});

const done = createTool({
  description: `Signal that all visual frames are generated. ALWAYS call this as your very last action.`,
  inputSchema: z.object({
    totalFrames: z.number().describe("Total number of frames generated"),
  }),
  execute: async (ctx, args): Promise<string> => {
    await ctx.runMutation(internal.explanations.markDone, {
      threadId: ctx.threadId!,
      totalFrames: args.totalFrames,
    });
    return "Done.";
  },
});

export const directorAgent = new Agent(components.agent, {
  name: "director",
  languageModel: anthropic("claude-sonnet-4-6"),
  instructions: DIRECTOR_INSTRUCTIONS,
  tools: { launchVisualAgent, done },
  maxSteps: 15,
});

// =============================================================================
// VISUAL SUB-AGENT — renders one frame
// =============================================================================

const SUB_AGENT_INSTRUCTIONS = `You are a visual rendering sub-agent. You generate exactly ONE visual frame.

WORKFLOW:
1. Invoke the skill specified in your prompt to load output format instructions.
2. Generate the visual config JSON following those instructions exactly.
3. Call renderVisual with the config, narration, and step number.
4. Stop. Do NOT call done — the director handles that.`;

const invokeSkill = createTool({
  description: `Load visual skill instructions. Call this first to learn the output format.`,
  inputSchema: z.object({
    skill_name: z
      .string()
      .describe('Skill to invoke (e.g., "visual/manim", "visual/ui")'),
  }),
  execute: async (ctx, args): Promise<string> => {
    const skill = await ctx.runQuery(internal.skills.get, {
      name: args.skill_name,
    });

    if (!skill) {
      return `Skill '${args.skill_name}' not found.`;
    }

    const content = await ctx.runQuery(internal.skills.getFileInternal, {
      skillName: args.skill_name,
      path: "SKILL.md",
    });

    if (!content) {
      return `Skill "${args.skill_name}" has no content.`;
    }

    if (skill.hasChildren) {
      const children = await ctx.runQuery(
        internal.skills.getChildrenInternal,
        { parentName: args.skill_name }
      );
      const list = children
        .map(
          (c: { name: string; description: string }) =>
            `  - ${c.name}: ${c.description}`
        )
        .join("\n");
      return `<category name="${skill.name}">\n${content}\n\nSub-skills:\n${list}\n</category>`;
    }

    return `<skill name="${skill.name}">\n${content}\n</skill>`;
  },
});

const renderVisual = createTool({
  description: `Save a generated visual frame. Call after generating config per skill instructions.`,
  inputSchema: z.object({
    skill: z.enum(["manim", "diagram", "ui", "particles"]),
    config: z.string().describe("JSON config for the renderer"),
    narration: z.string().describe("Voice narration for this frame"),
    step: z.number().optional().describe("Step number"),
  }),
  execute: async (ctx, args): Promise<string> => {
    await ctx.runMutation(internal.explanations.create, {
      threadId: ctx.threadId!,
      messageId: ctx.messageId,
      skill: args.skill,
      config: args.config,
      narration: args.narration,
      step: args.step,
    });
    return `Saved: ${args.skill} step ${args.step ?? "?"}`;
  },
});

export const visualAgent = new Agent(components.agent, {
  name: "visual-sub-agent",
  languageModel: anthropic("claude-sonnet-4-6"),
  instructions: SUB_AGENT_INSTRUCTIONS,
  tools: { invokeSkill, renderVisual },
  maxSteps: 5,
});

// =============================================================================
// SUB-AGENT RUNNER (internal action called by director's tool)
// =============================================================================

export const runSubAgent = internalAction({
  args: {
    threadId: v.string(),
    segmentPrompt: v.string(),
    skill: v.string(),
    step: v.number(),
    narrationHint: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const prompt = [
      `Generate step ${args.step} using the visual/${args.skill} skill.`,
      `First, invoke skill "visual/${args.skill}" to load the output format.`,
      `Then call renderVisual with step=${args.step}.`,
      ``,
      `TASK: ${args.segmentPrompt}`,
      args.narrationHint ? `NARRATION GUIDANCE: ${args.narrationHint}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    await visualAgent.generateText(ctx, { threadId: args.threadId }, { prompt });
  },
});
