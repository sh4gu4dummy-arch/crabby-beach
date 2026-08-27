import { createReadStream, existsSync, statSync } from "node:fs";
import { join } from "node:path";

/** Force /downloads/* to save as a file, never open as a page. */
export function downloadsPlugin() {
  const dir = "/workspace/public/downloads";

  function handle(req, res, next) {
    const pathOnly = (req.url ?? "").split("?", 1)[0] ?? "";
    if (!pathOnly.startsWith("/downloads/")) {
      next();
      return;
    }
    const name = decodeURIComponent(pathOnly.slice("/downloads/".length));
    if (!name || name.includes("..") || name.includes("/")) {
      res.statusCode = 404;
      res.end("Not found");
      return;
    }
    const file = join(dir, name);
    if (!existsSync(file) || !statSync(file).isFile()) {
      res.statusCode = 404;
      res.end("Not found");
      return;
    }
    const type = name.endsWith(".md")
      ? "text/markdown; charset=utf-8"
      : name.endsWith(".zip")
        ? "application/zip"
        : name.endsWith(".apk")
          ? "application/vnd.android.package-archive"
          : "application/octet-stream";
    res.statusCode = 200;
    res.setHeader("Content-Type", type);
    res.setHeader("Content-Disposition", `attachment; filename="${name}"`);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "no-store");
    createReadStream(file).pipe(res);
  }

  return {
    name: "crabby-downloads-attachment",
    configureServer(server) {
      server.middlewares.use(handle);
    },
  };
}
