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
