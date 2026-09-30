import { ImageBackground } from 'expo-image';
import * as React from 'react';
import { Animated, Platform, Pressable, View, Text, StyleSheet } from 'react-native';

import { useTheme } from '../../constants/Colors';
import { FADE_IN, prefersReducedMotion } from '../../constants/Motion';
import { Radius, Spacing } from '../../constants/Spacing';
import Type from '../../constants/Type';

// Sized so a shelf shows most of a second card, which is what tells you the
// row scrolls. The 3:2 crop is what the photos are shot at.
export const CARD_WIDTH = 200;
export const CARD_HEIGHT = 134;

// What marks the card whose recipe the pane is showing.
const RING = 2;

// A recipe as a picture with its name underneath, and room in the top corner
// for the control that plans it.
//
// The card fills whatever box its list gives it: a shelf hands it a width, a
// grid hands it a flex. It never sizes itself off its own contents, because a
// long title would otherwise stretch the cell and leave the gaps between cards
// uneven.
export function ImageCard({
  imageUrl,
  height = CARD_HEIGHT,
  // A shelf keeps every card the same height by giving each title one line, so
  // the row does not take its height from its longest name. The grid has the
  // room for two, and there the name is what you are reading.
  titleLines = 2,
  children,
  onPress,
  title,
  style,
  imageStyle,
  muted,
  badges,
  // Set only by a grid that opens its cards into a pane beside itself, and then
  // on every card. Left out, the picture keeps the frame it always had.
  selected,
}) {
  const colors = useTheme();

  // The card answers a touch by shrinking a little, the way a physical card
  // gives under a finger. A reader who asked for less motion gets no movement.
  const scale = React.useRef(new Animated.Value(1)).current;
  const pressTo = (value) => {
    if (prefersReducedMotion()) return;
    Animated.spring(scale, {
      toValue: value,
      useNativeDriver: Platform.OS !== 'web',
      speed: 40,
      bounciness: 4,
    }).start();
  };

  return (
    <Animated.View style={[style, { transform: [{ scale }] }]}>
      <ImageBackground
        source={{ uri: imageUrl }}
        contentFit="cover"
        // The picture arrives over the network. Fading it in over the
        // placeholder reads as the card filling in, where a hard swap reads
        // as a glitch.
        transition={FADE_IN}
        imageStyle={{
          borderRadius: Radius.md,
          opacity: muted ? 0.2 : 1,
        }}
        style={[
          {
            width: '100%',
            height,
            borderRadius: Radius.md,
            // Until the picture loads the card is a filled shape rather than a
            // hole in the layout. The picture paints over it, so this needs no
            // state of its own.
            backgroundColor: colors.cardBackground,
          },
          selected !== undefined && {
            borderWidth: RING,
            borderColor: selected ? colors.tintColor : 'transparent',
          },
          imageStyle,
        ]}>
        {/* The picture is the button, laid under the plan control rather than
            around it, so the two stay separate targets and the markup stays
            valid. Both are positioned against the picture, so a long title
            below cannot drag the control off the corner. */}
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onPress}
          onPressIn={() => pressTo(0.96)}
          onPressOut={() => pressTo(1)}
          accessibilityRole="button"
          accessibilityLabel={title}
          unstable_pressDelay={100}
        />
        {!!children && (
          <View
            style={{
              position: 'absolute',
              top: Spacing.sm,
              right: Spacing.sm,
              flexDirection: 'row',
              gap: Spacing.sm,
            }}>
            {children}
          </View>
        )}
      </ImageBackground>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.xs,
          paddingTop: Spacing.sm,
        }}>
        <Text
          numberOfLines={titleLines}
          style={[Type.subtitle, { color: colors.cardText, flex: 1, opacity: muted ? 0.5 : 1 }]}
          onPress={onPress}>
          {title}
        </Text>
        {badges}
      </View>
    </Animated.View>
  );
}
