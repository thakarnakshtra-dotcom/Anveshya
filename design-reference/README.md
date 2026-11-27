# Anveshya design reference

The app's look, in one place, for the website and the labs. Edit `tokens.js`
to change it.

| Value | Source | Status |
|---|---|---|
| Colors (dark and light) | `mobile/src/theme/colors.js` | Copied |
| Corner radii | `mobile/src/theme/colors.js` | Copied |
| Raised card | `mobile/src/web/themeEngine.js` | Copied |
| Accent text (dark) | App value `#C04A5A` lightened to `#DE808C` for readable small text | **Derived, please check** |
| Hover maroon | Lightened from the app maroon | **Derived, please check** |
| Spacing scale | Most common paddings/margins/gaps in `mobile/src` | **Derived, please check** |
| Shadows | `components/TopBar.js`, `stargazing/PassAlert.js` | **Derived, please check** |

The chat bubble colors from the app are left out because the website has no chat.
If the app palette changes, update `tokens.js` too (it is a copy).

## Rules carried over from the app

- Anallop is for titles only. Body text is Poppins Light. No bold.
- Anallop has no usable digits, and its accented letters are drawn without
  accents (checked in the browser: "Schrödinger" showed as "Schrodinger").
  `src/theme/fonts.css` limits it to what it draws correctly: numbers and
  symbols fall back to Poppins Light, accented title letters to Poppins
  SemiBold. The app uses the same font, so it likely has the accent issue too.
- Accent is maroon, never bright red.

## Fonts

| File | Rights |
|---|---|
| `fonts/Anallop.ttf`, `fonts/Anallop-Italic.ttf` | © Marvadesign (designer: Febrie Setiawan). Supplied by the site owner. **No license text was included** with the files, so confirm the license allows web use before publishing. |
| `fonts/Poppins-*.ttf` | SIL Open Font License 1.1, see `fonts/Poppins-LICENSE.txt` |
