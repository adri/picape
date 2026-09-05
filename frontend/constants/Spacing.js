// A 4pt scale. Every margin, padding and gap in the app comes from here, so
// spacing is a choice between six values rather than a free number. The names
// say how much room, not what it is for, so one step can serve any component.
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 32,
};

// The gutter every screen keeps between its content and the display edge.
// Titles, cards and list rows all line up on it.
export const Gutter = Spacing.xl;

// iOS rounds a corner in proportion to the surface. A row or a chip takes the
// small radius, a card or a sheet the medium, a circular control the pill.
export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
};

// react-native-web resolves StyleSheet.hairlineWidth to a whole pixel, which is
// twice what a hairline should be on a retina screen. Every rule in the app uses
// this instead so separators stay one device pixel.
export const Hairline = 0.5;

// A back or close button floats over its screen rather than sitting in the
// layout, so it needs the offset that lands it on the same line as the header
// row opposite it: the row's top padding plus half its line, less half the
// button. Screens use this instead of hugging the safe-area edge.
export const FloatingTop = Spacing.lg;

// Anything a finger has to hit is at least this tall and wide, per the iOS
// Human Interface Guidelines. Controls drawn smaller than this keep their look
// and make up the difference with hitSlop.
export const HitTarget = 44;

export function hitSlopFor(size) {
  const missing = Math.max(0, HitTarget - size);
  const each = Math.round(missing / 2);
  return { top: each, bottom: each, left: each, right: each };
}

export default Spacing;
