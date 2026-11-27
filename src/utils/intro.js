// Kept apart from RingSystem.jsx so deciding whether to play the intro does
// not pull three.js into the first download.
const INTRO_FLAG = "anveshya-intro-seen";

export function shouldPlayIntro() {
  try {
    if (sessionStorage.getItem(INTRO_FLAG)) return false;
    sessionStorage.setItem(INTRO_FLAG, "1");
    return true;
  } catch {
    return false;
  }
}
