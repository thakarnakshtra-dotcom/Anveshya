// Renders the wallpapers into public/wallpapers/ and completes
// src/data/wallpapers.json.   Usage:
//   npm run build:wallpapers              all of them
//   npm run build:wallpapers -- rose-nebula red-sun
//
// Premium pictures: only small previews are produced. Their full-size files
// are never created here, so they cannot be reached from the website.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { fragmentSource, shaders } from "./shaders.mjs";

const root = fileURLToPath(new URL("../../", import.meta.url));
const dataFile = `${root}src/data/wallpapers.json`;
const data = JSON.parse(readFileSync(dataFile, "utf8"));

const SHAPES = [
  { aspect: "16:9", tag: "16x9", free: [1920, 1080], premium: [3840, 2160], preview: [640, 360] },
  { aspect: "9:19.5", tag: "9x19", free: [1080, 2340], premium: [1440, 3120], preview: [360, 780] },
];

// Completes each entry; words already in the file are kept.
data.items = data.items.map(({ id, title, category, tier, credit, license, sourceUrl }) => ({
  id,
  title,
  category,
  credit: credit || data.defaults.credit,
  license: license || (tier === "premium" ? "Premium. Not yet available." : data.defaults.license),
  sourceUrl: sourceUrl || data.defaults.sourceUrl,
  tier,
  variants: SHAPES.map((shape) => {
    const [width, height] = shape[tier];
    return {
      aspect: shape.aspect,
      width,
      height,
      preview: `/wallpapers/preview/${id}-${shape.tag}.jpg`,
      ...(tier === "free" ? { download: `/wallpapers/hd/${id}-${width}x${height}.jpg` } : {}),
    };
  }),
}));

for (const item of data.items) {
  if (!shaders[item.id]) throw new Error(`No artwork for "${item.id}"`);
}

const only = process.argv.slice(2);
const browser = await chromium.launch({
  args: ["--use-angle=d3d11", "--ignore-gpu-blocklist", "--enable-gpu"],
});
const page = await browser.newPage();
await page.setContent("<canvas></canvas>");

// Draws in tiles, so that no single draw call runs long enough to be stopped.
async function render(id, width, height, quality) {
  return page.evaluate(
    ({ source, width, height, quality }) => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const gl = canvas.getContext("webgl2", { preserveDrawingBuffer: true, antialias: false });
      const shader = (type, text) => {
        const s = gl.createShader(type);
        gl.shaderSource(s, text);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
        return s;
      };
      const program = gl.createProgram();
      gl.attachShader(
        program,
        shader(gl.VERTEX_SHADER, "#version 300 es\nvoid main(){vec2 p=vec2((gl_VertexID<<1)&2,gl_VertexID&2);gl_Position=vec4(p*2.0-1.0,0.0,1.0);}")
      );
      gl.attachShader(program, shader(gl.FRAGMENT_SHADER, source));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
      gl.useProgram(program);
      gl.uniform2f(gl.getUniformLocation(program, "res"), width, height);
      gl.viewport(0, 0, width, height);
      gl.enable(gl.SCISSOR_TEST);
      const tile = 192;
      const pixel = new Uint8Array(4);
      for (let y = 0; y < height; y += tile) {
        for (let x = 0; x < width; x += tile) {
          gl.scissor(x, y, tile, tile);
          gl.drawArrays(gl.TRIANGLES, 0, 3);
          gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel); // wait for the GPU
        }
      }
      if (gl.isContextLost()) throw new Error("The graphics context was lost");
      const info = gl.getExtension("WEBGL_debug_renderer_info");
      const url = canvas.toDataURL("image/jpeg", quality);
      const renderer = info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : "unknown";
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      return { url, renderer };
    },
    { source: fragmentSource(id), width, height, quality }
  );
}

const save = (path, url) => writeFileSync(`${root}public${path}`, Buffer.from(url.split(",")[1], "base64"));
mkdirSync(`${root}public/wallpapers/hd`, { recursive: true });
mkdirSync(`${root}public/wallpapers/preview`, { recursive: true });

try {
  for (const item of data.items) {
    if (only.length && !only.includes(item.id)) continue;
    const started = Date.now();
    let renderer;
    for (const [index, shape] of SHAPES.entries()) {
      const variant = item.variants[index];
      const preview = await render(item.id, ...shape.preview, 0.84);
      save(variant.preview, preview.url);
      renderer = preview.renderer;
      if (item.tier === "free") {
        save(variant.download, (await render(item.id, variant.width, variant.height, 0.9)).url);
      }
    }
    console.log(`${item.id} (${item.tier}) ${((Date.now() - started) / 1000).toFixed(1)} s  [${renderer}]`);
  }
} finally {
  await browser.close();
}

// One variant per line keeps the file easy to read and edit.
const json = JSON.stringify(data, null, 2).replace(
  /\{\n\s+"aspect"[^}]*\}/g,
  (block) => block.replace(/\n\s+/g, " ")
);
writeFileSync(dataFile, `${json}\n`);
console.log("wallpapers.json updated");
