# Style guide — NEON://STDOUT

How this blog is styled, why it is built the way it is, and the rules to follow when
extending it. Written for whoever (human or agent) touches the visuals next.

---

## 1. The brief

A coding blog in a **synthwave / vaporwave** register, but set in **monospace**, with
**keyboard-driven navigation**. The original inspiration was the
[wp-dos](https://wordpress.org/themes/wp-dos/) WordPress theme — but that theme is a
*DOS terminal* look (two colours, hairlines, zero animation, zero gradients), which is a
different aesthetic from synthwave. We deliberately went synthwave and kept only the
monospace type and terminal affordances from the DOS side.

Three retro idioms exist and they do **not** blend well. Pick one and let the others in
only as accents:

| | DOS / terminal | Synthwave (**ours**) | 8-bit / NES |
|---|---|---|---|
| Colour | 2 colours, phosphor | neon gradients, magenta/cyan | chunky 16-colour |
| Type | mono, hairlines | italic chrome, wide | Press Start 2P |
| Mood | dry, austere | maximal, sunset | playful sprites |

We are column 2, typeset with column 1's font.

---

## 2. Constraints that drive every decision

1. **No React, no framework components.** Astro renders `.astro` files to static HTML.
   Adding React would ship a hydration runtime to a static blog for zero benefit. Retro
   *component libraries* (98.css, NES.css, 8bitcn/ui) were rejected too: they solve an
   **app's** problem — buttons, dialogs, tabs — while a blog is ~90% prose typography,
   which those libraries don't style and actively fight.
2. **Ship as close to zero JavaScript as possible.** Current total: **one ~1 KB inlined
   module script** for keyboard nav. `dist/` contains no `.js` files at all — Astro
   inlines a script that small directly into each HTML page.
3. **Everything is CSS.** No images are used for decoration. The sun, the grid, the
   scanlines, and the glow are all gradients and pseudo-elements. Nothing to download,
   nothing to art-direct, everything themeable by changing one token.

---

## 3. Design tokens

All colour and type live as custom properties on `:root` in `src/styles/global.css`.
**Never hard-code a colour in a component.** Add a token or reuse one.

```css
/* surfaces */
--void:     #07010f;   /* deepest — page bottom, overlay backdrops, button text */
--bg:       #0e0424;   /* page top */
--bg-2:     #170a35;   /* raised panels, kbd chips, inputs */
--panel:    rgba(38, 14, 76, 0.55);   /* translucent fills (blockquote, th) */
--line:     #3b1d6e;   /* hairline borders */
--line-hot: #6b2fb5;   /* emphasised borders */

/* neon */
--magenta: #ff2e97;    /* primary accent — h1, brand, hover */
--pink:    #ff6ec7;    /* softer magenta — emphasis, blockquote text */
--cyan:    #00e5ff;    /* secondary accent — links, h2, dates, focus ring */
--purple:  #b06fff;    /* tertiary — h3, indices, endcap */
--yellow:  #ffd93d;    /* code literals, kbd glyphs */
--orange:  #ff6b35;    /* sunset midpoint only */

/* text */
--text: #e8dcff;       /* body */
--dim:  #9d82c9;       /* secondary text, captions */
```

**Colour roles, so the palette stays legible rather than just loud:**

- **Magenta = identity.** The brand, `h1`, hover states. Loud, used sparingly.
- **Cyan = interaction.** Links, focus rings, dates, the CTA. If it's cyan, you can act on it.
- **Purple = structure.** Hierarchy markers, indices, dividers. Recedes.
- **Yellow = literal values.** Code and keycaps only. Never decorative.

Two composite tokens do the heavy lifting:

```css
--sunset: linear-gradient(180deg, var(--yellow) 0%, var(--orange) 48%, var(--magenta) 100%);
--font-stack: var(--font-mono), ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
```

---

## 4. Typography

**One family, everywhere: JetBrains Mono.** Loaded through Astro's built-in font API in
`astro.config.mjs`:

```js
fonts: [{
  provider: fontProviders.google(),
  name: 'JetBrains Mono',
  cssVariable: '--font-mono',
  weights: [400, 700],
  styles: ['normal', 'italic'],
  fallbacks: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
}]
```

Astro **downloads and self-hosts** the font at build time, so there is no runtime request
to Google and no privacy or latency cost. `BaseHead.astro` emits
`<Font cssVariable="--font-mono" preload />` to preload it.

Rules:

- **Body is 16px / 1.75.** Monospace reads wider and denser than a proportional face;
  the Bear Blog default of 20px was far too large once the font changed. Don't raise it.
- **All headings are uppercase** with `letter-spacing: 0.02em`. Uppercase mono is the
  single strongest signal of the terminal register.
- **Headings carry terminal prefixes**, added with CSS, not markup:
  `h2::before, h3::before { content: '// '; opacity: 0.55 }`. The blog index title uses
  `h1::before { content: '$ ' }` so it reads as a shell prompt.
- **Fluid sizing on the big two** via `clamp()` — the hero `h1` is
  `clamp(1.8rem, 6vw, 3.4rem)`, the post title `clamp(1.6rem, 5vw, 2.6rem)`. Long
  monospace headlines overflow narrow screens otherwise.

---

## 5. How each effect is built

### 5.1 The page ground — layered radial gradients

`body` stacks three backgrounds in one declaration, painted top to bottom:

```css
background-image:
  radial-gradient(ellipse 80% 55% at 50% -10%, rgba(255,46,151,0.28), transparent 70%),
  radial-gradient(ellipse 60% 45% at 85% 15%, rgba(0,229,255,0.14), transparent 70%),
  linear-gradient(180deg, var(--bg) 0%, var(--void) 100%);
background-attachment: fixed;
```

Two off-screen-anchored ellipses (`at 50% -10%`, `at 85% 15%`) bleed magenta and cyan
light in from above, over a vertical fade to near-black. `background-attachment: fixed`
means the glow stays put while content scrolls — the page feels lit rather than painted.

### 5.2 CRT scanlines — one pseudo-element, no cost

```css
body::after {
  content: ''; position: fixed; inset: 0;
  pointer-events: none; z-index: 9999;
  background: repeating-linear-gradient(180deg, rgba(0,0,0,0.16) 0 1px, transparent 1px 3px);
  mix-blend-mode: multiply;
}
```

Three principles here, all reusable:

- **`position: fixed` + `inset: 0`** covers the viewport regardless of document height.
- **`pointer-events: none` is mandatory.** A full-viewport overlay at `z-index: 9999`
  would otherwise swallow every click on the site.
- **`mix-blend-mode: multiply`** darkens what's beneath instead of laying grey film over
  it, so bright neon keeps its saturation and only the darks deepen.

### 5.3 The sunset sun — a gradient disc, sliced by a striped pseudo-element

```css
.sun {
  position: absolute; top: 30%;
  width: min(30rem, 80vw); aspect-ratio: 1; border-radius: 50%;
  background: var(--sunset);
  filter: blur(0.5px);
  box-shadow: 0 0 90px rgba(255, 46, 151, 0.55);
}
.sun::after {
  content: ''; position: absolute; inset: 45% 0 0 0;
  background: repeating-linear-gradient(180deg,
    transparent 0 6px,  var(--bg) 6px 10px,
    transparent 10px 18px, var(--bg) 18px 26px,
    transparent 26px 32px, var(--bg) 32px 44px);
}
```

- `aspect-ratio: 1` + `border-radius: 50%` gives a perfect circle at any width, so
  `min(30rem, 80vw)` is the only size knob.
- The classic retro-sun banding is **not** a mask — it's a child painted in the page
  background colour, covering the bottom 55% (`inset: 45% 0 0 0`). The stop list uses
  **irregular, widening intervals** (6/4, 8/8, 6/12) rather than even stripes, which is
  what makes it read as a horizon sinking rather than a barcode.
- `filter: blur(0.5px)` takes the hard aliasing off the circle edge.

### 5.4 The perspective grid floor — 3D transform on a flat gradient

```css
.grid-floor {
  position: absolute; inset: auto 0 0 0; height: 45%;
  overflow: hidden; pointer-events: none;
  perspective: 260px; perspective-origin: 50% 0%;
  mask-image: linear-gradient(180deg, transparent, #000 35%);
}
.grid-floor::before {
  content: ''; position: absolute; inset: -20% -60% -60% -60%;
  background-image:
    repeating-linear-gradient(to right,  rgba(255,46,151,0.5) 0 1px, transparent 1px 64px),
    repeating-linear-gradient(to bottom, rgba(0,229,255,0.45) 0 1px, transparent 1px 64px);
  transform: rotateX(74deg);
  transform-origin: 50% 0%;
  animation: grid-scroll 2.6s linear infinite;
}
```

The whole illusion is **a flat crosshatch rotated 74° about X inside a `perspective`
context**. Notes:

- `perspective` goes on the **parent**, `rotateX` on the **child**. Setting both on one
  element gives a flat shear with no vanishing point.
- A short `perspective` (260px) means a *strong* vanishing point — the aggressive
  convergence is the entire look. Larger values flatten it out.
- `inset: -20% -60% -60% -60%` oversizes the plane well past its container, because
  rotating it pulls the far edge inward and would otherwise expose a bare corner.
- The `mask-image` fade stops the horizon line from ending in a hard seam.
- Motion is **`background-position`, not `transform`** — animating the gradient's
  position slides the lines along the already-transformed plane, so they appear to travel
  toward the viewer. Animating `transform` would move the whole plane instead.
- The keyframe advances by exactly one tile (`64px`) so the loop is seamless.

### 5.5 Neon glow — layered text-shadow, tight then wide

```css
--glow-cyan:    0 0 4px rgba(0,229,255,0.7),  0 0 18px rgba(0,229,255,0.35);
--glow-magenta: 0 0 4px rgba(255,46,151,0.7), 0 0 18px rgba(255,46,151,0.35);
```

Always **two shadows**: a tight bright one (4px) that reads as the tube itself, and a
wide dim one (18px) that reads as light bleeding into the air. One shadow alone looks
like a blur artifact.

The hero `h1` adds **chromatic aberration** on top — solid ±2px offsets in cyan and
magenta with no blur, mimicking a misconverged CRT:

```css
text-shadow:
  0 0 8px rgba(255,46,151,0.9), 0 0 30px rgba(255,46,151,0.5),
   2px 0 0 rgba(0,229,255,0.55),
  -2px 0 0 rgba(255,46,151,0.55);
```

### 5.6 Legibility over bright artwork — the scrim

Cyan text crossing the orange sun was unreadable. The fix is a **scrim**: a dark radial
gradient on `.hero-copy::before` at `z-index: -1`, inset *negatively* so it extends past
the text box and fades to transparent before its edge shows.

```css
inset: -2.5em -3.5em; z-index: -1;
background: radial-gradient(ellipse at center,
  rgba(7,1,15,0.88) 0%, rgba(7,1,15,0.7) 45%, transparent 78%);
```

The tagline also carries **dark shadows before its glow** in the same `text-shadow`
stack — near-black at 6px and 14px, *then* the cyan glow. Shadows paint in order, so the
dark halo separates the glyph from the background and the neon still sits on top.

**Principle: decoration never outranks reading.** Any time artwork sits behind text,
either move the artwork or add a scrim.

### 5.7 Interaction states — the post list

Each row is a CSS grid `auto auto 1fr auto` (index, thumb, body, arrow). Hover and focus
share **one identical rule** so pointer and keyboard users see the same thing:

```css
.post-list a:hover,
.post-list a:focus-visible {
  outline: none;                        /* replaced, not removed — see below */
  border-color: var(--magenta);
  background: linear-gradient(90deg, rgba(255,46,151,0.18), rgba(0,229,255,0.06) 60%, transparent);
  transform: translateX(4px);
  box-shadow: -3px 0 0 0 var(--cyan);   /* the cyan bar on the left edge */
}
```

- The **left cyan bar is a `box-shadow`, not a border** — borders change layout and would
  shift the row by 3px on hover; a spread-less offset shadow doesn't.
- `transform: translateX(4px)` is a **compositor-only** property; animating it never
  triggers layout or paint.
- Thumbnails are tinted into the palette with
  `filter: saturate(1.3) contrast(1.05) hue-rotate(-12deg)` so arbitrary post images
  don't fight the scheme.
- Suppressing `outline` here is only acceptable **because the rule replaces it** with a
  louder border + glow + bar. Never suppress focus styling without a replacement.

---

## 6. JavaScript principles — `src/components/KeyboardNav.astro`

The only script on the site. ~1 KB, inlined by Astro at build time.

### Move focus, don't track an index

The central decision. The handler calls `element.focus()` rather than maintaining a
"selected item" variable and re-rendering.

```js
const items = () => Array.from(document.querySelectorAll('[data-knav]'));

function move(delta) {
  const list = items();
  const current = list.indexOf(document.activeElement);
  const next = current === -1 ? (delta > 0 ? 0 : list.length - 1) : current + delta;
  const target = list[Math.max(0, Math.min(list.length - 1, next))];
  target?.focus();
  target?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}
```

What this buys, for free:

- **Enter works natively.** The focused element is a real `<a>`; the browser activates it.
  No key handler for Enter exists, and none is needed.
- **Screen readers announce it.** Moving focus is the accessible way to move a cursor.
- **Tab still works, and interoperates.** Because state lives in `document.activeElement`,
  Tab and `j` share one position — arriving via Tab then pressing `j` continues correctly.
- **`:focus-visible` styles it**, so hover and keyboard states are one rule.
- `indexOf(document.activeElement)` returning `-1` (focus outside the list) is the entry
  case: `j` enters at the top, `k` at the bottom.
- `items()` is a **function, not a cached array**, so the DOM stays the source of truth.
- `block: 'nearest'` scrolls only when the target is actually off-screen.

### Scope: `j`/`k` walk content, never chrome

`data-knav` goes on **content** — post rows, the CTA, in-body links. It is deliberately
**absent from the header and footer**. An early version marked the nav and social icons
too, and six `j` presses on the blog index landed on the Twitter icon instead of a post.
Site sections are reachable by `g`-chords and by Tab; `j`/`k` mean "next item of what
this page is about".

**When adding a new list page, add `data-knav` to its row anchors and nothing else.**

### Chords with a timeout

`g` sets `awaitingGoto = true` and starts a 900 ms timer. The next keydown consults a
route map and clears the flag either way, so a stray `g` expires instead of arming
forever.

### Don't hijack typing

Every handler returns early on `isTyping(event.target)` (INPUT / TEXTAREA / SELECT /
`isContentEditable`) and on any `metaKey`/`ctrlKey`/`altKey`, so browser and OS shortcuts
are untouched. **Any new binding must keep both guards.**

---

## 7. Accessibility rules — non-negotiable

- **Focus is always visible.** Global `:focus-visible { outline: 2px solid var(--cyan);
  outline-offset: 3px }`. Components may replace it with something louder; nothing may
  remove it.
- **`prefers-reduced-motion` is honoured globally** — the grid scroll, the blinking
  carets, and every transition collapse to 0.001ms:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.001ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.001ms !important;
    }
  }
  ```
- **Decorative elements are `aria-hidden="true"`** (`.sun`, `.grid-floor`, the `▶`) and
  `pointer-events: none` where they overlay content.
- **Contrast is checked against the artwork, not the flat background.** See §5.6.
- **Keyboard nav is additive.** The site is fully usable with Tab and the mouse alone;
  removing the script degrades nothing.

---

## 8. Gotchas already hit — don't reintroduce these

1. **`[hidden]` loses to a class rule.** `.help { display: grid }` overrides the UA
   `[hidden] { display: none }`, so the help overlay rendered on load. Any component with
   a `display` value that also toggles `hidden` **must** restate
   `.thing[hidden] { display: none }`.
2. **`::marker` content survives `list-style: none`.** The global
   `ul li::marker { content: '▸ ' }` put stray glyphs on the post list even though it sets
   `list-style: none`. Opt out explicitly with `li::marker { content: none }`.
3. **Astro collapses some template newlines.** A line break between text and an inline
   `<a>` dropped the word space, rendering `setup withAstro Integrations`. Use `{' '}` at
   the line end when a text node meets an element.
4. **Never animate `border-width` or layout properties on hover.** Use `box-shadow` and
   `transform` (see §5.7).
5. **Full-viewport overlays need `pointer-events: none`** unless they are modal.

---

## 9. Where things live

| Path | Holds |
|---|---|
| `src/styles/global.css` | tokens, base typography, prose, scanlines, `.grid-floor`, reduced-motion |
| `src/components/KeyboardNav.astro` | status bar, help overlay, the entire site script |
| `src/components/Header.astro` | sticky header, gradient underline, `[bracket]` nav hover |
| `src/components/BaseHead.astro` | font preload, `color-scheme: dark`, `theme-color` |
| `src/pages/index.astro` | hero — sun, grid, scrim, CTA |
| `src/pages/blog/index.astro` | post list grid and its interaction states |
| `src/layouts/BlogPost.astro` | article shell, hero image treatment, `EOF` endcap |
| `astro.config.mjs` | font provider, integrations |

**Component styles are scoped by default in Astro.** Put a rule in `global.css` only when
it is genuinely global; anything belonging to one component goes in that file's `<style>`.
Reach for `:global()` only to style a child component's markup (as `Header.astro` does for
`HeaderLink`).

---

## 10. Not done yet

- **Sprites / pixel art** — deferred by choice. The palette and grid are the backdrop for
  them when they land.
- Header and footer social links still point at **Astro's** accounts.
- `site: 'https://example.com'` in `astro.config.mjs` — this feeds RSS and sitemap URLs.
- `src/assets/fonts/atkinson-*.woff` are **orphaned**; nothing references them since the
  switch to JetBrains Mono.
