// Web resolves this file, not NativeTabNavigator.ios.js, so the web bundle
// never sees @bottom-tabs/react-navigation — it imports a native codegen
// component that Expo's web resolver refuses. The web tab navigator lives in
// BottomTabNavigator.js and is the only one web renders.
export default function NativeTabNavigator() {
  return null;
}
