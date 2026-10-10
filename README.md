# Inclusive Layout

A free, private web app for reviewing UI screenshots through Microsoft's inclusive design persona spectrum: permanent, temporary and situational exclusion across vision, motor and hearing.

Everything runs in the browser. No backend, no external APIs, no login, no analytics. Screenshots never leave the device.

## Features

- **Multi-screen sessions**: up to 20 PNG, JPG or WebP screenshots (10 MB each). Drag and drop, file picker, or paste. Images are resized on the device to 2400 px max.
- **Filmstrip**: status per screen (Not reviewed, In review, Done), issue count, reorder by drag or buttons, rename, remove.
- **Vision lenses**: protanopia, deuteranopia, tritanopia (Machado 2009 matrices in linear RGB), achromatopsia, low vision blur, cataract haze, sunlight glare. Severity sliders.
- **Compare**: before and after slider, or side by side.
- **Motor lenses**: one-thumb reach zones (left or right hand), tap target measuring against 44 px and the 24 px WCAG 2.2 AA minimum.
- **Hearing lens**: sound-off checks for captions, visual alerts and audio-only steps.
- **Pins**: numbered issues with ability, severity (shape + color + text), note and a fix from a built-in tips library. Keyboard placement with arrow keys and Enter.
- **Contrast checker**: eyedropper on the screenshot, WCAG AA and AAA results.
- **Checklist**: 12 inclusion checks per screen.
- **Report**: summary plus one section per screen, print or save as PDF.
- **Sessions persist** in IndexedDB. Clear session wipes everything.
- **Inclusive light and dark themes** with a System option. Every token pair passes WCAG AA (`npm run check:contrast`). Severity never relies on red versus green. Supports `prefers-contrast: more`, forced colors and reduced motion.
- **Responsive**: desktop (1280 px and up), tablet landscape (icon rail), tablet portrait (drawers), pinch to zoom.

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| ← → | Previous or next screen |
| 1 to 9 | Jump to screen |
| P | Pin mode |
| M | Measure tap target |
| I | Pick colors |
| C | Slider or side by side |
| + − 0 | Zoom in, out, fit |
| D | Mark screen as done |
| Esc | Back to view mode |
| ? | Shortcut list |

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:5173.

## Build

```bash
npm run build      # outputs to dist/
npm run preview    # serve the build
npm run check:contrast
```

## Deploy to Vercel (free)

1. Push this folder to a GitHub repository.
2. In Vercel, choose **Add New → Project** and import the repository.
3. Framework preset: **Vite**. Build command: `npm run build`. Output directory: `dist`.
4. Deploy. No environment variables are needed.

## Tech stack

React, Vite, TypeScript, plain CSS with design tokens, `idb` for IndexedDB, Lucide icons, Atkinson Hyperlegible (bundled locally). SVG `feColorMatrix` and CSS filters for simulations.

## Project structure

```
src/
  components/   Landing, Upload, Workspace, Stage, LensPanel, FindingsPanel, Filmstrip, Report, dialogs
  lenses/       lens definitions and simulation filters
  data/         checklist and fix tips
  samples/      three original e-commerce mock screens (fictional store "Basketly")
  store/        reducer and IndexedDB persistence
  styles/       tokens, app and print styles
  utils/        contrast math and image processing
```

## Note

Simulations are approximations that build empathy and catch issues early. They do not replace testing with disabled people.

Inspired by the Microsoft Inclusive Design toolkit.
