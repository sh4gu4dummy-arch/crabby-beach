/**
 * Force /downloads/* to save as a file. Never open the app or render markdown.
 */
export default async function downloadsMiddleware(
  event: { url: URL; req: { method: string } },
  next: () => unknown | Promise<unknown>,
): Promise<unknown> {
  const method = (event.req.method ?? "GET").toUpperCase();
  if (method !== "GET" && method !== "HEAD") return next();

  const path = event.url.pathname;
  if (!path.startsWith("/downloads/")) return next();

  const name = decodeURIComponent(path.slice("/downloads/".length));
  if (!name || name.includes("..") || name.includes("/")) return next();

  const result = await next();
  if (!(result instanceof Response)) return result;

  const headers = new Headers(result.headers);
  headers.set("Content-Disposition", `attachment; filename="${name}"`);
  headers.set("X-Content-Type-Options", "nosniff");
  if (name.endsWith(".md")) {
    headers.set("Content-Type", "text/markdown; charset=utf-8");
  }
  return new Response(result.body, {
    status: result.status,
    statusText: result.statusText,
    headers,
  });
}
