import { human, iOSUIKit, systemWeights } from 'react-native-typography';

// The iOS text styles, named as Apple names them. Reach for one of these rather
// than a fontSize: the sizes, line heights and letter spacing come from the
// system, so text matches what the rest of the phone does and follows the
// reader's Dynamic Type setting.
//
// @see https://github.com/hectahertz/react-native-typography#cross-platform
export default {
  // A screen's own name, once, at the top.
  largeTitle: {
    ...human.title1Object,
    ...systemWeights.bold,
  },
  // A section within a screen.
  title: {
    ...human.title3Object,
    ...systemWeights.semibold,
  },
  // The tappable word beside a section title.
  sectionLink: iOSUIKit.subheadObject,
  // Running text.
  body: human.bodyObject,
  // A list row's own name. A step down from body: a screen of these at full
  // body size reads as a wall rather than a list.
  row: human.subheadObject,
  // A row's supporting line.
  subtitle: human.footnoteObject,
  // The smallest supporting text.
  caption: human.caption1Object,

  // Kept so screens not yet moved onto the scale above keep rendering.
  sectionHeader: {
    ...human.title1Object,
    ...systemWeights.bold,
  },
};
