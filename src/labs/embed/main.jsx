// Entry of lab-embed.html: one lab, full screen, with no website around it.
//   lab-embed.html?lab=<slug>&theme=dark|light&experiment=<id (optional)>
import React from "react";
import { createRoot } from "react-dom/client";
import { palettes } from "../../../design-reference/tokens.js";
import "../../theme/fonts.css";
import LabRunner from "../shell/LabRunner.jsx";
import { postToHost } from "./host.js";

const params = new URLSearchParams(window.location.search);
const slug = params.get("lab") || "";
const theme = params.get("theme") === "light" ? "light" : "dark";

document.body.style.background = palettes[theme].background;

const ready = () => postToHost("ready", slug);
const close = () => {
  // Opened directly in a browser there is nobody to tell, so go back instead.
  if (!postToHost("close", slug)) window.history.back();
};

createRoot(document.getElementById("root")).render(
  <LabRunner slug={slug} theme={theme} experiment={params.get("experiment")} onReady={ready} onClose={close} />
);
