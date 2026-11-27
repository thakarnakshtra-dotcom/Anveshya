// Features that are built but switched off.

// Premium wallpapers: shows the premium cards and their "not open yet" state.
// There is no payment code, and no full-size premium files exist.
// To preview it:  VITE_PREMIUM_WALLPAPERS=true npm run dev
export const PREMIUM_WALLPAPERS = import.meta.env.VITE_PREMIUM_WALLPAPERS === "true";
