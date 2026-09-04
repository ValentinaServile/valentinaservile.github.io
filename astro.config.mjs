// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	// Step 1: serve from the GitHub Pages default domain while WordPress keeps oooops.dev.
	// Step 2 (DNS cutover): set this to 'https://oooops.dev' and restore public/CNAME
	// containing the single line `oooops.dev`. No `base` is needed in either step, as long
	// as the repo is named <user>.github.io — see agent-docs.
	site: 'https://valentinaservile.github.io',
	integrations: [mdx(), sitemap()],
	fonts: [
		{
			provider: fontProviders.google(),
			name: 'JetBrains Mono',
			cssVariable: '--font-mono',
			weights: [400, 700],
			styles: ['normal', 'italic'],
			fallbacks: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
		},
	],
});
