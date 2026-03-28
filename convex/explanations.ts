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
    return await ctx.db
      .query("explanations")
      .withIndex("by_thread", (q) => q.eq("threadId", args.threadId))
      .collect();
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
