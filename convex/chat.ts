/**
 * Chat Actions
 *
 * Frontend-facing actions for creating threads and sending messages.
 * Uses @convex-dev/agent for thread management and streaming.
 */

import { v } from "convex/values";
import { action, query } from "./_generated/server";
import { createThread, listUIMessages, syncStreams } from "@convex-dev/agent";
import { vStreamArgs } from "@convex-dev/agent";
import { paginationOptsValidator } from "convex/server";
import { components } from "./_generated/api";
import { visualAgent } from "./agent";

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
    const result = await visualAgent.generateText(ctx, { threadId }, { prompt });
    return result.text;
  },
});

export const sendMessageStreaming = action({
  args: {
    threadId: v.string(),
    prompt: v.string(),
  },
  handler: async (ctx, { threadId, prompt }) => {
    await visualAgent.streamText(
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
