// Checks the wallpaper list: every field is filled in, free files exist at the
// stated size, and no premium full-size file or link exists anywhere.
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const data = JSON.parse(readFileSync(`${root}src/data/wallpapers.json`, "utf8"));
const file = (url) => `${root}public${url}`;

// Width and height stored in a JPEG's frame header.
function jpegSize(path) {
  const bytes = readFileSync(path);
  assert.equal(bytes.readUInt16BE(0), 0xffd8, `${path} is a JPEG`);
  let at = 2;
  while (at < bytes.length) {
    const marker = bytes.readUInt16BE(at);
    if (marker >= 0xffc0 && marker <= 0xffc3) return [bytes.readUInt16BE(at + 7), bytes.readUInt16BE(at + 5)];
    at += 2 + bytes.readUInt16BE(at + 2);
  }
  throw new Error(`No size found in ${path}`);
}

test("every wallpaper has all its details", () => {
  const ids = new Set();
  for (const item of data.items) {
    for (const key of ["id", "title", "category", "credit", "license", "sourceUrl", "tier"]) {
      assert.ok(item[key], `${item.id}: ${key}`);
    }
    assert.ok(!ids.has(item.id), `duplicate ${item.id}`);
    ids.add(item.id);
    assert.ok(data.categories.includes(item.category), `${item.id}: category`);
    assert.ok(["free", "premium"].includes(item.tier), `${item.id}: tier`);
    assert.deepEqual(item.variants.map((v) => v.aspect), ["16:9", "9:19.5"], `${item.id}: shapes`);
    for (const variant of item.variants) {
      const [a, b] = variant.aspect.split(":").map(Number);
      assert.ok(Math.abs(variant.width / variant.height - a / b) < 0.002, `${item.id}: ${variant.aspect}`);
      assert.ok(existsSync(file(variant.preview)), `${item.id}: preview file`);
    }
  }
});

test("every category has a free wallpaper", () => {
  for (const category of data.categories) {
    assert.ok(data.items.some((item) => item.tier === "free" && item.category === category), category);
  }
});

test("free downloads exist at the stated size", (t) => {
  let count = 0;
  for (const item of data.items.filter((entry) => entry.tier === "free")) {
    for (const variant of item.variants) {
      assert.deepEqual(jpegSize(file(variant.download)), [variant.width, variant.height], variant.download);
      count++;
    }
  }
  t.diagnostic(`${count} downloadable files checked`);
});

test("premium wallpapers have no full-size file or download link", () => {
  const premium = data.items.filter((item) => item.tier === "premium");
  const downloads = readdirSync(`${root}public/wallpapers/hd`);
  for (const item of premium) {
    assert.ok(item.variants.every((variant) => !("download" in variant)), `${item.id}: no link`);
    assert.ok(!downloads.some((name) => name.startsWith(item.id)), `${item.id}: no file`);
    for (const variant of item.variants) {
      const [width, height] = jpegSize(file(variant.preview));
      assert.ok(width <= 640 && height <= 780, `${item.id}: preview stays small`);
    }
  }
});
