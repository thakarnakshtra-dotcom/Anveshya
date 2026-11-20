import React from "react";
import { Platform, Text, TextInput } from "react-native";
import { useTheme } from "../theme/ThemeContext";
import { fonts } from "../theme/colors";
import { ANALLOP_CHARS } from "../theme/fontCoverage";

// System font used for characters Anallop can't draw (its digits are
// placeholder boxes, and it has no —, …, °, ×, or Sanskrit diacritics).
export const FALLBACK_FONT = Platform.select({ ios: "System", android: "sans-serif", default: "system-ui, sans-serif" });

const isNeutral = (ch) => ch === " " || ch === "\n" || ch === "\t";

// Split a string into runs Anallop can render vs. runs that need the
// fallback font. Whitespace sticks to whatever run it's in.
function splitRuns(str) {
  const runs = [];
  let cur = "";
  let curOk = null;
  for (const ch of str) {
    const ok = isNeutral(ch) ? curOk ?? true : ANALLOP_CHARS.has(ch);
    if (curOk === null || ok === curOk) {
      cur += ch;
      curOk = ok;
    } else {
      runs.push([cur, curOk]);
      cur = ch;
      curOk = ok;
    }
  }
  if (cur) runs.push([cur, curOk ?? true]);
  return runs;
}

function withFallback(children) {
  return React.Children.map(children, (child) => {
    if (typeof child === "number") child = String(child);
    if (typeof child !== "string") return child;
    const runs = splitRuns(child);
    if (runs.length === 1 && runs[0][1]) return child;
    return runs.map(([text, ok], i) =>
      ok ? text : (
        <Text key={i} style={{ fontFamily: FALLBACK_FONT }}>
          {text}
        </Text>
      )
    );
  });
}

// Every piece of text in the app goes through AppText.
//   default  → Poppins Light (thin, never bold)
//   medium   → Poppins Regular, for names and labels (still not bold)
//   title    → Anallop, only for titles / headings
// fontWeight is always stripped: the font file itself sets the weight.
export default function AppText({ style, italic, muted, color, size, title, medium, children, ...rest }) {
  const { colors } = useTheme();
  const family = title
    ? italic
      ? fonts.titleItalic
      : fonts.title
    : italic
      ? fonts.bodyItalic
      : medium
        ? fonts.medium
        : fonts.body;
  return (
    <Text
      {...rest}
      style={[
        {
          fontFamily: family,
          color: color || (muted ? colors.textMuted : colors.text),
          fontSize: size || 15,
        },
        style,
        { fontWeight: undefined },
      ]}
    >
      {/* Anallop's digits are placeholder boxes, so only titles need the per-character fallback */}
      {title ? withFallback(children) : children}
    </Text>
  );
}

// Inputs use the same thin body font (Poppins has real digits).
export function AppTextInput({ style, ...rest }) {
  const { colors } = useTheme();
  return (
    <TextInput
      placeholderTextColor={colors.inactive}
      selectionColor={colors.primary}
      cursorColor={colors.primary}
      selectionHandleColor={colors.primary}
      {...rest}
      style={[{ fontFamily: fonts.body, color: colors.text, fontSize: 15 }, style]}
    />
  );
}
