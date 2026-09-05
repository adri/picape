import * as React from 'react';
import { View, Image, Text, TouchableOpacity } from 'react-native';

import { Subtitle } from './Subtitle';
import { useTheme } from '../../constants/Colors';
import { Radius, Spacing } from '../../constants/Spacing';
import Type from '../../constants/Type';

const THUMB = 40;

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
        resizeMode="contain"
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
          backgroundColor: colors.cardBackground,
          borderRadius: Radius.md,
        },
        style,
      ]}>
      {image}
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Text numberOfLines={2} style={[Type.body, { color: colors.cardText }, textStyle]}>
          {title}
          {!!badges && <View style={{ marginLeft: Spacing.xs }}>{badges}</View>}
        </Text>
        {!!subtitle && <Subtitle subtitle={subtitle} textStyle={textStyle} />}
      </View>
      {children}
    </View>
  );
}
