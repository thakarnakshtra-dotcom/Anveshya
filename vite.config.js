import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// Dev-only middleware that runs the real Netlify function handler in-process
// so `npm run dev` can hit the same /.netlify/functions/* path production
// uses, without needing the Netlify CLI installed. Production deploys use
// Netlify's own function runtime; this never ships in the built bundle.
function netlifyFunctionsDevMiddleware() {
  return {
    name: "netlify-functions-dev-middleware",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const match = req.url?.match(/^\/\.netlify\/functions\/([\w-]+)/);
        if (!match) return next();
        try {
          // Netlify's real runtime hands functions `event.body` as a string
          // (POST/PUT included) — the original version of this middleware
          // only ever forwarded GET-shaped calls (SolarShield needed
          // nothing else). The feedback function needs the request body,
          // so collect it here the same way Netlify's own runtime would.
          let body;
          if (req.method !== "GET" && req.method !== "HEAD") {
            const chunks = [];
            for await (const chunk of req) chunks.push(chunk);
            body = Buffer.concat(chunks).toString("utf8");
          }
          const mod = await server.ssrLoadModule(`/netlify/functions/${match[1]}.js`);
          const result = await mod.handler({
            httpMethod: req.method,
            queryStringParameters: {},
            headers: req.headers,
            body,
          });
          res.statusCode = result.statusCode || 200;
          for (const [key, value] of Object.entries(result.headers || {})) {
            res.setHeader(key, value);
          }
          res.end(result.body);
        } catch (err) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Dev function invocation failed", detail: String(err?.message || err) }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // Netlify functions loaded via ssrLoadModule above run in *this* Node
  // process, so they read secrets off `process.env` the same way they do
  // in Netlify's real runtime. Vite doesn't put plain (non VITE_-prefixed)
  // .env values there on its own — loadEnv() reads the .env file and this
  // copies them across, so a local `.env` with FEEDBACK_WEBHOOK_URL=...
  // works for `npm run dev` the same way a Netlify dashboard env var does
  // in production. Never logged, never sent to the client bundle.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ""));

  return {
    plugins: [react(), netlifyFunctionsDevMiddleware()],
    server: {
      port: process.env.PORT ? Number(process.env.PORT) : 5173,
    },
  };
});
