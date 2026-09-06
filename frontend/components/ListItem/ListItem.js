import { Image } from 'expo-image';
import * as React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

import { Subtitle } from './Subtitle';
import { useTheme } from '../../constants/Colors';
import { Radius, Spacing } from '../../constants/Spacing';
import Type from '../../constants/Type';

const THUMB = 40;

// What marks the row whose detail the pane is showing. Every row in such a list
// carries it, transparent until it is the one, so picking a different row moves
// nothing.
const RING = 2;

// One ingredient: its picture, its name, and whatever control the screen puts
// on the right.
export function ListItem({
  style,
  title,
  badges,
  subtitle,
  children,
  imageUrl,
  textStyle,
  onImagePress,
  // Only a list that opens its rows into a pane beside itself passes this, and
  // it then passes it on every row. Left out, the row carries no ring at all
  // rather than a transparent one, so a screen that pushes its detail is laid
  // out to the pixel it always was.
  selected,
}) {
  const colors = useTheme();

  let image = (
    <View
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xs,
        // Product shots come as cut-outs on white, so the tile stays light in
        // both themes. It is a shade off pure white so an image that fails to
        // load reads as an empty tile rather than a hole punched in the row.
        backgroundColor: '#f2f2f2',
        borderRadius: Radius.sm,
        width: THUMB + Spacing.sm,
        height: THUMB + Spacing.sm,
      }}>
      <Image
        source={{ uri: imageUrl }}
        contentFit="contain"
        style={{ width: THUMB, height: THUMB }}
      />
    </View>
  );

  if (onImagePress) {
    image = (
      <TouchableOpacity
        onPress={onImagePress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={title}>
        {image}
      </TouchableOpacity>
    );
  }

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.md,
          marginBottom: Spacing.sm,
          padding: Spacing.sm,
          // A trailing control is a small circle floating in space, where the
          // leading tile is a filled block that reads to its own edge. It gets
          // more room so the two sides balance, and so every control lands in
          // the same place whichever one the row happens to be showing.
          paddingRight: children ? Spacing.lg : Spacing.sm,
          backgroundColor: colors.cardBackground,
          borderRadius: Radius.md,
        },
        selected !== undefined && {
          borderWidth: RING,
          borderColor: selected ? colors.tintColor : 'transparent',
        },
        style,
      ]}>
      {image}
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text numberOfLines={2} style={[Type.row, { color: colors.cardText }, textStyle]}>
          {title}
          {!!badges && <View style={{ marginLeft: Spacing.xs }}>{badges}</View>}
        </Text>
        {!!subtitle && <Subtitle subtitle={subtitle} textStyle={textStyle} />}
      </View>
      {children}
    </View>
  );
}
