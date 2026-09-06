import { LinearGradient } from 'expo-linear-gradient';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import { prefersReducedMotion } from '../../constants/Motion';

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
  return (
    <View
      style={[
        { borderRadius: BORDER_RADIUS },
        layout,
        // The original forces these after the layout, so a layout entry cannot
        // accidentally reveal the gradient outside the bone.
        { overflow: 'hidden', backgroundColor: layout.backgroundColor || boneColor },
      ]}>
      {/* The sweep is the only thing in the app that travels and never stops:
          it starts on its own, repeats for as long as the query takes, and
          runs beside content the reader is trying to read. So a reader who
          asked for less motion gets the bone standing still. It still says
          what it said, because the bone is the placeholder. */}
      {prefersReducedMotion() ? null : (
        <View style={styles.sweep}>
          <LinearGradient
            colors={[boneColor, highlightColor, boneColor]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientChild}
          />
        </View>
      )}
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
  // A CSS animation rather than Animated. react-native-web has no native
  // driver, so Animated would step this transform from JavaScript on every
  // frame, for every bone on the screen at once, on the same thread that is
  // rendering the screen underneath. A keyframed transform runs on the
  // compositor and costs the main thread nothing.
  //
  // It has to live in StyleSheet.create. react-native-web builds an @keyframes
  // rule from animationKeyframes only here; its inline path drops the property
  // outright, and for a long time this bone reached the browser with a duration
  // and animation-name: none, and never swept at all.
  //
  // The travel is a percentage of the bone rather than its measured width, so
  // one rule serves every bone. That is what makes it hoistable, and it also
  // sweeps the bones whose width is a percentage, which used to fall back to a
  // fixed 200px and undershoot or overshoot.
  sweep: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    animationKeyframes: [
      {
        '0%': { transform: 'translateX(-100%)' },
        '100%': { transform: 'translateX(100%)' },
      },
    ],
    animationDuration: `${DURATION}ms`,
    animationIterationCount: 'infinite',
    animationTimingFunction: 'cubic-bezier(0.5, 0, 0.25, 1)',
  },
  gradientChild: {
    flex: 1,
  },
});

export default React.memo(SkeletonContent);
