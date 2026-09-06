import * as React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

import { useTheme } from '../../constants/Colors';
import { Radius, hitSlopFor } from '../../constants/Spacing';
import Type from '../../constants/Type';

// Exported so a row that may or may not show a badge can reserve its height and
// not jump when one appears.
export const BADGE_SIZE = { small: 16, regular: 28 };
const SIZE = BADGE_SIZE;

// A count, or an empty ring to tick off. Sized so the number sits on the
// optical centre rather than the text baseline.
export function Badge({ amount, onPress, outline = false, small, backgroundColor = null, style }) {
  const colors = useTheme();
  const size = small ? SIZE.small : SIZE.regular;

  const fill = backgroundColor
    ? backgroundColor
    : outline
    ? 'transparent'
    : onPress
    ? colors.badgeBackground
    : colors.iconDefault;

  const badge = (
    <View
      style={[
        {
          minWidth: size,
          height: size,
          paddingHorizontal: small ? 0 : 6,
          backgroundColor: fill,
          borderWidth: outline ? 1.5 : 0,
          borderColor: outline ? colors.tintColor : 'transparent',
          borderRadius: Radius.pill,
          justifyContent: 'center',
          alignItems: 'center',
        },
        style,
      ]}>
      {amount !== undefined && amount !== null && (
        <Text
          style={[
            small ? Type.caption : Type.subtitle,
            { fontWeight: '600', color: 'white', textAlign: 'center' },
          ]}>
          {amount}
        </Text>
      )}
    </View>
  );

  if (!onPress) {
    return badge;
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.6}
      hitSlop={hitSlopFor(size)}
      accessibilityRole="button">
      {badge}
    </TouchableOpacity>
  );
}
