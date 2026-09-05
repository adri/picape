import { LinearGradient } from 'expo-linear-gradient';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';

// Drop-in replacement for react-native-skeleton-content, which was last
// published in 2022 and pulls in react-native-reanimated 2.1.0. That version
// calls findNodeHandle, which react-native-web 0.20 removed, so it breaks the
// web build from Expo SDK 53 onwards.
//
// This keeps the same look using only what the app already depends on:
// expo-linear-gradient for the highlight and a CSS keyframe animation for the
// sweep. The original's defaults are reproduced exactly: a 4px radius, a 1200ms
// loop on a bezier(0.5, 0, 0.25, 1) curve, and a
// boneColor -> highlightColor -> boneColor gradient travelling left to right.
//
// Only the props this app actually passes are supported: layout, boneColor,
// highlightColor, containerStyle, isLoading and children. The original also
// had pulse/none animations, nested bone layouts and deriving bones from
// children, none of which this app uses.
const BORDER_RADIUS = 4;
const DURATION = 1200;

function Bone({ layout, boneColor, highlightColor }) {
  // Percentage widths cannot drive a translation, so sweep across the bone's
  // own box in that case.
  const distance = typeof layout.width === 'number' ? layout.width : 200;

  return (
    <View
      style={[
        { borderRadius: BORDER_RADIUS },
        layout,
        // The original forces these after the layout, so a layout entry cannot
        // accidentally reveal the gradient outside the bone.
        { overflow: 'hidden', backgroundColor: layout.backgroundColor || boneColor },
      ]}>
      <View
        style={[
          styles.gradient,
          {
            // A CSS animation rather than Animated. react-native-web has no
            // native driver, so Animated would step this transform from
            // JavaScript on every frame, for every bone on the screen at once,
            // on the same thread that is rendering the screen underneath. A
            // keyframed transform runs on the compositor and costs the main
            // thread nothing.
            animationKeyframes: [
              {
                '0%': { transform: [{ translateX: -distance }] },
                '100%': { transform: [{ translateX: distance }] },
              },
            ],
            animationDuration: `${DURATION}ms`,
            animationIterationCount: 'infinite',
            animationTimingFunction: 'cubic-bezier(0.5, 0, 0.25, 1)',
          },
        ]}>
        <LinearGradient
          colors={[boneColor, highlightColor, boneColor]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientChild}
        />
      </View>
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
