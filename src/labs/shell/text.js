// Helpers for the lesson text in each lab's content.js. Every item is either a
// mathematical result or an educational analogy; "tex" is a LaTeX equation.
export const math = (text, tex) => ({ kind: "math", text, tex });
export const analogy = (text, tex) => ({ kind: "analogy", text, tex });

// The order and headings of a lesson, after the plain-language explanation.
export const SECTIONS = [
  ["see", "What you see"],
  ["equations", "Equations"],
  ["variables", "Variable definitions"],
  ["assumptions", "Model assumptions"],
  ["meaning", "What it means physically"],
  ["limits", "Limits of the model"],
];
