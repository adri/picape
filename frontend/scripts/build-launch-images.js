/* eslint-env node */
// Generates the iOS launch screens for the exported web build and writes their
// link tags into dist/index.html.
//
// Between tapping the home-screen icon and the document painting, iOS shows a
// launch screen, and the only way to colour it is an apple-touch-startup-image
// whose media query matches the device. There is no fallback and the manifest's
// background_color is not one: with nothing matched iOS paints white, which is
// the flash you see opening the app in dark mode. @expo/webpack-config used to
// generate these; the Metro export does not.
//
// They are flat colour rather than the splash artwork the webpack build drew,
// because the artwork was 33MB of generated PNGs and a launch screen that
// matches the app's background is what stops the flash. Flat colour also
// compresses to a couple of KB a file.
//
// SIZES is the whole maintenance cost: iOS matches on exact device pixels, so a
// new iPhone screen size needs a line here or that phone falls back to white.
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const dist = path.resolve(__dirname, '..', 'dist');
const outDir = path.join(dist, 'pwa', 'apple-touch-startup-image');

// [css width, css height, device pixel ratio], portrait: app.json locks it.
const SIZES = [
  [375, 667, 2], // SE 2nd/3rd, 8
  [414, 736, 3], // 8 Plus
  [375, 812, 3], // X, XS, 11 Pro, 12 mini, 13 mini
  [414, 896, 2], // XR, 11
  [414, 896, 3], // XS Max, 11 Pro Max
  [390, 844, 3], // 12, 12 Pro, 13, 13 Pro, 14
  [428, 926, 3], // 12 Pro Max, 13 Pro Max, 14 Plus
  [393, 852, 3], // 14 Pro, 15, 15 Pro, 16
  [430, 932, 3], // 14 Pro Max, 15 Plus, 15 Pro Max, 16 Plus
  [402, 874, 3], // 16 Pro, 17
  [440, 956, 3], // 16 Pro Max, 17 Pro Max
];

// constants/Colors.js `background`, for each theme.
const THEMES = [
  { name: 'light', rgb: [0xff, 0xff, 0xff], media: null },
  { name: 'dark', rgb: [0x00, 0x00, 0x00], media: '(prefers-color-scheme: dark)' },
];

function chunk(type, body) {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(body.length, 0);
  head.write(type, 4, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(zlib.crc32(Buffer.concat([head.subarray(4), body])), 0);
  return Buffer.concat([head, body, crc]);
}

// A solid-colour 8-bit RGB PNG. Every row after the first is encoded with the
// Up filter, so the whole image deflates to a few hundred bytes.
function solidPng(width, height, [r, g, b]) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type: truecolour
  const first = Buffer.alloc(1 + width * 3);
  for (let x = 0; x < width; x += 1) {
    first[1 + x * 3] = r;
    first[2 + x * 3] = g;
    first[3 + x * 3] = b;
  }
  const rest = Buffer.alloc(1 + width * 3);
  rest[0] = 2; // Up filter: identical to the row above, so all deltas are zero
  const raw = Buffer.concat([first, ...Array(height - 1).fill(rest)]);
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

fs.mkdirSync(outDir, { recursive: true });

const links = [];
let bytes = 0;
// Light first, then dark: iOS takes the last matching link, so the tag without
// a prefers-color-scheme has to come before the one with it.
for (const theme of THEMES) {
  for (const [w, h, dpr] of SIZES) {
    const file = `apple-touch-startup-image-${w}x${h}@${dpr}x-${theme.name}.png`;
    const png = solidPng(w * dpr, h * dpr, theme.rgb);
    fs.writeFileSync(path.join(outDir, file), png);
    bytes += png.length;
    const media = [
      `(device-width: ${w}px)`,
      `(device-height: ${h}px)`,
      `(-webkit-device-pixel-ratio: ${dpr})`,
      '(orientation: portrait)',
      theme.media,
    ]
      .filter(Boolean)
      .join(' and ');
    links.push(
      `    <link rel="apple-touch-startup-image" media="${media}" href="/pwa/apple-touch-startup-image/${file}" />`
    );
  }
}

const indexPath = path.join(dist, 'index.html');
const html = fs.readFileSync(indexPath, 'utf8');
const marker = '  </head>';
if (!html.includes(marker)) {
  console.error(`build-launch-images: no ${JSON.stringify(marker)} in dist/index.html`);
  process.exit(1);
}
fs.writeFileSync(indexPath, html.replace(marker, `${links.join('\n')}\n${marker}`));

console.log(
  `launch images: wrote ${links.length} files, ${(bytes / 1024).toFixed(
    1
  )} KB, linked from index.html`
);
