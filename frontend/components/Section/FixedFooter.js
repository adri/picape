import { LinearGradient } from 'expo-linear-gradient';
import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../constants/Colors';
import Layout from '../../constants/Layout';
import { Spacing } from '../../constants/Spacing';
import Type from '../../constants/Type';

// What the footer's button occupies above the bottom safe-area inset: its own
// padding, one line of text and the room below it. A screen adds this to its
// scroll padding so its last row is not left under the button. The fade above
// the button is deliberately not counted: content is meant to pass under it.
export const FOOTER_HEIGHT = 70;

// How far the page fades out above the button.
const FADE = Spacing.xxl;

// The action that stays put at the bottom of a screen while its content
// scrolls: Gekookt, Opslaan, Recepten plannen.
//
// It used to be a BlurView, which is 78% opaque over whatever happens to be
// behind it. That is fine over a continuous run of content and wrong at the end
// of one: where the page ran out, the bar had nothing to blur and rendered as a
// hard-edged black slab above the home indicator, changing tone at every gap
// between two cards. A gradient into the page colour has no edge to catch,
// whatever is or is not behind it.
export function FixedFooter({ buttonText, onPress, disabled }) {
  const insets = useSafeAreaInsets();
  const colors = useTheme();

  return (
    <View
      // The fade is scenery. Only the button takes touches, so the page still
      // scrolls under it.
      pointerEvents="box-none"
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingTop: FADE,
        paddingBottom: insets.bottom + Spacing.xl,
      }}>
      <LinearGradient
        pointerEvents="none"
        colors={[colors.backgroundFade, colors.background, colors.background]}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />
      <Text
        disabled={disabled}
        onPress={(e) => !disabled && onPress(e)}
        accessibilityRole="button"
        accessibilityState={{ disabled: !!disabled }}
        style={[
          Type.sectionLink,
          {
            color: colors.text,
            paddingVertical: Spacing.md,
            paddingHorizontal: Spacing.xxl,
            backgroundColor: disabled ? colors.iconDefault : colors.iconSelected,
            borderRadius: Layout.borderRadius,
            overflow: 'hidden',
          },
        ]}>
        {buttonText}
      </Text>
    </View>
  );
}
