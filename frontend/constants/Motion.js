// What the app is allowed to move, and for how long.
//
// Durations come from the published ranges rather than from taste: Nielsen
// Norman puts interface animation at 100-400ms and calls 500ms "a real drag",
// and Material's short band tops out at 200ms for small utility transitions.
// Content arriving decelerates, so it eases out.
export const Duration = {
  // A row, a card or a label appearing or changing state.
  fast: '200ms',
};

export const Easing = {
  enter: 'ease-out',
};

// react-native-web 0.21 compiles no `@media` rule from StyleSheet.create, so
// `prefers-reduced-motion` has to be read in JavaScript. AccessibilityInfo
// wraps the same media query but answers with a promise, and it resolves true
// when there is no DOM, so a component would need state, an effect and a first
// paint of the wrong variant to use it.
//
// This reads the query once and keeps the answer in a module variable that the
// listener updates. Callers ask for it during render, so nothing subscribes and
// nothing re-renders: a list that is already re-render bound cannot afford a
// hook per row.
const query =
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;

let reduced = query ? query.matches : false;

if (query && query.addEventListener) {
  query.addEventListener('change', (event) => {
    reduced = event.matches;
  });
}

// True when the reader asked their system to cut down on motion.
//
// "Reduce" is not "remove". Apple's own guidance for this setting is to replace
// transitions along an axis with fades, and WCAG's definition of motion
// animation excludes changes of opacity and colour that leave the size, shape
// and position of an element alone. So the app keeps its cross-fades either way
// and only drops the things that actually travel: the screen slide and the
// skeleton sweep.
export function prefersReducedMotion() {
  return reduced;
}
