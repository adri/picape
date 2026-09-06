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
