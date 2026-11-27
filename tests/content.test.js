// Checks every lab's words: each experiment has the full lesson, every item is
// labelled, every equation can be drawn, and every welcome example exists.
import assert from "node:assert/strict";
import { test } from "node:test";
import katex from "katex";
import { labs } from "../src/labs/registry.js";
import { SECTIONS } from "../src/labs/shell/text.js";

for (const { slug } of labs) {
  test(`${slug}: lessons are complete and equations are valid`, async (t) => {
    const content = (await import(`../src/labs/${slug}/content.js`)).default;
    assert.ok(content.welcomeTitle && content.welcomeText);
    let equations = 0;

    for (const [id, experiment] of Object.entries(content.experiments)) {
      assert.ok(experiment.name && experiment.summary, `${id}: name and summary`);
      assert.ok(experiment.presets.length, `${id}: presets`);
      const { learn } = experiment;
      assert.ok(learn.try.length && learn.ask.length, `${id}: Try and Ask`);
      for (const key of ["plain", ...SECTIONS.map(([name]) => name)]) {
        assert.ok(learn[key]?.length, `${id}: section "${key}"`);
        for (const item of learn[key]) {
          assert.ok(item.kind === "math" || item.kind === "analogy", `${id}/${key}: label`);
          assert.ok(item.text, `${id}/${key}: text`);
          if (item.tex) {
            equations++;
            assert.doesNotThrow(() => katex.renderToString(item.tex, { throwOnError: true }), `${id}: ${item.tex}`);
          }
        }
      }
    }

    for (const entry of content.examples) {
      const [experiment, preset] = entry.split(":");
      assert.ok(content.experiments[experiment]?.presets.some((p) => p.id === preset), `example ${entry}`);
    }
    t.diagnostic(`${Object.keys(content.experiments).length} experiments, ${equations} equations`);
  });
}
