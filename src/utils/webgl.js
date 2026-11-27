// "?static=1" forces the no-WebGL version so it can be checked in any browser.
export function supportsWebGL() {
  try {
    if (new URLSearchParams(window.location.search).get("static") === "1") return false;
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return Boolean(gl);
  } catch {
    return false;
  }
}
