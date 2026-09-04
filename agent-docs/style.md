# Style guide — oooops.dev//stdout

How this blog is styled, why it is built the way it is, and the rules to follow when
extending it. Written for whoever (human or agent) touches the visuals next.

---

## 1. The brief

The blog for **oooops.dev**, in a **synthwave / vaporwave** register, but set in **monospace**, with
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

/* neon — ARTWORK ONLY. Never body text. */
--neon-magenta: #ff2e97;   /* sun gradient, grid lines, header/footer edge */
--neon-cyan:    #00e5ff;   /* grid lines, header/footer edge */
--orange:       #ff6b35;   /* sunset midpoint only */
--yellow:       #ffd93d;   /* code literals, kbd glyphs */

/* muted — TEXT roles. Contrast-checked against --bg and --void. */
--blue:      #4a86c8;  /* links, h2, dates, focus ring      5.2:1 */
--blue-soft: #6fa3dc;  /* hover / raised                    7.4:1 */
--rose:      #d9628f;  /* h1, brand, markers, accents       5.7:1 */
--pink:      #e08cb4;  /* emphasis, blockquote text         7.6:1 */
--purple:    #9b82cf;  /* h3, indices, structure            6.1:1 */

/* text */
--text: #e8dcff;       /* body */
--dim:  #9d82c9;       /* secondary text, captions */
```

### The one rule that matters: neon is artwork, muted is text

The site reads as synthwave because the **sun, grid, and edge gradients** are full-
saturation neon. It stays *readable* because **nothing you have to read is**. Text uses
the muted ramp. Keep this split — if a `--neon-*` token ever ends up on a paragraph,
heading, or link, that's the bug.

**Colour roles:**

- **Rose = identity.** Brand, `h1`, list markers, hover. The muted descendant of magenta.
- **Blue = interaction.** Links, focus rings, dates, the CTA. If it's blue, you can act on it.
- **Purple = structure.** Hierarchy markers, indices, dividers. Recedes.
- **Yellow = literal values.** Code and keycaps only. Never decorative.

**Every muted colour above was contrast-checked at authoring time** against both `--bg`
and `--void`, and all clear 4.5:1 (WCAG AA body text). Re-run that check before changing
one — the ratios are in the comments so a regression is visible in review.

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
- **The hero wordmark is the exception to uppercase.** `oooops.dev` is a domain, and
  `text-transform: lowercase` is set locally on `.hero-copy h1` to beat the global rule.
  `SITE_NAME` (bare domain) and `SITE_TITLE` (`oooops.dev//stdout`, used in the header and
  `<title>`) are separate constants in `src/consts.ts` for this reason.
- **Fluid sizing on the big two** via `clamp()` — the hero `h1` is
  `clamp(1.8rem, 6vw, 3.4rem)`, the post title `clamp(1.6rem, 5vw, 2.6rem)`. Long
  monospace headlines overflow narrow screens otherwise.

### Vertical rhythm

One rule governs spacing: **every block-level element carries its gap below it, and
headings carry a gap above.** The paragraph gap (`1.6em` inside `.prose`) is the unit;
everything else matches it.

```css
/* every block gets the same bottom gap — no UA-default fallbacks */
pre, table, ul, ol, figure { margin: 0 0 1.6em 0; }

/* headings own the space above them, in rem so levels stay proportionate */
h1 { margin-top: 3rem; }  h2 { margin-top: 2.75rem; }
h3 { margin-top: 2.25rem; } h4, h5, h6 { margin-top: 1.75rem; }

/* a heading under a heading is a subtitle, not a new section */
:is(h1,h2,h3,h4,h5,h6) + :is(h1,h2,h3,h4,h5,h6) { margin-top: 1.1rem; }

/* nothing pushes the top of an article down */
.prose > :first-child, main > :first-child { margin-top: 0; }

/* trailing margin inside a bordered box is dead space */
.prose blockquote > :last-child, .prose li > :last-child { margin-bottom: 0; }
```

Why it is shaped this way:

- **Top margins are `rem`, not `em`.** An `em` top margin scales with the heading's own
  font-size, so an `h1` gap ends up three times an `h4` gap and the page loses its beat.
- **Headings own their top gap, blocks own their bottom gap.** Mixing the two
  responsibilities is how you get double gaps in one place and none in another.
- **Never rely on UA defaults.** `pre`, `ul`, and `ol` silently inherited the browser's
  `1em`, which didn't match the `1.6em` used everywhere else; `table` had *no* margin at
  all, which is why tables ran flush into the next heading.

**A component heading outside the prose flow must pin its own margin.** `.hero-copy h1`
and `.help-panel h2` both set `margin-top: 0`, because they are the first thing in their
own box and the global heading margin would otherwise push them down. Any new component
with a heading in a box needs the same line.

---

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
  position: absolute; top: 26%;
  width: min(25rem, 72vw); aspect-ratio: 1; border-radius: 50%;
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
  `min(25rem, 72vw)` is the only size knob.
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
  mask-image: linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.35) 30%, #000 70%);
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
- The `mask-image` fade stops the horizon from ending in a hard seam. It is a **three-stop**
  fade (0% / 30% / 70%) rather than a simple two-stop one: at the vanishing point the
  gridlines converge into what renders as a solid bright bar, and a fast fade leaves that
  bar visible. This showed up the moment the hero was shortened — a shorter container
  compresses the convergence zone, so if you change the hero height, re-check the horizon.
- Motion is **`background-position`, not `transform`** — animating the gradient's
  position slides the lines along the already-transformed plane, so they appear to travel
  toward the viewer. Animating `transform` would move the whole plane instead.
- The keyframe advances by exactly one tile (`64px`) so the loop is seamless.

### 5.5 Neon glow — layered text-shadow, tight then wide

```css
--glow-blue: 0 0 3px rgba(74, 134, 200, 0.45), 0 0 14px rgba(74, 134, 200, 0.22);
--glow-rose: 0 0 3px rgba(217, 98, 143, 0.45), 0 0 14px rgba(217, 98, 143, 0.22);
```

Always **two shadows**: a tight one (3px) that reads as the tube itself, and a wide dim
one (14px) that reads as light bleeding into the air. One shadow alone looks like a blur
artifact. Alpha is deliberately low (0.45 / 0.22) — a muted colour with a neon-strength
glow reads as blurry rather than lit.

The hero `h1` adds **chromatic aberration** on top — solid ±2px offsets in cyan and
magenta with no blur, mimicking a misconverged CRT:

```css
text-shadow:
  0 0 10px rgba(217, 98, 143, 0.55), 0 0 34px rgba(217, 98, 143, 0.3),
   1.5px 0 0 rgba(74, 134, 200, 0.4),
  -1.5px 0 0 rgba(217, 98, 143, 0.4);
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

### 5.8 Content images — scanlines and inversion

Two problems, both from the WordPress migration: the CRT scanline overlay striped every
image, and the images are light diagrams that glared on a dark page.

**Scanlines.** `body::after` sat at `z-index: 9999`, above literally everything. It is now
at **300** — below the header (400), status bar (500) and help overlay (900) — and content
images are lifted to **310**. So images sit above the stripes but still pass *under* the
sticky header when scrolled. Changing either number without the other reintroduces the
stripes or puts images over the header.

**Inversion.**

```css
.invert-images .prose img:not([src*='.asis.']) {
  filter: invert(1) hue-rotate(180deg);
  mix-blend-mode: screen;
}
```

- `hue-rotate(180deg)` after the invert puts hues back: without it a blue box turns
  orange. With it, coloured diagram fills survive inversion looking like themselves.
- `mix-blend-mode: screen` is what stops an inverted diagram reading as a hard black
  rectangle. Inversion turns a white background solid black, and `screen` treats black as
  identity — so that background drops out and the diagram floats on the page.

**What must NOT be inverted, and how it is decided.** Images were classified by mean
luminance (sharp, downsampled to 64px). There is a clean natural gap in the data: ten
images sit at luminance <= 0.47, then nothing until 0.73. Those ten are already-dark
diagrams, terminal captures, a browser screenshot and one photograph — inverting them
would make them *worse*, turning dark images into glaring white boxes. The other 68
(~87%) are light diagrams that invert well.

The rule is therefore **"is it light?"**, not "is it a diagram".

Two opt-outs exist because two different scopes need it:

- **`.asis.` in the filename** excludes a single image. It is encoded in the filename
  rather than a CSS selector on the basename because **basenames repeat across posts** —
  `image-11.png` and `image-27.png` each exist in two posts, on opposite sides of the
  split. Astro preserves the basename through hashing (`image-11.asis.<hash>.webp`), so
  the attribute selector is stable.
- **`invertImages: false`** in frontmatter excludes a whole post or page (set on
  `about.md`). It is declared in `src/content.config.ts` as well — **Zod strips unknown
  frontmatter keys**, so without the schema entry the flag is silently dropped on blog
  posts and the default (`true`) wins. Any new frontmatter flag needs the same.

To re-classify after adding images, re-run the luminance measurement and rename anything
below the threshold to `*.asis.*`.

### Filename markers

Two behaviours are switched on by markers in the image filename, chosen over CSS classes
because Markdown gives no way to put a class on an image, and over basename selectors
because basenames repeat across posts (see the gotcha in §10).

| marker | effect |
|---|---|
| `*.asis.*` | never invert this image |
| `*.small.*` | render at 30% of the content width (60% under 720px) |

They are independent and compose: `diagram.small.asis.png` is both small and uninverted.
Astro preserves the basename through hashing (`diagram.small.C7xk2p.webp`), so the
`[src*='.small.']` attribute selector survives the build.

Renaming an image means updating its Markdown reference too — and reference rewrites must
be keyed on the **full path**, never the basename.

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
Site sections are reachable by the single-key routes and by Tab; `j`/`k` mean "next item
of what this page is about".

**When adding a new list page, add `data-knav` to its row anchors and nothing else.**

### Single-key routes, not chords

Navigation is one keypress: `h` home, `b` blog, `a` about, from a plain lookup table.

```js
const ROUTES = { h: '/', b: '/blog', a: '/about' };
// ...after the typing and modifier guards:
const dest = ROUTES[event.key];
if (dest) { event.preventDefault(); window.location.href = dest; return; }
```

This started as vim-style `g`-chords (`g h`, `g b`) with a 900 ms timeout, and was
**deliberately flattened** — on a site with three destinations the prefix bought nothing
but a second keystroke and a timer to reason about.

Bare letters are safe here **only because of the two guards above them**: the handler
returns early on text input and on any modifier combo, so `h`/`b`/`a` can never shadow
typing or a browser shortcut. That is load-bearing, not incidental — **if you add a
binding, keep both guards**, and if the site ever grows a text input outside a form
control, re-check `isTyping`.

Adding a destination means one entry in `ROUTES`, one row in the help overlay, one
`<kbd>` in the status bar, and one `.hint` in `Header.astro`. Keep the letter distinct
from `j`/`k`.

### Don't hijack typing

Every handler returns early on `isTyping(event.target)` (INPUT / TEXTAREA / SELECT /
`isContentEditable`) and on any `metaKey`/`ctrlKey`/`altKey`, so browser and OS shortcuts
are untouched. **Any new binding must keep both guards.**

---

## 7. Pixel-art icons — `src/components/PixelIcon.astro`

Social icons are **hand-drawn 12x12 grids, not an icon library**. Each glyph is a literal
picture in the source:

```js
linkedin: [
  '............',
  '.##.........',
  '.##.........',
  '............',
  '.##..######.',
  '.##..##..##.',
  ...
]
```

Why this shape:

- **Editable by anyone.** Changing the art means changing `#` and `.` in a text file. No
  vector tool, no export step, no binary in the repo.
- **No licence surface.** These are original drawings, so there is no attribution or
  redistribution question the way there would be with a downloaded icon set.
- **Cheap.** Adjacent filled pixels in a row are merged into a single `<rect>` in the
  component's frontmatter, so a glyph is ~10 nodes, not 144. It renders at build time.
- `shape-rendering="crispEdges"` disables antialiasing — mandatory, or the pixels blur
  into mush at small sizes.
- `fill="currentColor"` means the icons inherit hover and focus colour from the link.

**12x12 is a deliberate ceiling.** At the ~22px render size, a larger grid stops reading
as pixel art. It also means glyphs are *impressionistic* — the GitHub mark is a cat face,
not the Octocat. Judge a new icon by zooming to the real render size, not by the grid.

To add one: add a grid to `GRIDS`, then add an entry to `SOCIALS` in `src/consts.ts`.
Header and footer both render from that array, so one edit updates both.

### The favicon — same technique, 16x16

`public/favicon.svg` is a pixel thought bubble drawn on the same kind of grid, generated
by `scripts/build-favicon.py`. It writes **both** icons from one picture: the SVG (runs
merged into 14 `<rect>`s, with the grid preserved in an XML comment so it stays editable)
and `favicon.ico`, which packs a 16x16 and a 32x32 PNG for browsers that still ask for
`.ico`. Re-run the script after editing the grid, or the two will disagree.

- **16x16, one grid cell per CSS pixel** at tab size. Rasterising a circle at this size
  leaves stray pixels and lopsided edges; the dome is drawn by hand, row by row, wide in
  the middle (rows 4-5 span all 16 cells) and two cells tall at the far left and right.
- **The trail dots carry the meaning.** A blob alone is a blob; a blob with two shrinking
  dots on a diagonal is a thought bubble. Keep them square, and keep the gaps.
- **Magenta bubble, purple trail** — `--neon-magenta` to `--purple`, the first pair in
  `HeroArt`'s palette table (§8). A favicon is artwork, so neon is correct here.
- **Empty cells are transparent**, not painted with `--bg`, so the icon sits on a light
  or dark tab strip equally well. Check both before changing it.

---

## 8. Generated hero art — `src/components/HeroArt.astro`

No migrated post has a `heroImage` (WordPress had no featured images), so posts without
one get procedurally generated artwork with the title overlaid on it.

**It is deterministic, not random.** The look is derived from an FNV-1a hash of the post
slug, so a post always gets the same art across rebuilds and navigations. Genuinely
random art would reshuffle on every build and make the site feel unstable — and would
make visual review impossible.

```js
const h = hash(seed);                     // seed = post slug, passed from the route
const [c1, c2] = PAIRS[h % PAIRS.length]; // 6 curated palette pairs
const motif   = MOTIFS[(h >>> 3) % MOTIFS.length];   // grid | sun | rays | rings | bars
const angle   = 100 + ((h >>> 6) % 8) * 20;
const posX    = 20 + ((h >>> 11) % 7) * 10;
```

Design rules baked in:

- **Colours come from a fixed table of palette pairs**, never from free hue rotation.
  Random hues would eventually produce something off-brand; a curated table cannot.
- **Different bit-slices of the same hash** drive colour, motif, angle and position, so
  the choices vary independently instead of moving in lockstep.
- **Pure CSS gradients** — no images, no canvas, no JS, consistent with §5.
- The seed is the **slug**, passed explicitly from `src/pages/blog/[...slug].astro`
  (`seed={post.id}`), because the route otherwise spreads only `post.data`. It falls back
  to the title for callers with no slug, e.g. `MarkdownPage.astro` rendering `about.md`.

### Two things that were wrong on the first attempt

1. **Motif intensities drifted far apart.** Each motif's alpha was tuned by eye, and the
   result ranged from invisible (`rings` at 0.18–0.22 alpha) to overwhelming (`sun` at
   0.75 opacity). They now share one alpha ramp via `--c1-faint` / `--c2-faint`. **Tune
   the shared ramp, not individual motifs.**
2. **The sun was sized off the band's width.** `width: 60%` on a 1456px band produced an
   ~875px circle in a 360px band, so only a middle slice showed and it read as a rounded
   rectangle. It is now sized from the band's *height* (`height: 165%; width: auto`), so
   it stays circular at any viewport.

### The compact variant

The blog index uses the **same component with the same seed** (`<HeroArt seed={post.id}
compact />`), so a row's thumbnail is the identical picture to that post's hero. That
match is the point — the thumbnail is a preview, not decoration.

Motif geometry is authored for a ~360px band, so every fixed length is multiplied by
`--k` (`1` full, `0.3` compact). Without it a 120x68 thumbnail shows a coarse crop of a
few huge stripes rather than the same pattern. **Any new motif must express its lengths
as `calc(Npx * var(--k))`**, or it will look broken at thumbnail size. Hairline widths
(the 1px grid lines) are deliberately *not* scaled — at 0.3 they would disappear.

Thumbnails carry no text, so `.art.compact .scrim` is much lighter than the full band's.

### Legibility

Two scrims, because one cannot do the job: a band-wide scrim dark enough to tame the sun
would flatten `rings` into nothing. So the band carries a light vertical scrim for
overall tone, and **`.titleband.generated .title::before` carries a second scrim local to
the text**. Same principle as §5.6 — decoration never outranks reading.

---

## 9. Accessibility rules — non-negotiable

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

## 10. Gotchas already hit — don't reintroduce these

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
6. **`.prose p` ties with `blockquote > :last-child` on specificity** (0,1,1 each) and
   wins on source order, so the "kill the trailing margin" rule had to be written as
   `.prose blockquote > :last-child` to take effect. When a reset rule silently does
   nothing, count specificity before assuming the selector is wrong.
7. **Renaming assets by basename breaks sibling posts.** Marking the dark images
   `*.asis.*` and updating references with a basename-keyed string replace rewrote refs in
   three posts whose files had *not* been renamed, because `image-11.png` and
   `image-27.png` exist in more than one post directory. Reference rewrites must be keyed
   on the full path, and verified by resolving every ref against disk afterwards.
8. **Headings shipped with `margin-top: 0`** for a while, which made every heading collide
   with the block above it — most visibly tables, which have no UA margin to fall back on.
   Fixed by the rhythm block in §4; don't reintroduce a bare `margin: 0 0 X 0` on headings.

---

## 11. Where things live

| Path | Holds |
|---|---|
| `src/styles/global.css` | tokens, base typography, prose, scanlines, `.grid-floor`, reduced-motion |
| `src/components/KeyboardNav.astro` | status bar, help overlay, the entire site script |
| `src/components/PixelIcon.astro` | 12x12 pixel-art glyph grids + run-length renderer |
| `scripts/build-favicon.py` | draws `public/favicon.svg` + `favicon.ico` from one 16x16 grid |
| `src/components/HeroArt.astro` | seeded generative hero artwork (5 motifs, 6 palettes) |
| `src/consts.ts` | `SITE_TITLE`, `SITE_NAME`, `SOCIALS` |
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

## 12. Not done yet

- **Sprites / pixel art** — deferred by choice. The palette and grid are the backdrop for
  them when they land.
- **`SOCIALS` hrefs are placeholders** (`https://github.com/`, `https://www.linkedin.com/`)
  — they need real profile URLs. Mastodon was deliberately dropped.
- `site: 'https://example.com'` in `astro.config.mjs` — this feeds RSS and sitemap URLs.
- `src/assets/fonts/atkinson-*.woff` are **orphaned**; nothing references them since the
  switch to JetBrains Mono.
