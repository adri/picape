/* eslint-env node */
// Generates the PWA service worker for the exported web build.
//
// This replaces workbox-webpack-plugin's InjectManifest, which ran inside the
// webpack config and cannot work with Metro. The old worker lived in
// src/service-worker.js and was bundled by webpack; workbox-build's generateSW
// writes an equivalent worker from configuration instead, so nothing needs
// bundling. The behaviour it reproduces is:
//
//   - precache everything in the export, minus source maps and the PWA icons
//     that the installed app keeps locally
//   - app-shell routing: serve index.html for navigations, but not for paths
//     starting with /_ or paths that look like files
//   - StaleWhileRevalidate for same-origin .png, capped at 50 entries
const path = require('path');
const { generateSW } = require('workbox-build');

const dist = path.resolve(__dirname, '..', 'dist');

generateSW({
  globDirectory: dist,
  globPatterns: ['**/*.{js,css,html,json,ico,png,jpg,jpeg,svg,ttf,woff,woff2}'],
  globIgnores: [
    '**/*.map',
    '**/asset-manifest.json',
    '**/LICENSE',
    // Excluded from precache because the installed PWA caches them itself.
    // Braces, not a bare paren group: fast-glob honours `(a|b)` when matching
    // but not in `ignore`, so the paren form silently precached all four icons.
    '**/{apple-touch-startup-image,chrome-icon,apple-touch-icon}*.png',
  ],
  swDest: path.join(dist, 'service-worker.js'),
  // Emit one self-contained classic worker. The default splits the workbox
  // runtime into a separate chunk loaded through a module-style shim, which
  // only works when the worker is registered with {type: 'module'}. The
  // registration in src/serviceWorkerRegistration.js does not do that, so the
  // browser fails with "An unknown error occurred when fetching the script".
  inlineWorkboxRuntime: true,
  clientsClaim: true,
  // A new worker waits rather than taking over mid-session. Nothing prompts it
  // to activate, so an update lands once every tab for the page has closed,
  // which is what the old src/service-worker.js did too.
  skipWaiting: false,
  navigateFallback: '/index.html',
  navigateFallbackDenylist: [/^\/_/, /\/[^/?]+\.[^/]+$/],
  // Metro hashes with 32 hex after a dash or a dot: index-<32>.js and
  // back-icon.<32>.png. The webpack config this replaces looked for 8 hex,
  // which matches nothing Metro emits, so every precache entry got a revision
  // and each worker update re-downloaded the whole 7.7MB.
  dontCacheBustURLsMatching: /[.-][0-9a-f]{32}\./,
  // Bumped from the 2mb default so a large JS chunk still gets precached.
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
  runtimeCaching: [
    {
      urlPattern: /\.png$/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'images',
        expiration: { maxEntries: 50 },
      },
    },
  ],
})
  .then(({ count, size, warnings }) => {
    warnings.forEach((warning) => console.warn(warning));
    console.log(`service worker: precached ${count} files, ${(size / 1024 / 1024).toFixed(2)} MB`);
  })
  .catch((error) => {
    console.error('service worker generation failed');
    console.error(error);
    process.exit(1);
  });
