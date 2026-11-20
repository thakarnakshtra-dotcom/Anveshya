import React, { useId } from "react";
import Svg, { Circle, Defs, G, Line, Polygon, RadialGradient, Stop } from "react-native-svg";

// The Anveshya mark (ported from the website's BrandLogo.jsx): a ringed halo
// around a diagonal comet path with two star-burst nodes. `tint` recolours
// the strokes so the logo stays visible on the light theme.
//
// Every numeric attribute is a real number, not a string: on Android's new
// renderer a string like opacity="0.3" crashes with
// "java.lang.String cannot be cast to java.lang.Double".
export default function BrandLogo({ size = 30, tint = "#fff", fill = "#000" }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const haloId = `halo${uid}`;
  return (
    <Svg viewBox="228 28 544 544" width={size} height={size}>
      <Defs>
        <RadialGradient id={haloId} cx="50%" cy="50%" r="50%">
          <Stop offset={0.66} stopColor={tint} stopOpacity={0} />
          <Stop offset={0.82} stopColor={tint} stopOpacity={0.18} />
          <Stop offset={1} stopColor={tint} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={500} cy={300} r={272} fill={`url(#${haloId})`} />
      <Circle cx={500} cy={300} r={200} fill={fill} />
      <Circle cx={500} cy={300} r={200} fill="none" stroke={tint} strokeWidth={6} />
      <Circle cx={500} cy={300} r={213} fill="none" stroke={tint} strokeWidth={2} strokeOpacity={0.3} />
      <G fill={tint}>
        <Polygon points="247.6,105.8 496.9,303.6 736.4,482.2 503.1,296.4 246.4,104.2" />
        <Line x1={247} y1={105} x2={737} y2={483} stroke={tint} strokeWidth={2} strokeLinecap="round" />
        <Polygon points="325,199.6 344.4,179.8 359,156.4 339.6,176.2" />
        <Polygon points="317.8,167.2 342,175 366.2,188.8 342,181" />
        <Polygon points="633,455.6 661.2,424.4 683,388.4 654.8,419.6" />
        <Polygon points="623.6,408.4 658,419 692.4,435.6 658,425" />
        <Circle cx={342} cy={178} r={6} />
        <Circle cx={658} cy={422} r={8} />
      </G>
    </Svg>
  );
}
