# Solar System Model

A shareable React + Vite + Three.js model of the eight planets orbiting an emissive sun, with selectable planet facts, textured planets, clouds, rings, atmospheric glow, bloom, scale modes, and eased camera fly-to controls.

## Run

```bash
npm install
npm run dev
```

Build a static copy:

```bash
npm run build
npm run preview
```

## Texture Sources and License

Planet, sun, Earth-cloud, and ring textures are from [Solar System Scope Textures](https://www.solarsystemscope.com/textures/), distributed under [Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/). Solar System Scope notes that the pack is based on NASA elevation and imagery data, with colors/shading adjusted and unmapped gaps filled for visual continuity.

Textures used:

- `2k_sun.jpg`
- `2k_mercury.jpg`
- `2k_venus_surface.jpg`
- `2k_venus_atmosphere.jpg`
- `2k_earth_daymap.jpg`
- `2k_earth_clouds.jpg`
- `2k_mars.jpg`
- `2k_jupiter.jpg`
- `2k_saturn.jpg`
- `2k_saturn_ring_alpha.png`
- `2k_uranus.jpg`
- `2k_neptune.jpg`

## Scientific Data Sources

Planet radii, orbital distances, rotation/orbital periods, masses, gravity, moon counts, ring presence, and primary atmospheric constituents are based on NASA Solar System Exploration Planet Compare and NASA/JPL planetary data. Some values are rounded for readable UI labels and relative scene scaling.
