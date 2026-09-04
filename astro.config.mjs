// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';
import { wordpressRedirects } from './src/redirects.js';

// https://astro.build/config
export default defineConfig({
	// Step 2 (DNS cutover). public/CNAME carries the same domain so GitHub Pages serves
	// it. No `base` is needed: the repo is named <user>.github.io, so the site is served
	// from the domain root either way.
	site: 'https://oooops.dev',
	integrations: [mdx(), sitemap()],
	redirects: wordpressRedirects,
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
