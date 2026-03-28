/**
 * Chat Actions
 *
 * Frontend-facing actions. Uses the director agent which
 * orchestrates sub-agents for each visual frame.
 */

import { v } from "convex/values";
import { action, query } from "./_generated/server";
import { createThread, listUIMessages, syncStreams } from "@convex-dev/agent";
import { vStreamArgs } from "@convex-dev/agent";
import { paginationOptsValidator } from "convex/server";
import { components } from "./_generated/api";
import { directorAgent } from "./agent";

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

export const sendMessageStreaming = action({
  args: {
    threadId: v.string(),
    prompt: v.string(),
  },
  handler: async (ctx, { threadId, prompt }) => {
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
