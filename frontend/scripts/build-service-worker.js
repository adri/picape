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
//   - a runtime cache for images, which the recipe photos rely on
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
  // A waiting worker only activates once every tab for the page has closed. An
  // installed PWA on iOS is suspended rather than closed, so that moment can be
  // weeks away and the home-screen app keeps serving the build it was installed
  // with. The worker takes over as soon as it has installed instead, and
  // serviceWorkerRegistration.js reloads the page onto it. Safe here because
  // the export is a single bundle: the page never fetches a chunk mid-session
  // that the new precache no longer has.
  skipWaiting: true,
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
      // Any image, whatever its extension or origin. The rule this replaces
      // matched /\.png$/, which no recipe photo is: they are .jpg served from
      // Cloudinary, and a Cloudinary delivery URL need not carry an extension
      // at all. So the one thing on screen worth caching never was.
      urlPattern: ({ request }) => request.destination === 'image',
      // The photos are immutable at their URL, and Cloudinary says so with
      // `immutable` and a month of max-age. Serving them from the cache without
      // a revalidating request is what makes a relaunch paint at once, and what
      // makes the app work with no network at all.
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: {
          // A few hundred recipes' worth, dropped after a month.
          maxEntries: 200,
          maxAgeSeconds: 30 * 24 * 60 * 60,
          // Opaque responses are padded to several MB each against the origin's
          // quota, so a full cache has to evict rather than start failing.
          purgeOnQuotaError: true,
        },
        // Cloudinary answers without CORS headers, so the response is opaque
        // and reports status 0. Workbox stores only 200 by default, which means
        // that without this the cache silently keeps nothing.
        cacheableResponse: { statuses: [0, 200] },
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
