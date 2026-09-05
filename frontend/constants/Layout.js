import { Dimensions } from 'react-native';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

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
