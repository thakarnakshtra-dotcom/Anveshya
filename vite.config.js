import { defineConfig } from "vite";
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
          const mod = await server.ssrLoadModule(`/netlify/functions/${match[1]}.js`);
          const result = await mod.handler({ httpMethod: req.method, queryStringParameters: {} });
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

export default defineConfig({
  plugins: [react(), netlifyFunctionsDevMiddleware()],
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
  },
});
