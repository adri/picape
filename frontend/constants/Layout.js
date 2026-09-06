import { Dimensions } from 'react-native';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

// The widest a column of running text or list rows gets. Past this a line is
// too long to read back to, and a row leaves its control an arm's length from
// the name it belongs to. Every phone is narrower than this, so it binds on a
// tablet and changes nothing on a phone.
export const CONTENT_MAX_WIDTH = 700;

// Caps a screen at that width and centres it. It goes on the content container
// of the screen's own scroller, so the screen's components keep the gutters
// they already have and nothing below has to know about it.
export const contentColumn = {
  width: '100%',
  maxWidth: CONTENT_MAX_WIDTH,
  alignSelf: 'center',
};

// How far the content column is from the display edge. A control that floats
// over a capped screen adds it, so the way back sits beside the column it
// belongs to rather than stranded in the margin beside it. Zero on a phone.
export function contentInset(available) {
  return Math.max(0, (available - CONTENT_MAX_WIDTH) / 2);
}

// A recipe card wants about this much room, its share of the gutter included.
const GRID_COLUMN_WIDTH = 220;

// How many cards a recipe grid puts across. Two is the floor, because below
// that a grid is a list, and it is what every phone width already resolves to.
export function gridColumns(available) {
  return Math.max(2, Math.floor(available / GRID_COLUMN_WIDTH));
}

export default {
  window: {
    width,
    height,
  },
  isSmallDevice: width < 375,
  borderRadius: 10,
  // What the tab bar covers above the bottom safe-area inset. A tab screen
  // adds it to its scroll padding so its last row is not left under the bar.
  tabBarHeight: 50,
};
