import { query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const create = internalMutation({
  args: {
    threadId: v.string(),
    messageId: v.optional(v.string()),
    skill: v.string(),
    config: v.string(),
    narration: v.optional(v.string()),
    step: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("explanations", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const patchAudio = internalMutation({
  args: {
    explanationId: v.id("explanations"),
    audioStorageId: v.id("_storage"),
    audioTimings: v.string(),
  },
  handler: async (ctx, { explanationId, audioStorageId, audioTimings }) => {
    await ctx.db.patch(explanationId, { audioStorageId, audioTimings });
  },
});

export const markDone = internalMutation({
  args: {
    threadId: v.string(),
    totalFrames: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("explanations", {
      threadId: args.threadId,
      skill: "_done",
      config: JSON.stringify({ totalFrames: args.totalFrames }),
      createdAt: Date.now(),
    });
  },
});

export const getByThread = query({
  args: { threadId: v.string() },
  handler: async (ctx, args) => {
    const explanations = await ctx.db
      .query("explanations")
      .withIndex("by_thread", (q) => q.eq("threadId", args.threadId))
      .collect();

    // Resolve audio storage IDs to signed URLs
    return Promise.all(
      explanations.map(async (exp) => {
        if (exp.audioStorageId) {
          const audioUrl = await ctx.storage.getUrl(exp.audioStorageId);
          return { ...exp, audioUrl: audioUrl ?? exp.audioUrl };
        }
        return exp;
      })
    );
  },
});

export const getByMessage = query({
  args: { messageId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("explanations")
      .withIndex("by_message", (q) => q.eq("messageId", args.messageId))
      .collect();
  },
});
