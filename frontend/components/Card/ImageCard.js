import * as React from 'react';
import { View, ImageBackground, Text, TouchableOpacity, StyleSheet } from 'react-native';

import { useTheme } from '../../constants/Colors';
import { Radius, Spacing } from '../../constants/Spacing';
import Type from '../../constants/Type';

// Sized so a shelf shows most of a second card, which is what tells you the
// row scrolls. The 3:2 crop is what the photos are shot at.
export const CARD_WIDTH = 200;
export const CARD_HEIGHT = 134;

// A recipe as a picture with its name underneath, and room in the top corner
// for the control that plans it.
export function ImageCard({
  imageUrl,
  width,
  height,
  children,
  onPress,
  title,
  style,
  imageStyle,
  muted,
  badges,
}) {
  const colors = useTheme();
  const [loaded, setLoaded] = React.useState(false);
  const size = { width: width || CARD_WIDTH, height: height || CARD_HEIGHT };

  return (
    <View style={[{ paddingHorizontal: Spacing.xs, maxWidth: size.width }, style]}>
      <ImageBackground
        source={{ uri: imageUrl }}
        onLoad={() => setLoaded(true)}
        imageStyle={{
          borderRadius: Radius.md,
          resizeMode: 'cover',
          // The picture arrives over the network. Fading it in over the
          // placeholder reads as the card filling in, where a hard swap reads
          // as a glitch.
          opacity: muted ? 0.2 : 1,
          transitionProperty: 'opacity',
          transitionDuration: '260ms',
          transitionTimingFunction: 'ease-out',
        }}
        style={[
          size,
          {
            borderRadius: Radius.md,
            // Until the picture loads the card is a filled shape rather than a
            // hole in the layout.
            backgroundColor: loaded ? 'transparent' : colors.cardBackground,
          },
          imageStyle,
        ]}>
        {/* The picture is the button, laid under the plan control rather than
            around it, so the two stay separate targets and the markup stays
            valid. Both are positioned against the picture, so a long title
            below cannot drag the control off the corner. */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={onPress}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={title}
          delayPressIn={100}
        />
        {!!children && (
          <View style={{ position: 'absolute', top: Spacing.sm, right: Spacing.sm }}>
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
          numberOfLines={2}
          style={[Type.subtitle, { color: colors.cardText, flex: 1, opacity: muted ? 0.5 : 1 }]}
          onPress={onPress}>
          {title}
        </Text>
        {badges}
      </View>
    </View>
  );
}
