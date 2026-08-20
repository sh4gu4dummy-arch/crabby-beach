/**
 * Build zip packages. Run ONLY when the user explicitly asks for exports.
 * Never hook this to a save, start, or version bump.
 *
 *   node scripts/export-packages.mjs
 *
 * Writes:
 *   public/downloads/crabby-beach-<version>-codebase.zip
 *   public/downloads/crabby-beach-<version>-portable.zip
 *   public/downloads/crabby-beach-<version>-android.zip
 *
 * Does not invent a fake .apk.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

const version = readFileSync(join("/workspace", "VERSION"), "utf8").trim().split(/\s+/).pop();
console.log(
  `Export requested for ${version}. This script is a placeholder until a zip is asked for.`,
);
process.exit(1);
