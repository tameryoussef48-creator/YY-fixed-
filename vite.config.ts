// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import type { Plugin } from "vite";

function apiMiddlewarePlugin(): Plugin {
  return {
    name: "api-middleware-plugin",
    configureServer(server) {
      // Dev-only: routes the API through the same hardened handler used in production.
      server.middlewares.use(async (req, res, next) => {
        if (!(req.url || "").startsWith("/api/convert-whiteboard-image")) return next();
        try {
          const chunks: Buffer[] = [];
          let size = 0;
          for await (const chunk of req) {
            size += (chunk as Buffer).length;
            if (size > 5_000_000) {
              res.statusCode = 413;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ error: "Image is too large." }));
              return;
            }
            chunks.push(chunk as Buffer);
          }
          const headers = new Headers();
          for (const [k, v] of Object.entries(req.headers)) {
            if (typeof v === "string") headers.set(k, v);
          }
          const method = req.method || "GET";
          const request = new Request(`http://${req.headers.host || "localhost"}${req.url}`, {
            method,
            headers,
            ...(method === "GET" || method === "HEAD" ? {} : { body: Buffer.concat(chunks) }),
          });
          const mod = await server.ssrLoadModule("/src/server/convert-handler.ts");
          const response: Response = await mod.handleConvertRequest(request);
          res.statusCode = response.status;
          response.headers.forEach((v, k) => res.setHeader(k, v));
          res.end(Buffer.from(await response.arrayBuffer()));
        } catch (err) {
          console.error("API handler error:", err);
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Internal server error" }));
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [apiMiddlewarePlugin()],
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
