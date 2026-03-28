import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // =========================================================================
  // Skills (synced from filesystem via `bun run skills:sync`)
  // =========================================================================
  skills: defineTable({
    name: v.string(), // e.g., "visual", "visual/manim", "visual/diagram"
    description: v.string(),
    domains: v.array(v.string()), // e.g., ["math", "physics"]
    // Tree structure
    parentSkillName: v.optional(v.string()),
    depth: v.number(), // 0=category, 1=skill, 2+=sub-skill
    hasChildren: v.boolean(),
    // Sync metadata
    filePath: v.string(),
    contentHash: v.string(),
    syncedAt: v.optional(v.number()),
  })
    .index("by_name", ["name"])
    .index("by_depth", ["depth"])
    .index("by_parent", ["parentSkillName"]),

  skill_files: defineTable({
    skillName: v.string(),
    path: v.string(), // "SKILL.md" or reference file name
    content: v.string(),
    contentHash: v.string(),
    syncedAt: v.optional(v.number()),
  })
    .index("by_skill_path", ["skillName", "path"])
    .index("by_skill", ["skillName"]),

  // =========================================================================
  // Explanations (generated visual content linked to agent messages)
  // =========================================================================
  explanations: defineTable({
    threadId: v.string(),
    messageId: v.optional(v.string()),
    skill: v.string(), // "manim" | "diagram" | "ui" | "particles"
    config: v.string(), // JSON string of skill-specific config
    narration: v.optional(v.string()), // text for ElevenLabs TTS
    audioUrl: v.optional(v.string()), // ElevenLabs audio URL
    step: v.optional(v.number()), // for multi-step explanations
    createdAt: v.number(),
  })
    .index("by_thread", ["threadId"])
    .index("by_message", ["messageId"]),
});
