import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const root = "/workspace";
const versionLine = readFileSync(join(root, "VERSION"), "utf8").split("\n")[0];
const version = versionLine.match(/v\.\d+/)?.[0];
if (!version) throw new Error("VERSION is missing v.NNN");
const filename = `crabby-beach-${version}-code.md`;
const outPath = join(root, "public/downloads", filename);

const files = [
  "VERSION",
  "export-naming.md",
  "package.json",
  "tsconfig.json",
  "vite.config.ts",
  "startup.sh",
  "src/lib/asset.ts",
  "src/lib/offline.ts",
  "src/lib/settings.ts",
  "src/lib/progress.ts",
  "src/lib/version.ts",
  "src/router.tsx",
  "src/styles.css",
  "src/game/audio.ts",
  "src/game/engine.ts",
  "src/game/GameCanvas.tsx",
  "src/routes/__root.tsx",
  "src/routes/index.tsx",
  "src/routes/grownups.tsx",
];

function fenceLang(path) {
  if (path.endsWith(".ts") || path.endsWith(".tsx")) return "ts";
  if (path.endsWith(".css")) return "css";
  if (path.endsWith(".json")) return "json";
  if (path.endsWith(".sh")) return "sh";
  if (path.endsWith(".md")) return "md";
  return "";
}

const parts = [];
parts.push(`# Crabby Beach ${version} — code only`);
parts.push("");
parts.push("Reading / search / archive package. **Not runnable.** No art, audio files, or voice assets.");
parts.push("");
parts.push("## Table of contents");
parts.push("");
for (const file of files) {
  const anchor = file.replace(/[^\w]+/g, "-").replace(/^-|-$/g, "").toLowerCase();
  parts.push(`- [${file}](#${anchor})`);
}
parts.push("");

for (const file of files) {
  const body = readFileSync(join(root, file), "utf8").replace(/\s+$/, "");
  const lang = fenceLang(file);
  parts.push(`## ${file}`);
  parts.push("");
  parts.push("```" + lang);
  parts.push(body);
  parts.push("```");
  parts.push("");
}

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, parts.join("\n"));
console.log(`wrote ${outPath}`);
