# Anveshya — Mobile App (Phase 1)

The Cosmic Parivar app, built with Expo SDK 58, React Navigation 7, Reanimated 4 and AsyncStorage.

## Run it

```bash
cd mobile
npm install
npx expo start        # scan the QR code with Expo Go, or press a / i / w
```

## Structure

```
mobile/
├─ App.js                       fonts → cosmic splash → navigation
├─ app.json                     name, dark splash, font plugin
├─ assets/
│  ├─ fonts/Anallop.ttf, Anallop-Italic.ttf
│  └─ textures/                 planet maps (shared with the website)
└─ src/
   ├─ theme/                    colors.js (spec palettes), ThemeContext (AsyncStorage), fontCoverage.js
   ├─ state/                    UserContext (local profile), SocialContext (feed + chats)
   ├─ components/               AppText, TopBar, TabBar, Avatar, BrandLogo, ShareSheet, ui
   ├─ screens/                  CosmicSplash, Home, Share, Chat, Profile, WebSectionScreen (Explore/Learn/News)
   ├─ web/                      site.js (URL, tab→page map, injected CSS), WebPage (native WebView / web iframe)
   └─ data/social.js            sample feed + chat data
```

## Notes

- **Font:** every label goes through `AppText`, which uses Anallop. This build of Anallop draws its digits as placeholder boxes and has no `— … ° ×` or Sanskrit diacritics, so `AppText` automatically renders only those characters in the system font. Text inputs use the system font so typed numbers stay readable. With a full licensed Anallop, regenerate `src/theme/fontCoverage.js` and the fallback goes away.
- **Home & Share** run on local sample data (`src/data/social.js`) held in `SocialContext`. Likes, comments, sending messages and sharing a post to a friend all work in-app, but nothing is saved or sent anywhere yet. Phase 2 can replace `SocialContext` with a real backend (e.g. Supabase realtime) without changing the screens.
- **Reels** are preview cards; video playback is Phase 2.
- **Explore / Learn / News show the live website** (anveshya.space) in a WebView (`src/web/`). The site's header, menu and footer are hidden so the app's own bars take over, and its intro and feedback popup are skipped. Chips at the top switch between pages: Explore → Solar System, Solar Shield, Discover; Learn → Learn, Sounds of Space. About / Privacy / Terms open from Profile. Any website update shows up in the app with no app release. These tabs need internet.
- In the **web preview** (`npm run web`) those pages are iframes and still show the site header; on iOS/Android it's hidden.
