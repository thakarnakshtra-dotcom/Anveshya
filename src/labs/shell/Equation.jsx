import katex from "katex";
import "katex/dist/katex.min.css";
import React, { useMemo } from "react";

// An equation drawn with KaTeX. The LaTeX comes from the lab's content file.
export default function Equation({ tex, block = false }) {
  const html = useMemo(
    () => katex.renderToString(tex, { displayMode: block, throwOnError: false }),
    [tex, block]
  );
  const Tag = block ? "div" : "span";
  return <Tag className={block ? "lab-equation-block" : "lab-equation"} dangerouslySetInnerHTML={{ __html: html }} />;
}
