/**
 * Chat Actions
 *
 * Frontend-facing actions. Uses the director agent which
 * orchestrates sub-agents for each visual frame.
 */

import { v } from "convex/values";
import { action, query, internalAction } from "./_generated/server";
import { createThread, listUIMessages, syncStreams } from "@convex-dev/agent";
import { vStreamArgs } from "@convex-dev/agent";
import { paginationOptsValidator } from "convex/server";
import { components, internal } from "./_generated/api";
import { directorAgent } from "./agent";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";

export const createNewThread = action({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const threadId = await createThread(ctx, components.agent, {
      userId: args.userId,
    });
    return threadId;
  },
});

export const sendMessage = action({
  args: {
    threadId: v.string(),
    prompt: v.string(),
  },
  handler: async (ctx, { threadId, prompt }) => {
    const result = await directorAgent.generateText(
      ctx,
      { threadId },
      { prompt }
    );
    return result.text;
  },
});

export const generateIntro = internalAction({
  args: {
    threadId: v.string(),
    prompt: v.string(),
  },
  handler: async (ctx, { threadId, prompt }) => {
    const { text } = await generateText({
      model: anthropic("claude-haiku-4-5-20251001"),
      system:
        "You are a friendly learning assistant. Given the user's question, generate a warm 2-4 sentence introduction that acknowledges their question and gives a simple, accessible overview of the topic. Keep it under 60 words. Do not use markdown.",
      prompt,
    });

    const explanationId = await ctx.runMutation(internal.explanations.create, {
      threadId,
      skill: "intro",
      step: 0,
      config: "{}",
      narration: text,
    });

    await ctx.scheduler.runAfter(0, internal.tts.generateAudio, {
      narration: text,
      explanationId,
    });
  },
});

export const sendMessageStreaming = action({
  args: {
    threadId: v.string(),
    prompt: v.string(),
  },
  handler: async (ctx, { threadId, prompt }) => {
    // Launch intro in parallel — avatar starts talking immediately
    await ctx.scheduler.runAfter(0, internal.chat.generateIntro, {
      threadId,
      prompt,
    });

    await directorAgent.streamText(
      ctx,
      { threadId },
      { prompt },
      { saveStreamDeltas: true }
    );
  },
});

export const listThreadMessages = query({
  args: {
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
    streamArgs: vStreamArgs,
  },
  handler: async (ctx, args) => {
    const paginated = await listUIMessages(ctx, components.agent, args);
    const streams = await syncStreams(ctx, components.agent, args);
    return { ...paginated, streams };
  },
});
