## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Styling

This site has a specific, deliberate visual identity: **synthwave/vaporwave set in
monospace, with keyboard-driven navigation, built with no React and ~1 KB of JavaScript.**

**Before changing anything visual — CSS, colours, fonts, layout, animation, or the
keyboard navigation — read [`agent-docs/style.md`](agent-docs/style.md).** It documents
the design tokens and their roles, how every effect is constructed (the sunset sun, the
perspective grid, the neon glow, the scanlines), the JavaScript principles behind the
keyboard nav, the accessibility rules, and a list of gotchas already hit and fixed.

Non-negotiables, expanded on in that document:

- **No React, and no framework components.** Astro renders to static HTML; keep it that way.
- **Never hard-code a colour.** Use a token from `:root` in `src/styles/global.css`, or add one.
- **Effects are CSS, not images.** The sun, grid, glow, and scanlines are all gradients.
- **Focus must always be visible**, and `prefers-reduced-motion` must be honoured.
- Component-specific rules belong in that component's scoped `<style>`, not `global.css`.

## Writing and editing posts

Posts live in `src/content/blog/` and most were migrated out of WordPress, so they carry
first-draft habits as well as import artifacts.

**Before copy-editing a post, read [`agent-docs/content.md`](agent-docs/content.md).** It
records the house voice and what must not be "corrected", the recurring language patterns
worth grepping for first, the import artifacts to sweep (invisible characters, smart
quotes in code blocks, scraped alt text), and the working method.

The things most likely to bite:

- **Run every code snippet before trusting it.** Four were broken — and two that looked
  broken were fine. Test, don't assume. The same goes for a post's technical
  *explanations*: a claim about why something behaved a certain way is worth reproducing
  before it ships.
- **Never blanket-strip trailing whitespace.** `  \n` is a Markdown hard break; assert
  the count is unchanged before writing a file.
- **Fix language directly, raise content.** Wrong facts, chapter numbers or port numbers
  are a content decision, not a silent edit.
- **Informal is not showy.** Aphorisms, punchy fragments used as flourishes, and closing
  rhetorical questions get reverted. When a passage needs strengthening, make it more
  concrete rather than louder.
- **Diff against a known-good copy before writing.** Posts get edited in a parallel editor
  between turns, and a stale buffer will clobber a write.
- **Descriptions are one sentence, under 160 characters**, and say what the post is.
- **Never hand-write a table of contents** — `TableOfContents.astro` generates it from
  the post's real headings.

## Node version

Requires Node >= 22.12.0 (`.nvmrc` pins 24.15.0). Run `nvm use` before any npm command.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
