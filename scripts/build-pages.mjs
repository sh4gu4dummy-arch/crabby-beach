#!/usr/bin/env node
/**
 * Static Pages build for GitHub Pages (master) and Cloudflare Pages (public).
 *
 *   node scripts/build-pages.mjs github      -> base /crabby-beach/
 *   node scripts/build-pages.mjs cloudflare  -> base /
 *
 * Output: dist-pages/ (static HTML + assets; no _worker.js)
 * Excludes *.zip / *.apk (Cloudflare Pages 25MiB limit).
 *
 * HTML snapshot: try wrangler pages dev briefly; on timeout/failure write a
 * client shell index.html from built assets (never hang the Actions job).
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
const PAGES_DEV_MS = 45_000;

function log(...args) {
  console.log("[build-pages]", ...args);
}

function run(cmd, args) {
  log("run", cmd, args.join(" "));
  const r = spawnSync(cmd, args, { stdio: "inherit", cwd: root, env: process.env });
  if (r.status !== 0) throw new Error(`${cmd} ${args.join(" ")} failed: ${r.status}`);
}

function rewriteBase(html, toBase) {
  if (toBase === "/") return html;
  const basePath = toBase.endsWith("/") ? toBase : `${toBase}/`;
  const root = basePath.slice(0, -1); // e.g. /crabby-beach
  const esc = root.slice(1).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Only prefix root-absolute URLs that are not already under this base.
  const prefixAttr = (attr) =>
    html.replace(
      new RegExp(`${attr}="/(?!${esc}/)`, "g"),
      `${attr}="${basePath}`,
    );
  html = prefixAttr("href");
  html = prefixAttr("src");
  html = prefixAttr("content");
  // Collapse accidental doubles from earlier bad rewrites: /base/base/ -> /base/
  const doubled = `${root}/${root.slice(1)}/`;
  html = html.split(doubled).join(basePath);
  return html;
}

function copyDistSlim() {
  log("copy dist -> dist-pages (skip zip/apk)");
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.cpSync(path.join(root, "dist"), outDir, {
    recursive: true,
    filter: (src) => {
      if (/\.(zip|apk)$/i.test(src)) return false;
      // Keep raw cinema sources off Pages artifacts (size).
      if (src.includes(`${path.sep}cinema${path.sep}raw`)) return false;
      return true;
    },
  });
  fs.writeFileSync(path.join(outDir, ".nojekyll"), "");
}

function findAsset(prefix) {
  const dir = path.join(outDir, "assets");
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir).filter((f) => f.startsWith(prefix) && f.endsWith(".js")).sort();
  return files.length ? (base + "assets/" + files[files.length - 1]) : null;
}

function findCss() {
  const dir = path.join(outDir, "assets");
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".css")).sort();
  return files.length ? (base + "assets/" + files[files.length - 1]) : null;
}

function writeFallbackHtml() {
  const indexJs = findAsset("index-") || (base + "assets/index.js");
  const css = findCss();
  const head = [
    "<!DOCTYPE html>",
    '<html lang="en"><head>',
    '<meta charset="utf-8"/>',
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/>',
    "<title>Crabby Beach</title>",
    '<meta name="theme-color" content="#7EC8E3"/>',
  ];
  if (css) head.push(`<link rel="stylesheet" href="${css}"/>`);
  head.push(`<link rel="modulepreload" href="${indexJs}"/>`);
  head.push(`<link rel="icon" type="image/png" href="${base}icon-192.png"/>`);
  head.push("</head><body><div id=\"app\"></div>");
  head.push(`<script type="module" src="${indexJs}"></script></body></html>`);
  return head.join("");
}

function killStaleWrangler() {
  try { spawnSync("bash", ["-lc", "pkill -f \"wrangler pages dev\" || true"], { stdio: "ignore" }); } catch {}
}

async function snapshotViaPagesDev() {
  killStaleWrangler();
  const port = 8799 + Math.floor(Math.random() * 100);
  log("starting wrangler pages dev on", port);
  const child = spawn(
    "npx",
    ["wrangler", "pages", "dev", "dist-pages", "--port", String(port), "--ip", "127.0.0.1"],
    { cwd: root, env: process.env, stdio: ["ignore", "pipe", "pipe"] }
  );
  let buf = "";
  child.stdout.on("data", (d) => { buf += String(d); if (buf.length > 8000) buf = buf.slice(-4000); });
  child.stderr.on("data", (d) => { buf += String(d); if (buf.length > 8000) buf = buf.slice(-4000); });
  const started = Date.now();
  let home = null;
  let grownups = null;
  try {
    while (Date.now() - started < PAGES_DEV_MS) {
      try {
        const res = await fetch(`http://127.0.0.1:${port}/`, { signal: AbortSignal.timeout(2000) });
        if (res.ok) {
          home = await res.text();
          const g = await fetch(`http://127.0.0.1:${port}/grownups`, { signal: AbortSignal.timeout(5000) });
          grownups = g.ok ? await g.text() : home;
          log("pages dev snapshot ok in", Date.now() - started, "ms");
          break;
        }
      } catch {}
      await new Promise((r) => setTimeout(r, 400));
    }
  } finally {
    try { child.kill("SIGTERM"); } catch {}
  }
  if (!home) {
    log("pages dev timeout/fail; tail:", buf.slice(-1200));
    return null;
  }
  return { home, grownups: grownups || home };
}

async function main() {
  log("host=", host, "base=", base);
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
    log("npm run build ...");
    run("npm", ["run", "build"]);
  } finally {
    fs.writeFileSync(cfgPath, original);
    log("restored vite.config.ts");
  }
  if (!fs.existsSync(path.join(root, "dist"))) throw new Error("dist/ missing after build");
  copyDistSlim();
  const snapped = await snapshotViaPagesDev();
  let indexHtml, grownupsHtml;
  if (snapped) {
    indexHtml = host === "github" ? rewriteBase(snapped.home, base) : snapped.home;
    grownupsHtml = host === "github" ? rewriteBase(snapped.grownups, base) : snapped.grownups;
  } else {
    log("using fallback client shell HTML");
    indexHtml = writeFallbackHtml();
    grownupsHtml = indexHtml;
  }
  fs.writeFileSync(path.join(outDir, "index.html"), indexHtml);
  fs.writeFileSync(path.join(outDir, "404.html"), indexHtml);
  fs.mkdirSync(path.join(outDir, "grownups"), { recursive: true });
  fs.writeFileSync(path.join(outDir, "grownups", "index.html"), grownupsHtml);
  fs.rmSync(path.join(outDir, "_worker.js"), { recursive: true, force: true });
  fs.rmSync(path.join(outDir, "_routes.json"), { force: true });
  fs.rmSync(path.join(outDir, "nitro.json"), { force: true });
  log("wrote", outDir, "index.html bytes=", fs.statSync(path.join(outDir, "index.html")).size);
}

main().catch((err) => { console.error(err); process.exit(1); });
