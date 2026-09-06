import { Appearance, useColorScheme } from 'react-native';

const tintColor = '#48BB78';

// Palette 12
const palette = {
  // Primary
  // These are the splashes of color that should appear the most in your UI,
  // and are the ones that determine the overall "look" of the site.
  // Use these for things like primary actions, links, navigation items, icons,
  // accent borders, or text you want to emphasize.
  'green-050': '#E3F9E5',
  'green-100': '#C1EAC5',
  'green-200': '#A3D9A5',
  'green-300': '#7BC47F',
  'green-400': '#57AE5B',
  'green-500': '#3F9142',
  'green-600': '#2F8132',
  'green-700': '#207227',
  'green-800': '#0E5814',
  'green-900': '#05400A',

  // Neutrals
  // These are the colors you will use the most and will make up the majority
  // of your UI.Use them for most of your text, backgrounds, and borders, as
  // well as for things like secondary buttons and links.
  'grey-050': '#F7F7F7',
  'grey-100': '#E1E1E1',
  'grey-200': '#CFCFCF',
  'grey-300': '#B1B1B1',
  'grey-400': '#9E9E9E',
  'grey-500': '#7E7E7E',
  'grey-600': '#626262',
  'grey-700': '#515151',
  'grey-800': '#3B3B3B',
  'grey-900': '#222222',

  // Supporting
  // These colors should be used fairly conservatively throughout your UI to
  // avoid overpowering your primary colors. Use them when you need an element
  // to stand out, or to reinforce things like error states or positive trends
  // with the appropriate semantic color.
  'orange-300': '#F6AD55',
  'orange-500': '#DD6B20',
  'orange-700': '#C05621',

  'purple-050': '#EAE2F8',
  'purple-100': '#CFBCF2',
  'purple-200': '#A081D9',
  'purple-300': '#8662C7',
  'purple-400': '#724BB7',
  'purple-500': '#653CAD',
  'purple-600': '#51279B',
  'purple-700': '#421987',
  'purple-800': '#34126F',
  'purple-900': '#240754',

  'red-050': '#FFEEEE',
  'red-100': '#FACDCD',
  'red-200': '#F29B9B',
  'red-300': '#E66A6A',
  'red-400': '#D64545',
  'red-500': '#BA2525',
  'red-600': '#A61B1B',
  'red-700': '#911111',
  'red-800': '#780A0A',
  'red-900': '#610404',

  'yellow-050': '#FFFAEB',
  'yellow-100': '#FCEFC7',
  'yellow-200': '#F8E3A3',
  'yellow-300': '#F9DA8B',
  'yellow-400': '#F7D070',
  'yellow-500': '#E9B949',
  'yellow-600': '#C99A2E',
  'yellow-700': '#A27C1A',
  'yellow-800': '#7C5E10',
  'yellow-900': '#513C06',
};

const lightTheme = {
  tintColor,
  text: 'black',
  link: tintColor,
  tabIconDefault: palette['grey-400'],
  tabIconSelected: tintColor,
  tabIconInactive: palette['grey-300'],
  tabBar: 'transparent', //"#fefefe",
  errorBackground: 'red',
  errorText: '#fff',
  warningBackground: '#EAEB5E',
  warningText: '#666804',
  noticeBackground: tintColor,
  noticeText: '#fff',
  checkboxSelected: tintColor,
  secondaryText: '#aeaeae',
  // What the bonus took off the order. Green is the app's own accent and reads
  // as "done", so money saved gets the one orange in the palette instead.
  savingsText: palette['orange-700'],
  // The bonus the supermarket puts on a product, as a filled pill. It is a
  // surface with white on it rather than text on the page, so it takes the same
  // orange in both themes the way the other badge fills do: the darker
  // orange-700 that savingsText needs to stay legible as text reads as brown
  // once it is a whole pill.
  promotionBackground: palette['orange-500'],
  skeletonBone: '#E1E9EE',
  skeletonHighlight: '#F2F8FC',
  hairLineBackground: 'rgba(0, 0, 0, 0.1)',
  // A section that is set apart from the rest of the screen, the way iOS
  // recesses a grouped list. A tint of the text colour rather than a fixed
  // grey, so it stays a hint of a panel instead of a slab laid over the page.
  groupedBackground: 'rgba(0, 0, 0, 0.04)',
  // The page itself, and the same colour at zero alpha. A gradient needs both
  // ends written in the same colour: fading to a bare `transparent` fades
  // through black, which greys the middle of a light gradient.
  background: '#ffffff',
  backgroundFade: 'rgba(255, 255, 255, 0)',

  // Section
  sectionHeaderText: 'black',

  // Buttons
  navButtonText: palette['grey-800'], // #22543D?
  navButtonBackground: 'white',

  navButtonSelectedBackground: palette['grey-050'], // palette["green-050"],
  navButtonSelectedText: palette['green-700'],

  // Badge
  badgeBackground: tintColor, // palette["green-400"],
  badgeBackgroundInactive: palette['grey-300'],
  badgeText: 'white',

  // Card
  cardText: 'black',
  cardSubtitleText: palette['yellow-700'],
  cardBackground: palette['grey-050'], // "#fafafa"?
  cardHighlightBackground: palette['yellow-050'],

  // Icon
  iconDefault: '#ccc',
  iconSelected: tintColor,
};
const darkTheme = {
  tintColor,
  text: 'white',
  link: tintColor,
  tabIconDefault: palette['grey-200'],
  tabIconInactive: palette['grey-400'],
  tabIconSelected: tintColor,
  tabBar: 'transparent', //"#fefefe",
  errorBackground: 'red',
  errorText: '#fff',
  warningBackground: '#EAEB5E',
  warningText: '#666804',
  noticeBackground: tintColor,
  noticeText: '#fff',
  checkboxSelected: tintColor,
  secondaryText: '#aeaeae',
  savingsText: palette['orange-300'],
  promotionBackground: palette['orange-500'],
  skeletonBone: palette['grey-900'],
  skeletonHighlight: palette['grey-700'],
  hairLineBackground: 'rgba(255, 255, 255, 0.15)',
  groupedBackground: 'rgba(255, 255, 255, 0.06)',
  background: '#000000',
  backgroundFade: 'rgba(0, 0, 0, 0)',

  // Section
  sectionHeaderText: 'white',

  // Buttons
  navButtonText: palette['grey-800'], // #22543D?
  navButtonBackground: 'white',

  navButtonSelectedBackground: palette['grey-050'], // palette["green-050"],
  navButtonSelectedText: palette['green-700'],

  // Badge
  badgeBackground: tintColor, // palette["green-400"],
  badgeBackgroundInactive: palette['grey-800'],
  badgeText: 'white',

  // Card
  cardText: 'white',
  cardSubtitleText: palette['yellow-300'],
  cardBackground: palette['grey-800'], // "#fafafa"?
  cardHighlightBackground: palette['yellow-900'], // "#fafafa"?

  // Icon
  iconDefault: palette['grey-600'],
  iconSelected: tintColor,
};
function themeFor(scheme) {
  return scheme === 'dark' ? darkTheme : lightTheme;
}

// Subscribes to the appearance, so a component that reads its colours here
// repaints when iOS switches theme under it. Prefer this in anything that
// renders colour.
export function useTheme() {
  return themeFor(useColorScheme());
}

// The same palette as a live object: each property resolves when it is read
// rather than when this module is imported. Reading the scheme once at import
// froze every colour to whichever theme the app happened to boot in, which left
// black text on black after a switch to dark. A frozen read inside a
// module-scope StyleSheet.create still freezes, so colour belongs in the
// component body, from useTheme.
const Colors = {};
for (const key of Object.keys(lightTheme)) {
  Object.defineProperty(Colors, key, {
    enumerable: true,
    get: () => themeFor(Appearance.getColorScheme())[key],
  });
}

export default Colors;
