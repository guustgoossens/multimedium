/**
 * Skills Queries and Mutations
 *
 * Tree-based skill system with progressive disclosure:
 * - Discovery: Only depth-0 categories returned for system prompt
 * - Category invoke: Parent content + child descriptions
 * - Skill invoke: Full instructions from skill_files
 */

import { query, mutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

// =============================================================================
// DISCOVERY (Lean prompt - depth-0 categories only)
// =============================================================================

export const listCategories = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db
      .query("skills")
      .withIndex("by_depth", (q) => q.eq("depth", 0))
      .collect();

    return categories.map((s) => ({
      name: s.name,
      description: s.description,
      hasChildren: s.hasChildren,
    }));
  },
});

// =============================================================================
// SKILL INVOCATION
// =============================================================================

export const getByName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("skills")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();
  },
});

export const getChildren = query({
  args: { parentName: v.string() },
  handler: async (ctx, args) => {
    const children = await ctx.db
      .query("skills")
      .withIndex("by_parent", (q) => q.eq("parentSkillName", args.parentName))
      .collect();

    return children.map((s) => ({
      name: s.name,
      description: s.description,
      hasChildren: s.hasChildren,
      depth: s.depth,
    }));
  },
});

export const getFile = query({
  args: { skillName: v.string(), path: v.string() },
  handler: async (ctx, args) => {
    const file = await ctx.db
      .query("skill_files")
      .withIndex("by_skill_path", (q) =>
        q.eq("skillName", args.skillName).eq("path", args.path)
      )
      .first();
    return file?.content ?? null;
  },
});

// =============================================================================
// INTERNAL QUERIES (for agent tools)
// =============================================================================

export const get = internalQuery({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("skills")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();
  },
});

export const getFileInternal = internalQuery({
  args: { skillName: v.string(), path: v.string() },
  handler: async (ctx, args) => {
    const file = await ctx.db
      .query("skill_files")
      .withIndex("by_skill_path", (q) =>
        q.eq("skillName", args.skillName).eq("path", args.path)
      )
      .first();
    return file?.content ?? null;
  },
});

export const getChildrenInternal = internalQuery({
  args: { parentName: v.string() },
  handler: async (ctx, args) => {
    const children = await ctx.db
      .query("skills")
      .withIndex("by_parent", (q) => q.eq("parentSkillName", args.parentName))
      .collect();

    return children.map((s) => ({
      name: s.name,
      description: s.description,
      hasChildren: s.hasChildren,
      depth: s.depth,
    }));
  },
});

// =============================================================================
// SYNC QUERIES (for sync script)
// =============================================================================

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("skills").collect();
  },
});

export const listAllFiles = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("skill_files").collect();
  },
});

// =============================================================================
// MUTATIONS (for sync script)
// =============================================================================

export const upsert = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    domains: v.array(v.string()),
    parentSkillName: v.optional(v.string()),
    depth: v.number(),
    hasChildren: v.boolean(),
    filePath: v.string(),
    contentHash: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("skills")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { ...args, syncedAt: Date.now() });
      return { action: "updated" as const, id: existing._id };
    } else {
      const id = await ctx.db.insert("skills", {
        ...args,
        syncedAt: Date.now(),
      });
      return { action: "created" as const, id };
    }
  },
});

export const upsertFile = mutation({
  args: {
    skillName: v.string(),
    path: v.string(),
    content: v.string(),
    contentHash: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("skill_files")
      .withIndex("by_skill_path", (q) =>
        q.eq("skillName", args.skillName).eq("path", args.path)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        content: args.content,
        contentHash: args.contentHash,
        syncedAt: Date.now(),
      });
      return { action: "updated" as const };
    } else {
      await ctx.db.insert("skill_files", { ...args, syncedAt: Date.now() });
      return { action: "created" as const };
    }
  },
});

export const deleteByName = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("skills")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    if (existing) await ctx.db.delete(existing._id);

    const files = await ctx.db
      .query("skill_files")
      .withIndex("by_skill", (q) => q.eq("skillName", args.name))
      .collect();

    for (const file of files) await ctx.db.delete(file._id);

    return { deleted: !!existing, filesDeleted: files.length };
  },
});

export const deleteFile = mutation({
  args: { skillName: v.string(), path: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("skill_files")
      .withIndex("by_skill_path", (q) =>
        q.eq("skillName", args.skillName).eq("path", args.path)
      )
      .first();

    if (existing) await ctx.db.delete(existing._id);
    return { deleted: !!existing };
  },
});
