// The artwork behind /wallpapers. Every picture is computed here from
// mathematics and random noise: no photographs or other people's images.
// Each entry is a GLSL function "vec3 art(vec2 p)", where p is centred and the
// shorter side of the picture runs from -0.5 to 0.5.

const common = `
precision highp float;
uniform vec2 res;
out vec4 outColor;

float hash(vec3 p) {
  p = fract(p * 0.3183099 + vec3(0.11, 0.17, 0.23));
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float noise(vec3 p) {
  vec3 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
}
float fbm(vec3 p) {
  float sum = 0.0, amp = 0.5;
  for (int i = 0; i < 6; i++) {
    sum += amp * noise(p);
    p = p * 2.03 + vec3(1.7, 9.2, 3.1);
    amp *= 0.5;
  }
  return sum;
}
mat2 turn(float a) { return mat2(cos(a), -sin(a), sin(a), cos(a)); }

// Points of light on a grid of random cells.
vec3 starLayer(vec2 p, float scale, float amount, float size, float seed) {
  vec2 q = p * scale;
  vec2 cell = floor(q);
  vec3 total = vec3(0.0);
  for (int x = -1; x <= 1; x++) {
    for (int y = -1; y <= 1; y++) {
      vec2 c = cell + vec2(x, y);
      if (hash(vec3(c, seed)) > amount) continue;
      vec2 at = c + vec2(hash(vec3(c, seed + 1.3)), hash(vec3(c, seed + 2.9)));
      float bright = pow(hash(vec3(c, seed + 4.7)), 4.0) * 1.6 + 0.12;
      float d = length(q - at) / scale;
      float warm = hash(vec3(c, seed + 6.1));
      vec3 tint = mix(vec3(0.72, 0.82, 1.0), vec3(1.0, 0.85, 0.7), warm);
      total += tint * bright * exp(-pow(d / (size * (0.6 + bright * 0.5)), 2.0));
    }
  }
  return total;
}
vec3 stars(vec2 p, float seed) {
  return starLayer(p, 14.0, 0.12, 0.0022, seed) + starLayer(p, 40.0, 0.22, 0.0012, seed + 11.0)
       + starLayer(p, 110.0, 0.3, 0.0007, seed + 23.0) * 0.7;
}
// Stars seen in a direction (for pictures that bend light).
vec3 skyStars(vec3 d, float seed) {
  vec3 total = vec3(0.0);
  for (int layer = 0; layer < 2; layer++) {
    float scale = layer == 0 ? 55.0 : 130.0;
    vec3 q = d * scale;
    vec3 cell = floor(q);
    if (hash(cell + seed + float(layer)) > 0.14) continue;
    vec3 at = cell + 0.25 + 0.5 * vec3(hash(cell + 1.7), hash(cell + 4.1), hash(cell + 7.3));
    float bright = pow(hash(cell + 9.9), 3.0) * 1.5 + 0.25;
    total += mix(vec3(0.75, 0.84, 1.0), vec3(1.0, 0.86, 0.74), hash(cell + 3.3)) * bright * smoothstep(0.28, 0.0, length(q - at));
  }
  return total;
}
vec3 spike(vec2 p, vec2 at, float power, vec3 tint) {
  vec2 d = p - at;
  float core = exp(-dot(d, d) * 40000.0) * 1.4 + 0.00004 / (dot(d, d) + 0.00004) * 0.35;
  float cross = exp(-abs(d.y) * 900.0) * exp(-abs(d.x) * 28.0) + exp(-abs(d.x) * 900.0) * exp(-abs(d.y) * 28.0);
  return tint * (core + cross * 0.6) * power;
}
`;

const main = `
void main() {
  vec3 color = vec3(0.0);
  // four samples per pixel for smooth edges
  for (int i = 0; i < 4; i++) {
    vec2 jitter = vec2(float(i % 2), float(i / 2)) * 0.5 - 0.25;
    vec2 p = (gl_FragCoord.xy + jitter - 0.5 * res) / min(res.x, res.y);
    color += art(p);
  }
  color *= 0.25;
  color = color / (1.0 + max(color - 0.8, 0.0));            // soft highlights
  color += (hash(vec3(gl_FragCoord.xy, 1.0)) - 0.5) / 255.0; // hides banding
  outColor = vec4(color, 1.0);
}`;

// Light bent by a black hole (horizon radius 1) with a thin disk around it.
const blackHole = ({ distance, tilt, roll, zoom, hot, mid, cool, outer, drop = 0 }) => `
vec3 disk(vec3 hit, vec3 toEye) {
  float r = length(hit.xz);
  float a = atan(hit.z, hit.x);
  float swirl = a + 5.5 / sqrt(r);
  float streak = fbm(vec3(r * 2.6, cos(swirl) * 2.2, sin(swirl) * 2.2));
  float fine = noise(vec3(r * 11.0, cos(swirl) * 5.0, sin(swirl) * 5.0));
  float t = clamp((r - 3.0) / (${outer.toFixed(1)} - 3.0), 0.0, 1.0);
  vec3 base = mix(${hot}, ${mid}, smoothstep(0.0, 0.35, t));
  base = mix(base, ${cool}, smoothstep(0.3, 1.0, t));
  float glow = (1.0 - smoothstep(0.55, 1.0, t)) * smoothstep(0.0, 0.05, t);
  // material coming towards the viewer looks brighter
  vec3 velocity = normalize(vec3(-hit.z, 0.0, hit.x)) * sqrt(0.5 / r);
  float beaming = pow(1.0 + dot(velocity, toEye), 2.6);
  return base * glow * (0.35 + 1.3 * streak * streak + 0.3 * fine) * beaming * 2.1 / (0.7 + t * 1.6);
}

vec3 art(vec2 p) {
  if (res.y > res.x) p.y += ${drop.toFixed(2)};
  p = turn(${roll.toFixed(3)}) * p;
  float tilt = ${tilt.toFixed(3)};
  vec3 eye = ${distance.toFixed(1)} * vec3(0.0, sin(tilt), cos(tilt));
  vec3 forward = -normalize(eye);
  vec3 right = normalize(cross(forward, vec3(0.0, 1.0, 0.0)));
  vec3 up = cross(right, forward);
  float wide = res.y > res.x ? 0.72 : 1.0;
  vec3 v = normalize(forward + (p.x * right + p.y * up) / (${zoom.toFixed(2)} * wide));
  vec3 x = eye;
  vec3 h = cross(x, v);
  float h2 = dot(h, h);
  vec3 color = vec3(0.0);
  float through = 1.0;
  for (int i = 0; i < 520; i++) {
    float r = length(x);
    float dt = clamp(0.045 * r, 0.02, 1.2) * (abs(x.y) < 0.6 && r < ${(outer + 1).toFixed(1)} ? 0.6 : 1.0);
    vec3 previous = x;
    v += -1.5 * h2 * x / pow(r, 5.0) * dt;
    x += v * dt;
    if (previous.y * x.y < 0.0) {
      vec3 hit = mix(previous, x, previous.y / (previous.y - x.y));
      float rr = length(hit.xz);
      if (rr > 3.0 && rr < ${outer.toFixed(1)}) {
        color += through * disk(hit, -normalize(v));
        through *= 0.28;
      }
    }
    if (length(x) < 1.02) { through = 0.0; break; }
    if (r > 45.0 && dot(x, v) > 0.0) break;
  }
  color += through * skyStars(normalize(v), 5.0);
  return color;
}`;

export const shaders = {
  "rose-nebula": `
vec3 art(vec2 p) {
  vec2 q = vec2(fbm(vec3(p * 2.2, 1.0)), fbm(vec3(p * 2.2 + 5.2, 2.0)));
  vec2 r = vec2(fbm(vec3(p * 2.4 + 3.5 * q, 3.0)), fbm(vec3(p * 2.4 + 3.5 * q + 8.3, 4.0)));
  float cloud = fbm(vec3(p * 2.0 + 3.0 * r, 5.0));
  float shape = exp(-1.9 * pow(length((p - vec2(0.05, -0.02)) * vec2(0.8, 1.0)), 2.0));
  float d = smoothstep(0.28, 0.85, cloud) * shape * 1.5;
  vec3 color = vec3(0.012, 0.006, 0.014);
  color += mix(vec3(0.42, 0.03, 0.10), vec3(0.95, 0.35, 0.40), smoothstep(0.35, 0.75, r.x)) * d;
  color += vec3(1.0, 0.82, 0.68) * pow(max(0.0, cloud - 0.48) * 2.2, 2.0) * shape;
  color += vec3(0.10, 0.22, 0.45) * smoothstep(0.45, 0.8, q.y) * shape * 0.55;
  color *= 1.0 - 0.85 * smoothstep(0.5, 0.72, fbm(vec3(p * 4.5 + 2.0 * q, 9.0))) * shape;
  color += stars(p, 2.0) * (1.0 - 0.5 * d);
  color += spike(p, vec2(-0.21, 0.17), 1.0, vec3(0.9, 0.93, 1.0)) + spike(p, vec2(0.26, -0.2), 0.6, vec3(1.0, 0.85, 0.75));
  return color;
}`,

  "blue-veil": `
vec3 art(vec2 p) {
  vec2 s = turn(0.65) * p;
  vec2 q = vec2(fbm(vec3(s * 1.7, 11.0)), fbm(vec3(s * 1.7 + 4.0, 12.0)));
  vec2 w = s * vec2(1.6, 4.2) + 2.4 * q;
  float ridge = 1.0 - abs(2.0 * fbm(vec3(w, 13.0)) - 1.0);
  float ridge2 = 1.0 - abs(2.0 * fbm(vec3(w * 1.9 + 3.0, 14.0)) - 1.0);
  float band = exp(-pow((s.y + 0.18 * (q.x - 0.5)) * 3.1, 2.0));
  vec3 color = vec3(0.004, 0.009, 0.022);
  color += vec3(0.03, 0.16, 0.34) * band * (0.4 + fbm(vec3(s * 3.0, 15.0)));
  color += vec3(0.18, 0.72, 0.82) * pow(ridge, 9.0) * band * 1.1;
  color += vec3(0.65, 0.45, 0.95) * pow(ridge2, 12.0) * band * 0.8;
  color += vec3(0.85, 0.97, 1.0) * pow(ridge * ridge2, 14.0) * band;
  color += stars(p, 31.0);
  color += spike(p, vec2(0.24, 0.2), 0.8, vec3(0.85, 0.92, 1.0));
  return color;
}`,

  "spiral-galaxy": `
vec3 art(vec2 p) {
  vec2 q = turn(0.55) * (p - vec2(0.0, 0.0));
  if (res.y > res.x) q = turn(0.9) * q;
  q.y /= 0.52;
  float r = length(q);
  float a = atan(q.y, q.x);
  float wind = a - 3.1 * log(r + 0.02);
  vec2 spun = turn(-3.1 * log(r + 0.02)) * q;
  float clump = fbm(vec3(spun * 11.0, 21.0));
  float arm = pow(0.5 + 0.5 * cos(2.0 * wind + 1.4 * (clump - 0.5)), 3.0);
  float fade = exp(-r * 3.6);
  vec3 color = vec3(0.004, 0.005, 0.012);
  color += vec3(0.45, 0.62, 1.1) * arm * fade * (0.4 + 3.4 * clump * clump);
  color += vec3(0.5, 0.35, 0.35) * fade * 0.3;
  color += vec3(1.0, 0.84, 0.6) * (exp(-r * r * 260.0) * 1.3 + exp(-r * 15.0) * 0.75);
  float dust = smoothstep(0.5, 0.75, fbm(vec3(spun * 16.0 + 3.0, 22.0)));
  color *= 1.0 - 0.65 * dust * pow(0.5 + 0.5 * cos(2.0 * wind - 1.1), 2.0) * smoothstep(0.03, 0.12, r);
  float knots = smoothstep(0.68, 0.84, fbm(vec3(spun * 27.0, 23.0)));
  color += vec3(1.0, 0.38, 0.5) * knots * arm * fade * 2.2;
  color += starLayer(spun, 130.0, 0.5, 0.0012, 25.0) * (arm * 0.9 + 0.1) * fade * 2.2;
  color += stars(p, 27.0) * 0.8;
  return color;
}`,

  "edge-on-galaxy": `
vec3 art(vec2 p) {
  vec2 q = turn(res.y > res.x ? 1.05 : -0.22) * p;
  float warp = 0.015 * sin(q.x * 5.0) * abs(q.x);
  float y = q.y - warp;
  float length_ = exp(-pow(q.x / 0.52, 4.0));
  float thick = 0.017 + 0.03 * exp(-q.x * q.x * 30.0);
  float disk = exp(-abs(y) / thick) * length_;
  float bulge = exp(-sqrt(q.x * q.x * 55.0 + y * y * 150.0) * 1.15);
  float grain = fbm(vec3(q * vec2(14.0, 46.0), 31.0));
  vec3 color = vec3(0.004, 0.004, 0.011);
  color += vec3(0.55, 0.62, 0.95) * disk * (0.35 + 0.9 * grain);
  color += vec3(1.0, 0.8, 0.55) * bulge * 1.5;
  color += vec3(0.3, 0.2, 0.22) * exp(-length(q * vec2(1.6, 5.0)) * 4.0);
  float lane = exp(-pow((y + 0.004 + 0.012 * (fbm(vec3(q.x * 12.0, y * 30.0, 33.0)) - 0.5)) / 0.0125, 2.0));
  float ragged = smoothstep(0.25, 0.7, fbm(vec3(q * vec2(22.0, 70.0), 34.0)));
  color *= 1.0 - 0.93 * lane * ragged * length_;
  color += vec3(0.5, 0.13, 0.06) * lane * ragged * disk * 0.5;
  color += starLayer(q, 150.0, 0.45, 0.0009, 35.0) * disk * 1.2;
  color += stars(p, 37.0) * 0.9;
  color += spike(p, vec2(-0.27, 0.23), 0.7, vec3(0.9, 0.93, 1.0));
  return color;
}`,

  "accretion-disk": blackHole({
    distance: 17, tilt: 0.14, roll: -0.12, zoom: 1.45, outer: 11,
    hot: "vec3(1.0, 0.93, 0.85)", mid: "vec3(0.95, 0.38, 0.30)", cool: "vec3(0.38, 0.03, 0.10)",
  }),

  "golden-horizon": blackHole({
    distance: 19, tilt: 0.52, roll: 0.3, zoom: 1.4, outer: 10,
    hot: "vec3(1.0, 0.97, 0.88)", mid: "vec3(1.0, 0.62, 0.18)", cool: "vec3(0.35, 0.09, 0.02)",
  }),

  "ringed-giant": `
vec3 art(vec2 p) {
  bool tall = res.y > res.x;
  vec2 centre = tall ? vec2(0.02, -0.18) : vec2(0.18, -0.02);
  float size = tall ? 0.25 : 0.27;
  vec2 q = (p - centre) / size;
  vec3 light = normalize(vec3(-0.75, 0.42, 0.52));
  vec3 normalRing = normalize(vec3(-0.28, 0.9, 0.34));
  vec3 color = vec3(0.003, 0.004, 0.01) + stars(p, 41.0);

  float planetZ = -1e3;
  float r2 = dot(q, q);
  if (r2 < 1.0) {
    vec3 n = vec3(q, sqrt(1.0 - r2));
    planetZ = n.z;
    float lat = dot(n, normalRing);
    float swirl = fbm(vec3(n * 3.5 + vec3(0.0, lat * 6.0, 0.0)));
    float bands = fbm(vec3(lat * 9.0 + 0.7 * swirl, 2.0, 5.0));
    vec3 surface = mix(vec3(0.55, 0.22, 0.18), vec3(0.95, 0.78, 0.6), smoothstep(0.3, 0.7, bands));
    surface = mix(surface, vec3(0.36, 0.1, 0.13), smoothstep(0.52, 0.72, fbm(vec3(lat * 21.0 + swirl, 7.0, 1.0))));
    float day = smoothstep(-0.12, 0.65, dot(n, light));
    // shadow of the rings on the planet
    float t = -dot(n, normalRing) / dot(light, normalRing);
    float shade = 1.0;
    if (t > 0.0) {
      float rr = length(n + light * t);
      if (rr > 1.28 && rr < 2.25) shade = 1.0 - 0.7 * smoothstep(0.3, 0.7, noise(vec3(rr * 24.0, 0.5, 0.5)));
    }
    color = surface * (day * shade * 1.05 + 0.012);
    color += vec3(0.5, 0.55, 0.8) * pow(1.0 - n.z, 3.0) * day * 0.35;
  }

  // the ring plane, seen straight on
  float z = -dot(vec2(q), normalRing.xy) / normalRing.z;
  vec3 at = vec3(q, z);
  float rr = length(at);
  if (rr > 1.28 && rr < 2.25 && z > planetZ) {
    float density = noise(vec3(rr * 24.0, 0.5, 0.5)) * 0.65 + noise(vec3(rr * 90.0, 3.5, 0.5)) * 0.35;
    float gap = 1.0 - smoothstep(0.015, 0.03, abs(rr - 1.86));
    float alpha = clamp((density * 1.25 - 0.18) * (1.0 - gap) * smoothstep(1.28, 1.36, rr) * smoothstep(2.25, 2.12, rr), 0.0, 1.0);
    // shadow of the planet on the rings
    float along = dot(at, light);
    float miss = length(at - light * along);
    float lit = (along < 0.0 && miss < 1.0) ? 0.06 : 1.0;
    vec3 ring = mix(vec3(0.62, 0.4, 0.36), vec3(0.98, 0.9, 0.78), noise(vec3(rr * 11.0, 9.0, 2.0)));
    color = mix(color, ring * lit * 0.85, alpha);
  }
  return color;
}`,

  "crescent-world": `
vec3 art(vec2 p) {
  bool tall = res.y > res.x;
  vec2 centre = tall ? vec2(-0.2, -0.55) : vec2(-0.3, -0.42);
  float size = tall ? 0.68 : 0.7;
  vec2 q = (p - centre) / size;
  vec3 light = normalize(vec3(0.62, 0.6, -0.5));
  vec3 color = vec3(0.003, 0.004, 0.012) + stars(p, 51.0);
  float r = length(q);
  float side = clamp(dot(q / max(r, 1e-4), normalize(light.xy)) * 0.5 + 0.5, 0.0, 1.0);
  if (r < 1.0) {
    vec3 n = vec3(q, sqrt(1.0 - r * r));
    float land = fbm(n * 4.2 + 3.0);
    float fine = fbm(n * 15.0);
    vec3 surface = mix(vec3(0.10, 0.07, 0.12), vec3(0.62, 0.32, 0.28), smoothstep(0.35, 0.7, land));
    surface *= 0.6 + 0.8 * fine;
    float day = max(0.0, dot(n, light));
    color = surface * (day * 1.9 + 0.025);
    color += vec3(0.95, 0.4, 0.48) * pow(1.0 - n.z, 2.6) * pow(side, 3.0) * 1.3;
  } else {
    color += vec3(0.95, 0.35, 0.45) * exp(-(r - 1.0) * 28.0) * pow(side, 3.0) * 1.1;
    color += vec3(0.25, 0.35, 0.75) * exp(-(r - 1.0) * 9.0) * pow(side, 4.0) * 0.45;
  }
  vec2 moonAt = tall ? vec2(0.2, 0.34) : vec2(0.34, 0.2);
  vec2 m = (p - moonAt) / 0.05;
  if (length(m) < 1.0) {
    vec3 n = vec3(m, sqrt(1.0 - dot(m, m)));
    color = vec3(0.7, 0.68, 0.7) * (0.55 + 0.7 * fbm(n * 4.0)) * (max(0.0, dot(n, light)) * 1.7 + 0.02);
  }
  return color;
}`,

  "star-river": `
vec3 art(vec2 p) {
  vec2 q = turn(res.y > res.x ? 1.15 : 0.5) * p;
  float n = fbm(vec3(q * 3.2, 61.0));
  float band = exp(-pow((q.y + 0.14 * (n - 0.5)) * 3.4, 2.0));
  float dust = smoothstep(0.42, 0.68, fbm(vec3(q * vec2(4.0, 9.0) + n * 2.0, 62.0))) * exp(-pow(q.y * 7.0, 2.0));
  vec3 color = vec3(0.004, 0.006, 0.016);
  color += mix(vec3(0.18, 0.2, 0.36), vec3(0.55, 0.36, 0.3), fbm(vec3(q * 2.0, 63.0))) * band * (0.35 + 1.1 * n * n);
  color += vec3(0.95, 0.75, 0.55) * exp(-length((q - vec2(0.12, 0.0)) * vec2(2.2, 5.5)) * 2.4) * 0.55;
  vec3 many = starLayer(q, 190.0, 0.75, 0.0007, 64.0) + starLayer(q, 330.0, 0.8, 0.0005, 65.0) * 0.7;
  color += many * band * 1.1;
  color *= 1.0 - 0.86 * dust;
  color += stars(p, 66.0);
  color += spike(p, vec2(-0.23, -0.25), 0.9, vec3(0.85, 0.9, 1.0)) + spike(p, vec2(0.31, 0.27), 0.65, vec3(1.0, 0.88, 0.72));
  return color;
}`,

  "red-sun": `
vec3 art(vec2 p) {
  bool tall = res.y > res.x;
  vec2 centre = tall ? vec2(0.28, -0.62) : vec2(0.46, -0.3);
  float size = tall ? 0.6 : 0.55;
  vec2 q = (p - centre) / size;
  float r = length(q);
  vec3 color = vec3(0.006, 0.002, 0.004) + stars(p, 71.0) * smoothstep(1.0, 1.8, r);
  if (r < 1.0) {
    vec3 n = vec3(q, sqrt(1.0 - r * r));
    float big = fbm(n * 5.0);
    float cells = 1.0 - abs(2.0 * fbm(n * 19.0 + big) - 1.0);
    float spot = smoothstep(0.62, 0.74, fbm(n * 2.6 + 7.0));
    vec3 surface = mix(vec3(0.62, 0.05, 0.03), vec3(1.0, 0.55, 0.16), pow(cells, 2.0));
    surface += vec3(1.0, 0.8, 0.45) * pow(cells, 9.0) * 0.8;
    surface *= 1.0 - 0.72 * spot;
    color = surface * (0.35 + 0.8 * pow(n.z, 0.45));
  }
  float a = atan(q.y, q.x);
  float flare = fbm(vec3(cos(a) * 6.0, sin(a) * 6.0, r * 3.0));
  float outside = max(0.0, r - 0.99);
  color += vec3(1.0, 0.36, 0.1) * exp(-outside * 15.0) * step(0.99, r) * (0.35 + 1.4 * flare * flare);
  color += vec3(0.75, 0.1, 0.14) * exp(-outside * 3.4) * step(0.99, r) * flare * 0.65;
  return color;
}`,

  // Light traced through an Ellis wormhole (throat radius 1).
  "wormhole-window": `
vec3 sky(vec3 d, float side) {
  if (side > 0.0) {
    float band = exp(-12.0 * pow(d.y + 0.25 * d.x, 2.0));
    return vec3(0.006, 0.01, 0.024) + vec3(0.07, 0.11, 0.24) * band * (0.4 + fbm(d * 6.0)) + skyStars(d, 81.0);
  }
  float cloud = fbm(d * 2.6 + 3.0);
  vec3 color = vec3(0.03, 0.004, 0.012) + vec3(0.75, 0.12, 0.2) * pow(smoothstep(0.38, 0.8, cloud), 1.5);
  color += vec3(0.9, 0.55, 0.25) * pow(max(0.0, dot(d, normalize(vec3(0.45, 0.3, -0.8)))), 12.0);
  color += vec3(1.0, 0.75, 0.6) * pow(smoothstep(0.55, 0.85, fbm(d * 7.0)), 2.0) * 0.6;
  return color + skyStars(d, 82.0);
}
vec3 art(vec2 p) {
  float start = 2.3;
  vec3 d = normalize(vec3(p * (res.y > res.x ? 0.95 : 0.85), -1.0));
  float sideways = length(d.xy);
  vec3 axis = vec3(0.0, 0.0, 1.0);
  vec3 t = sideways > 1e-5 ? vec3(d.xy / sideways, 0.0) : vec3(1.0, 0.0, 0.0);
  float l = start, m = d.z, b = sqrt(start * start + 1.0) * sideways, phi = 0.0;
  for (int i = 0; i < 600; i++) {
    float r2 = l * l + 1.0;
    float h = 0.03 * sqrt(r2);
    float lh = l + 0.5 * h * m;
    float mh = m + 0.5 * h * b * b * l / (r2 * r2);
    float h2 = lh * lh + 1.0;
    l += h * mh;
    m += h * b * b * lh / (h2 * h2);
    phi += h * b / h2;
    if (abs(l) > 60.0 && l * m > 0.0) break;
  }
  vec3 radial = cos(phi) * axis + sin(phi) * t;
  vec3 across = -sin(phi) * axis + cos(phi) * t;
  vec3 direction = normalize((l > 0.0 ? m : -m) * radial + (b / sqrt(l * l + 1.0)) * across);
  return sky(direction, l);
}`,

  "spacetime-grid": `
float depth(vec2 g) { return -1.35 / (1.0 + dot(g, g) * 0.75); }
vec3 art(vec2 p) {
  bool tall = res.y > res.x;
  if (tall) p.y += 0.12;
  vec3 eye = vec3(0.0, 2.5, 5.4);
  vec3 forward = normalize(vec3(0.0, -0.75, 0.0) - eye);
  vec3 right = normalize(cross(forward, vec3(0.0, 1.0, 0.0)));
  vec3 up = cross(right, forward);
  vec3 v = normalize(forward + (p.x * right + p.y * up) * (tall ? 1.3 : 0.95));
  vec3 color = vec3(0.004, 0.003, 0.008) + stars(p, 91.0) * 0.8;
  // march the ray down to the curved sheet
  float t = 0.0, previous = 0.0;
  bool found = false;
  for (int i = 0; i < 400; i++) {
    vec3 x = eye + v * t;
    if (x.y < depth(x.xz)) { found = true; break; }
    previous = t;
    t += 0.04 + t * 0.002;
    if (t > 22.0) break;
  }
  if (found) {
    for (int i = 0; i < 18; i++) {
      float middle = 0.5 * (t + previous);
      vec3 x = eye + v * middle;
      if (x.y < depth(x.xz)) t = middle; else previous = middle;
    }
    vec3 x = eye + v * t;
    vec2 cell = abs(fract(x.xz * 2.4) - 0.5);
    float line = 1.0 - smoothstep(0.0, 0.012 + t * 0.0035, 0.5 - max(cell.x, cell.y));
    float near = exp(-dot(x.xz, x.xz) * 0.22);
    vec3 tint = mix(vec3(0.62, 0.1, 0.2), vec3(1.0, 0.9, 0.86), pow(near, 2.2));
    float fade = exp(-dot(x.xz, x.xz) * 0.028);
    color = mix(color * 0.25, tint * (0.3 + near), line * fade);
    color += vec3(0.45, 0.05, 0.12) * near * 0.35;
  }
  // the mass resting in the dip
  vec3 centre = vec3(0.0, depth(vec2(0.0)) + 0.5, 0.0);
  vec3 o = eye - centre;
  float b = dot(o, v);
  float disc = b * b - dot(o, o) + 0.25;
  if (disc > 0.0 && (!found || -b - sqrt(disc) < t)) {
    vec3 n = normalize(o + v * (-b - sqrt(disc)));
    float lit = max(0.0, dot(n, normalize(vec3(-0.6, 0.7, 0.5))));
    color = vec3(0.85, 0.18, 0.28) * (0.18 + lit) + vec3(1.0, 0.8, 0.75) * pow(1.0 - max(0.0, -dot(n, v)), 3.0) * 0.7;
  }
  float halo = length(cross(o, v));
  color += vec3(0.9, 0.2, 0.3) * exp(-max(0.0, halo - 0.5) * 3.2) * 0.22;
  return color;
}`,

  // ---------- premium tier: only small previews are ever produced ----------

  "deep-horizon": blackHole({
    distance: 11, tilt: 0.09, roll: 0.42, zoom: 1.15, outer: 9,
    hot: "vec3(0.92, 0.97, 1.0)", mid: "vec3(0.35, 0.6, 1.0)", cool: "vec3(0.06, 0.07, 0.35)",
  }),

  "aurora-drift": `
vec3 art(vec2 p) {
  vec3 color = vec3(0.004, 0.006, 0.018) + stars(p, 95.0);
  for (int i = 0; i < 5; i++) {
    float k = float(i);
    float wave = 0.17 * sin(p.x * (2.2 + 0.5 * k) + k * 1.7) + 0.22 * (fbm(vec3(p.x * 1.6, k, 96.0)) - 0.5) + (k - 2.0) * 0.07;
    float d = p.y - wave;
    float curtain = exp(-max(d, 0.0) * 7.0) * exp(-max(-d, 0.0) * 40.0);
    float rays = 0.45 + 0.9 * fbm(vec3(p.x * 34.0, k * 3.0, p.y * 2.0));
    vec3 tint = mix(vec3(0.15, 0.95, 0.65), vec3(0.75, 0.2, 0.55), k / 4.0);
    color += tint * curtain * rays * 0.42;
  }
  return color;
}`,
};

export const fragmentSource = (id) => `#version 300 es\n${common}\n${shaders[id]}\n${main}`;
