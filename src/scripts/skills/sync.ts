#!/usr/bin/env bun
/**
 * Skills Sync Script
 *
 * Syncs skills from filesystem to Convex with tree structure.
 *
 * Usage:
 *   bun run skills:sync           # Full sync
 *   bun run skills:sync --dry-run # Preview changes
 */

import { ConvexHttpClient } from "convex/browser";
import matter from "gray-matter";
import * as fs from "fs/promises";
import * as path from "path";
import * as crypto from "crypto";
import { api } from "../../../convex/_generated/api";

const SKILLS_PATH = path.join(process.cwd(), "skills");

const convexUrl = process.env.CONVEX_URL || process.env.VITE_CONVEX_URL;
if (!convexUrl) {
  console.error("Error: CONVEX_URL or VITE_CONVEX_URL not set");
  process.exit(1);
}

const client = new ConvexHttpClient(convexUrl);

interface SkillMeta {
  name: string;
  description: string;
  domains: string[];
  parentSkillName: string | undefined;
  depth: number;
  hasChildren: boolean;
  filePath: string;
  contentHash: string;
}

interface SkillFile {
  skillName: string;
  path: string;
  content: string;
  contentHash: string;
}

const isDryRun = process.argv.includes("--dry-run");

function hashContent(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex").slice(0, 16);
}

function getParentSkillName(skillName: string): string | undefined {
  const parts = skillName.split("/");
  return parts.length <= 1 ? undefined : parts.slice(0, -1).join("/");
}

function getDepth(skillName: string): number {
  return skillName.split("/").length - 1;
}

async function hasChildSkills(dirPath: string): Promise<boolean> {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        try {
          await fs.access(path.join(dirPath, entry.name, "SKILL.md"));
          return true;
        } catch {}
      }
    }
  } catch {}
  return false;
}

async function discoverSkills(
  dirPath: string = SKILLS_PATH,
  results: { skills: SkillMeta[]; files: SkillFile[] } = {
    skills: [],
    files: [],
  }
): Promise<{ skills: SkillMeta[]; files: SkillFile[] }> {
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    const skillFilePath = path.join(dirPath, "SKILL.md");
    try {
      const raw = await fs.readFile(skillFilePath, "utf-8");
      const { data, content } = matter(raw);

      if (data.name && data.description) {
        const skillName = data.name as string;
        const hasChildren = await hasChildSkills(dirPath);

        results.skills.push({
          name: skillName,
          description: data.description as string,
          domains: (data.domains as string[]) || [],
          parentSkillName: getParentSkillName(skillName),
          depth: getDepth(skillName),
          hasChildren,
          filePath: path
            .relative(SKILLS_PATH, skillFilePath)
            .replace(/\\/g, "/"),
          contentHash: hashContent(raw),
        });

        results.files.push({
          skillName,
          path: "SKILL.md",
          content: content.trim(),
          contentHash: hashContent(content),
        });

        // Reference files
        for (const entry of entries) {
          if (
            entry.isFile() &&
            entry.name.endsWith(".md") &&
            entry.name !== "SKILL.md"
          ) {
            const refContent = await fs.readFile(
              path.join(dirPath, entry.name),
              "utf-8"
            );
            results.files.push({
              skillName,
              path: entry.name,
              content: refContent,
              contentHash: hashContent(refContent),
            });
          }
        }
      }
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
        console.error(`  Error reading ${skillFilePath}:`, err);
      }
    }

    for (const entry of entries) {
      if (entry.isDirectory()) {
        await discoverSkills(path.join(dirPath, entry.name), results);
      }
    }
  } catch (err) {
    console.error(`Error reading directory ${dirPath}:`, err);
  }

  return results;
}

async function syncSkills() {
  console.log(`\n=== Skills Sync ===\n`);
  console.log(`Mode: ${isDryRun ? "DRY RUN" : "LIVE"}`);
  console.log(`Source: ${SKILLS_PATH}\n`);

  const { skills: fsSkills, files: fsFiles } = await discoverSkills();
  console.log(
    `Found ${fsSkills.length} skills, ${fsFiles.length} files\n`
  );

  const dbSkills = (await client.query(api.skills.list, {})) as Array<
    SkillMeta & { _id: string }
  >;
  const dbFiles = (await client.query(api.skills.listAllFiles, {})) as Array<
    SkillFile & { _id: string }
  >;

  const dbSkillsByName = new Map(dbSkills.map((s) => [s.name, s]));
  const dbFilesByKey = new Map(
    dbFiles.map((f) => [`${f.skillName}:${f.path}`, f])
  );

  let created = 0,
    updated = 0,
    skipped = 0;

  // Sync skills
  for (const skill of fsSkills) {
    const existing = dbSkillsByName.get(skill.name);

    if (!existing) {
      console.log(`  [CREATE] ${skill.name}`);
      if (!isDryRun) await client.mutation(api.skills.upsert, skill);
      created++;
    } else if (existing.contentHash !== skill.contentHash) {
      console.log(`  [UPDATE] ${skill.name}`);
      if (!isDryRun) await client.mutation(api.skills.upsert, skill);
      updated++;
    } else {
      console.log(`  [SKIP] ${skill.name}`);
      skipped++;
    }
    dbSkillsByName.delete(skill.name);
  }

  // Delete removed skills
  for (const [name] of dbSkillsByName) {
    console.log(`  [DELETE] ${name}`);
    if (!isDryRun) await client.mutation(api.skills.deleteByName, { name });
  }

  // Sync files
  console.log("\n--- Files ---");
  for (const file of fsFiles) {
    const key = `${file.skillName}:${file.path}`;
    const existing = dbFilesByKey.get(key);

    if (!existing) {
      console.log(`  [CREATE] ${key}`);
      if (!isDryRun) await client.mutation(api.skills.upsertFile, file);
    } else if (existing.contentHash !== file.contentHash) {
      console.log(`  [UPDATE] ${key}`);
      if (!isDryRun) await client.mutation(api.skills.upsertFile, file);
    } else {
      console.log(`  [SKIP] ${key}`);
    }
    dbFilesByKey.delete(key);
  }

  for (const [key, file] of dbFilesByKey) {
    console.log(`  [DELETE] ${key}`);
    if (!isDryRun)
      await client.mutation(api.skills.deleteFile, {
        skillName: file.skillName,
        path: file.path,
      });
  }

  console.log(`\nDone: ${created} created, ${updated} updated, ${skipped} skipped`);
  if (isDryRun) console.log("(Dry run — no changes made)");
}

syncSkills().catch((err) => {
  console.error("Sync failed:", err);
  process.exit(1);
});
