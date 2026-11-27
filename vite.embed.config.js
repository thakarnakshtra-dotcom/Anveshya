// Builds the labs as ONE self-contained file, dist-embed/lab-embed.html, for
// the mobile app to bundle:  npm run build:labs
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

// Every font and image is inlined; keep only KaTeX's smallest font format.
function katexWoff2Only() {
  return {
    name: "katex-woff2-only",
    enforce: "pre",
    transform(code, id) {
      if (!id.includes("katex") || !id.split("?")[0].endsWith(".css")) return null;
      return code.replace(/,\s*url\([^)]*\.(?:woff|ttf)\)\s*format\(["'](?:woff|truetype)["']\)/g, "");
    },
  };
}

// Puts the script and styles inside the HTML file, and forbids the page from
// making any network request.
function singleFile() {
  const policy =
    "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; " +
    "font-src data:; img-src data: blob:; connect-src 'none'";
  return {
    name: "single-file",
    enforce: "post",
    generateBundle: {
      // Last, after Vite has finished writing into the code.
      order: "post",
      handler(_, bundle) {
        const page = Object.values(bundle).find((file) => file.fileName.endsWith(".html"));
        let html = String(page.source);
        const scripts = [];
        for (const [name, file] of Object.entries(bundle)) {
          if (file === page) continue;
          const reference = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          if (file.type === "chunk") {
            html = html.replace(new RegExp(`\\s*<script[^>]*${reference}[^>]*></script>`), "");
            scripts.push(file.code.replace(/<\/script/gi, "<\\/script"));
          } else if (name.endsWith(".css")) {
            html = html.replace(new RegExp(`<link[^>]*${reference}[^>]*>`), () => `<style>${file.source}</style>`);
          } else {
            this.error(`${name} was not inlined; the embed build must be a single file.`);
          }
          delete bundle[name];
        }
        html = html
          .replace(
            '<meta charset="UTF-8" />',
            () => `<meta charset="UTF-8" />\n    <meta http-equiv="Content-Security-Policy" content="${policy}" />`
          )
          .replace("</body>", () => `<script type="module">${scripts.join("\n")}</script>\n  </body>`);
        if (scripts.some((code) => code.includes("__VITE_"))) this.error("The script still has unfilled Vite placeholders.");
        page.source = html;
      },
    },
  };
}

export default defineConfig({
  plugins: [react(), katexWoff2Only(), singleFile()],
  base: "./",
  publicDir: false,
  build: {
    outDir: "dist-embed",
    emptyOutDir: true,
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
    modulePreload: false,
    chunkSizeWarningLimit: 5000,
    rollupOptions: {
      input: fileURLToPath(new URL("./lab-embed.html", import.meta.url)),
      output: { inlineDynamicImports: true },
    },
  },
});
