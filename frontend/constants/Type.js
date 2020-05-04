import { human, systemWeights, iOSUIKit } from "react-native-typography";

// @see https://github.com/hectahertz/react-native-typography#cross-platform
export default {
  sectionHeader: {
    ...human.title1Object,
    ...systemWeights.bold,
  },
  sectionLink: iOSUIKit.bodyEmphasizedObject,
  subtitle: human.caption2,
  body: human.footnoteObject,
};
