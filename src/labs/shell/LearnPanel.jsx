import React from "react";
import Equation from "./Equation.jsx";
import { SECTIONS } from "./text.js";

const KINDS = { math: "Mathematical result", analogy: "Educational analogy" };

function Item({ kind, tex, text }) {
  return (
    <li className="lab-learn-item">
      <span className={`lab-kind lab-kind-${kind}`}>{KINDS[kind]}</span>
      {tex ? <Equation tex={tex} block /> : null}
      <p>{text}</p>
    </li>
  );
}

// Plain-language explanation first, then the sections, then Try and Ask.
export default function LearnPanel({ learn }) {
  return (
    <div className="lab-learn">
      <ul>
        {learn.plain.map((item) => (
          <Item key={item.text} {...item} />
        ))}
      </ul>
      {SECTIONS.map(([key, title]) => (
        <section key={key}>
          <h3>{title}</h3>
          <ul>
            {learn[key].map((item) => (
              <Item key={item.tex || item.text} {...item} />
            ))}
          </ul>
        </section>
      ))}
      {[
        ["Try", learn.try],
        ["Ask", learn.ask],
      ].map(([title, prompts]) => (
        <section key={title}>
          <h3>{title}</h3>
          <ul>
            {prompts.map((prompt) => (
              <li key={prompt} className="lab-prompt">
                {prompt}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
