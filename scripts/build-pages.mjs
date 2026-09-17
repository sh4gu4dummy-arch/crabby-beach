#!/usr/bin/env node
/**
 * Static Pages build for GitHub Pages (master) and Cloudflare Pages (public).
 *
 *   node scripts/build-pages.mjs github      -> base /crabby-beach/
 *   node scripts/build-pages.mjs cloudflare  -> base /
 *
 * Output: dist-pages/ (static HTML + assets; no _worker.js)
 * Excludes *.zip / *.apk (Cloudflare Pages 25MiB limit).
 */
import { spawnSync, spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const host = (process.argv[2] || process.env.PAGES_HOST || "cloudflare").toLowerCase();
const base = host === "github" ? "/crabby-beach/" : "/";
const outDir = path.join(root, "dist-pages");

function run(cmd, args) {
  const r = spawnSync(cmd, args, { stdio: "inherit", cwd: root, env: process.env });
  if (r.status !== 0) throw new Error(`${cmd} ${args.join(" ")} failed: ${r.status}`);
}

function rewriteBase(html, toBase) {
  return html
    .replaceAll(`href="/`, `href="${toBase}`)
    .replaceAll(`src="/`, `src="${toBase}`)
    .replaceAll(`content="/`, `content="${toBase}`);
}

function copyDistSlim() {
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.cpSync(path.join(root, "dist"), outDir, {
    recursive: true,
    filter: (src) => !/\.(zip|apk)$/i.test(src),
  });
}

async function waitForServer(port) {
  const started = Date.now();
  while (Date.now() - started < 60000) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/`);
      if (res.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error("wrangler pages dev did not become ready");
}

async function main() {
  console.log(`[build-pages] host=${host} base=${base}`);
  const cfgPath = path.join(root, "vite.config.ts");
  const original = fs.readFileSync(cfgPath, "utf8");
  let patched = original.replace(/preset:\s*"[^"]+"/, 'preset: "cloudflare-pages"');
  if (host === "github") {
    if (/^\s*base:\s*/m.test(patched)) {
      patched = patched.replace(/base:\s*[^,\n]+/, `base: ${JSON.stringify(base)}`);
    } else {
      patched = patched.replace(
        "export default defineConfig(({ command }) => ({",
        `export default defineConfig(({ command }) => ({\n  base: ${JSON.stringify(base)},`
      );
    }
  }
  fs.writeFileSync(cfgPath, patched);

  try {
    run("npm", ["run", "build"]);
  } finally {
    fs.writeFileSync(cfgPath, original);
  }

  if (!fs.existsSync(path.join(root, "dist"))) throw new Error("dist/ missing after build");
  copyDistSlim();

  const port = 8799;
  const child = spawn(
    "npx",
    ["wrangler", "pages", "dev", "dist-pages", "--port", String(port)],
    { cwd: root, env: process.env, stdio: ["ignore", "pipe", "pipe"] }
  );
  try {
    await waitForServer(port);
    const home = await (await fetch(`http://127.0.0.1:${port}/`)).text();
    const grownups = await (await fetch(`http://127.0.0.1:${port}/grownups`)).text();
    const indexHtml = host === "github" ? rewriteBase(home, base) : home;
    fs.writeFileSync(path.join(outDir, "index.html"), indexHtml);
    fs.writeFileSync(path.join(outDir, "404.html"), indexHtml);
    fs.mkdirSync(path.join(outDir, "grownups"), { recursive: true });
    fs.writeFileSync(
      path.join(outDir, "grownups", "index.html"),
      host === "github" ? rewriteBase(grownups, base) : grownups
    );
  } finally {
    child.kill("SIGTERM");
  }

  fs.rmSync(path.join(outDir, "_worker.js"), { recursive: true, force: true });
  fs.rmSync(path.join(outDir, "_routes.json"), { force: true });
  fs.rmSync(path.join(outDir, "nitro.json"), { force: true });
  console.log(`[build-pages] wrote ${outDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
