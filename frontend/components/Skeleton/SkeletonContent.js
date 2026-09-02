import { LinearGradient } from 'expo-linear-gradient';
import * as React from 'react';
import { Animated, Easing, Platform, StyleSheet, View } from 'react-native';

// Drop-in replacement for react-native-skeleton-content, which was last
// published in 2022 and pulls in react-native-reanimated 2.1.0. That version
// calls findNodeHandle, which react-native-web 0.20 removed, so it breaks the
// web build from Expo SDK 53 onwards.
//
// This keeps the same look using only what the app already depends on:
// expo-linear-gradient for the highlight and React Native's own Animated for
// the sweep. The original's defaults are reproduced exactly: a 4px radius,
// a 1200ms loop on a bezier(0.5, 0, 0.25, 1) curve, and a
// boneColor -> highlightColor -> boneColor gradient travelling left to right.
//
// Only the props this app actually passes are supported: layout, boneColor,
// highlightColor, containerStyle, isLoading and children. The original also
// had pulse/none animations, nested bone layouts and deriving bones from
// children, none of which this app uses.
const BORDER_RADIUS = 4;
const DURATION = 1200;

function Bone({ layout, boneColor, highlightColor }) {
  const progress = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: DURATION,
        easing: Easing.bezier(0.5, 0, 0.25, 1),
        // react-native-web has no native animated module, and asking for it
        // there logs a warning on every bone.
        useNativeDriver: Platform.OS !== 'web',
      })
    );
    animation.start();
    return () => animation.stop();
  }, [progress]);

  // Percentage widths cannot drive a translation, so sweep across the bone's
  // own box in that case.
  const distance = typeof layout.width === 'number' ? layout.width : 200;
  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-distance, distance],
  });

  return (
    <View
      style={[
        { borderRadius: BORDER_RADIUS },
        layout,
        // The original forces these after the layout, so a layout entry cannot
        // accidentally reveal the gradient outside the bone.
        { overflow: 'hidden', backgroundColor: layout.backgroundColor || boneColor },
      ]}>
      <Animated.View style={[styles.gradient, { transform: [{ translateX }] }]}>
        <LinearGradient
          colors={[boneColor, highlightColor, boneColor]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientChild}
        />
      </Animated.View>
    </View>
  );
}

function SkeletonContent({
  isLoading = true,
  layout = [],
  boneColor = '#E1E9EE',
  highlightColor = '#F2F8FC',
  containerStyle,
  children,
}) {
  return (
    <View style={containerStyle}>
      {isLoading
        ? layout.map((bone, index) => (
            <Bone
              key={bone.key || index}
              layout={bone}
              boneColor={boneColor}
              highlightColor={highlightColor}
            />
          ))
        : children}
    </View>
  );
}

const styles = StyleSheet.create({
  gradient: {
    position: 'absolute',
    height: '100%',
    width: '100%',
  },
  gradientChild: {
    flex: 1,
  },
});

export default React.memo(SkeletonContent);
