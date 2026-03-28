/**
 * Visual Learning Agent
 *
 * Uses @convex-dev/agent with Claude to generate visual explanations.
 * The agent loads skill definitions on demand (progressive disclosure)
 * and calls visual rendering tools to produce manim scenes, diagrams, etc.
 */

import { Agent, createTool } from "@convex-dev/agent";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { components, internal } from "./_generated/api";

// =============================================================================
// AGENT INSTRUCTIONS
// =============================================================================

const AGENT_INSTRUCTIONS = `You are a visual learning AI. Your job is to explain concepts using visuals and voice — NOT walls of text.

CORE RULES:
1. NEVER respond with long text explanations. Always use a visual skill.
2. Choose the BEST visual medium for each concept.
3. Layer voice narration on top of every visual.
4. For complex topics, break into multi-step sequences.
5. ALWAYS end with an interactive "next actions" frame using the ui skill.

WORKFLOW:
1. User asks a question
2. invoke_skill to load the right visual skill instructions
3. Follow the skill instructions to generate visual output
4. Always include narration text for voice synthesis
5. AFTER your explanation, ALWAYS generate one final renderVisual call with skill "ui" containing interactive next actions (use the highest step number). This should include 3-5 clickable options like:
   - "Quiz me on this"
   - "Explain [related concept]"
   - "Go deeper into [subtopic]"
   - "Show me a real-world example"
   - A text input option for custom questions
   Use the ActionCard component for each option. These are how the user navigates — text input is secondary.
6. ALWAYS call the "done" tool as your very last action after all renderVisual calls.

AVAILABLE SKILL CATEGORIES (invoke any to see sub-skills):
- visual: All visual rendering skills (manim, diagram, ui, particles)

When you invoke a skill, it returns detailed instructions on the output format.
Follow those instructions exactly to generate valid config JSON.`;

// =============================================================================
// TOOLS
// =============================================================================

/**
 * Invoke Skill - loads skill instructions from the database.
 * This is the agent's primary tool for discovering HOW to generate visuals.
 */
const invokeSkill = createTool({
  description: `Load specialized visual skill instructions. ALWAYS use this first to learn how to generate the right visual output.

WHEN TO USE:
- ALWAYS invoke a skill before generating any visual content
- Use "visual" to see all available visual skills
- Use "visual/manim" for math animations, "visual/diagram" for system diagrams, etc.`,
  inputSchema: z.object({
    skill_name: z
      .string()
      .describe(
        'The skill to invoke (e.g., "visual", "visual/manim", "visual/diagram")'
      ),
  }),
  execute: async (ctx, args): Promise<string> => {
    const skill = await ctx.runQuery(internal.skills.get, {
      name: args.skill_name,
    });

    if (!skill) {
      return `Skill '${args.skill_name}' not found. Try "visual" to see available categories.`;
    }

    const content = await ctx.runQuery(internal.skills.getFileInternal, {
      skillName: args.skill_name,
      path: "SKILL.md",
    });

    if (!content) {
      return `Skill "${args.skill_name}" has no content file.`;
    }

    // Category skill — show children
    if (skill.hasChildren) {
      const children = await ctx.runQuery(
        internal.skills.getChildrenInternal,
        { parentName: args.skill_name }
      );

      const childrenList = children
        .map(
          (c: { name: string; description: string; hasChildren: boolean }) =>
            `  - ${c.name}: ${c.description}`
        )
        .join("\n");

      return `<category name="${skill.name}">
${content}

Available sub-skills:
${childrenList}

Invoke a specific sub-skill for detailed output instructions.
</category>`;
    }

    // Leaf skill — full instructions
    return `<skill name="${skill.name}" domains="${skill.domains.join(", ")}">
${content}
</skill>`;
  },
});

/**
 * Render Visual - saves a generated visual explanation to the database.
 * Called AFTER the agent has invoked a skill and generated the config.
 */
const renderVisual = createTool({
  description: `Save a generated visual explanation. Call this after generating visual config following skill instructions.`,
  inputSchema: z.object({
    skill: z
      .enum(["manim", "diagram", "ui", "particles"])
      .describe("Which visual skill produced this"),
    config: z
      .string()
      .describe("JSON config for the visual renderer (skill-specific format)"),
    narration: z
      .string()
      .describe("Voice narration text to accompany this visual"),
    step: z
      .number()
      .optional()
      .describe("Step number for multi-step explanations"),
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

    return `Visual saved: ${args.skill} ${args.step ? `(step ${args.step})` : ""}. The frontend will render this automatically.`;
  },
});

/**
 * Done - signals the frontend that generation is complete.
 */
const done = createTool({
  description: `Signal that you are done generating all visual frames for this response. ALWAYS call this as your very last tool call.`,
  inputSchema: z.object({
    totalFrames: z.number().describe("Total number of frames generated"),
  }),
  execute: async (ctx, args): Promise<string> => {
    await ctx.runMutation(internal.explanations.markDone, {
      threadId: ctx.threadId!,
      totalFrames: args.totalFrames,
    });
    return "Done. Frontend notified.";
  },
});

// =============================================================================
// AGENT DEFINITION
// =============================================================================

export const visualAgent = new Agent(components.agent, {
  name: "visual-learning-agent",
  languageModel: anthropic("claude-sonnet-4-6"),
  instructions: AGENT_INSTRUCTIONS,
  tools: {
    invokeSkill,
    renderVisual,
    done,
  },
  maxSteps: 10,
});
