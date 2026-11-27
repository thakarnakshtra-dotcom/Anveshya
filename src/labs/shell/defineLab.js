// A lab module is { slug, content, experiments }.
//
// content.js holds the words: each experiment's name, summary, presets and
// lesson, keyed by experiment id. The code gives each id its controls and
// picture:
//   { id, params, outputs(values, state), Scene, legend, note, caption(values),
//     camera: { radius or across+up, tilt, turn } or (values) => that,
//     view: "orbit"|"look",
//     Chart, advance(values, seconds), stars, dpr }
export function defineLab({ slug, content, experiments }) {
  return {
    slug,
    content,
    experiments: experiments.map((experiment) => {
      const words = content.experiments[experiment.id];
      if (!words) throw new Error(`${slug}: no text for experiment "${experiment.id}"`);
      return { params: [], stars: true, ...words, ...experiment };
    }),
  };
}

export const defaultValues = (experiment) =>
  Object.fromEntries(experiment.params.map((param) => [param.id, param.default]));
