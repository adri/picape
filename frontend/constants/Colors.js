import { Appearance } from "react-native-appearance";

const colorScheme = Appearance.getColorScheme();
const tintColor = "#48BB78";

// Palette 12
const palette = {
  // Primary
  // These are the splashes of color that should appear the most in your UI,
  // and are the ones that determine the overall "look" of the site.
  // Use these for things like primary actions, links, navigation items, icons,
  // accent borders, or text you want to emphasize.
  "green-050": "#E3F9E5",
  "green-100": "#C1EAC5",
  "green-200": "#A3D9A5",
  "green-300": "#7BC47F",
  "green-400": "#57AE5B",
  "green-500": "#3F9142",
  "green-600": "#2F8132",
  "green-700": "#207227",
  "green-800": "#0E5814",
  "green-900": "#05400A",

  // Neutrals
  // These are the colors you will use the most and will make up the majority
  // of your UI.Use them for most of your text, backgrounds, and borders, as
  // well as for things like secondary buttons and links.
  "grey-050": "#F7F7F7",
  "grey-100": "#E1E1E1",
  "grey-200": "#CFCFCF",
  "grey-300": "#B1B1B1",
  "grey-400": "#9E9E9E",
  "grey-500": "#7E7E7E",
  "grey-600": "#626262",
  "grey-700": "#515151",
  "grey-800": "#3B3B3B",
  "grey-900": "#222222",

  // Supporting
  // These colors should be used fairly conservatively throughout your UI to
  // avoid overpowering your primary colors. Use them when you need an element
  // to stand out, or to reinforce things like error states or positive trends
  // with the appropriate semantic color.
  "purple-050": "#EAE2F8",
  "purple-100": "#CFBCF2",
  "purple-200": "#A081D9",
  "purple-300": "#8662C7",
  "purple-400": "#724BB7",
  "purple-500": "#653CAD",
  "purple-600": "#51279B",
  "purple-700": "#421987",
  "purple-800": "#34126F",
  "purple-900": "#240754",

  "red-050": "#FFEEEE",
  "red-100": "#FACDCD",
  "red-200": "#F29B9B",
  "red-300": "#E66A6A",
  "red-400": "#D64545",
  "red-500": "#BA2525",
  "red-600": "#A61B1B",
  "red-700": "#911111",
  "red-800": "#780A0A",
  "red-900": "#610404",

  "yellow-050": "#FFFAEB",
  "yellow-100": "#FCEFC7",
  "yellow-200": "#F8E3A3",
  "yellow-300": "#F9DA8B",
  "yellow-400": "#F7D070",
  "yellow-500": "#E9B949",
  "yellow-600": "#C99A2E",
  "yellow-700": "#A27C1A",
  "yellow-800": "#7C5E10",
  "yellow-900": "#513C06",
};

const lightTheme = {
  tintColor,
  text: "black",
  tabIconDefault: palette["grey-400"],
  tabIconSelected: tintColor,
  tabBar: "transparent", //"#fefefe",
  errorBackground: "red",
  errorText: "#fff",
  warningBackground: "#EAEB5E",
  warningText: "#666804",
  noticeBackground: tintColor,
  noticeText: "#fff",
  checkboxSelected: tintColor,
  secondaryText: "#aeaeae",
  skeletonBone: "#E1E9EE",
  skeletonHighlight: "#F2F8FC",
  hairLineBackground: "#ececec",

  // Section
  sectionHeaderText: "black",

  // Buttons
  navButtonText: palette["grey-800"], // #22543D?
  navButtonBackground: "white",

  navButtonSelectedBackground: palette["grey-050"], // palette["green-050"],
  navButtonSelectedText: palette["green-700"],

  // Badge
  badgeBackground: tintColor, // palette["green-400"],
  badgeText: "white",

  // Card
  cardText: "white",
  cardBackground: palette["grey-050"], // "#fafafa"?
  cardHighlightBackground: palette["yellow-050"], // "#fafafa"?

  // Icon
  iconDefault: "#ccc",
  iconSelected: tintColor,
};
const darkTheme = {
  tintColor,
  text: "white",
  tabIconDefault: palette["grey-200"],
  tabIconSelected: tintColor,
  tabBar: "transparent", //"#fefefe",
  errorBackground: "red",
  errorText: "#fff",
  warningBackground: "#EAEB5E",
  warningText: "#666804",
  noticeBackground: tintColor,
  noticeText: "#fff",
  checkboxSelected: tintColor,
  secondaryText: "#aeaeae",
  skeletonBone: palette["grey-900"],
  skeletonHighlight: palette["grey-700"],
  hairLineBackground: palette["grey-900"],

  // Section
  sectionHeaderText: "white",

  // Buttons
  navButtonText: palette["grey-800"], // #22543D?
  navButtonBackground: "white",

  navButtonSelectedBackground: palette["grey-050"], // palette["green-050"],
  navButtonSelectedText: palette["green-700"],

  // Badge
  badgeBackground: tintColor, // palette["green-400"],
  badgeText: "white",

  // Card
  cardText: "white",
  cardBackground: palette["grey-800"], // "#fafafa"?
  cardHighlightBackground: palette["yellow-900"], // "#fafafa"?

  // Icon
  iconDefault: palette["grey-600"],
  iconSelected: tintColor,
};
const theme = colorScheme === "dark" ? darkTheme : lightTheme;

export default theme;
