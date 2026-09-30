import * as React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

import { useTheme } from '../../constants/Colors';
import { Radius, hitSlopFor } from '../../constants/Spacing';
import Type from '../../constants/Type';
import { Glass, glassAvailable } from '../Glass/Glass';

import { CIRCLE_SIZE } from '../Icon/CircleIcon';

// Exported so a row that may or may not show a badge can reserve its height and
// not jump when one appears.
export const BADGE_SIZE = { small: 16, regular: 28, large: CIRCLE_SIZE };
const SIZE = BADGE_SIZE;

// A count, or an empty ring to tick off. Sized so the number sits on the
// optical centre rather than the text baseline.
export function Badge({ amount, onPress, outline = false, small, backgroundColor = null, style }) {
  const colors = useTheme();
  // A badge you can press is a button, so it takes the same size as the round
  // icon buttons around it. Static counts keep the smaller reading size.
  const size = small ? SIZE.small : onPress ? SIZE.large : SIZE.regular;

  const fill = backgroundColor
    ? backgroundColor
    : outline
    ? 'transparent'
    : onPress
    ? colors.badgeBackground
    : colors.iconDefault;

  const badgeStyle = [
    {
      minWidth: size,
      height: size,
      paddingHorizontal: small ? 0 : 6,
      borderWidth: outline ? 1.5 : 0,
      borderColor: outline ? colors.tintColor : 'transparent',
      borderRadius: Radius.pill,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    style,
  ];

  const text =
    amount === undefined || amount === null ? null : (
      <Text
        style={[
          small ? Type.caption : onPress ? Type.body : Type.subtitle,
          { fontWeight: '600', color: 'white', textAlign: 'center' },
        ]}>
        {amount}
      </Text>
    );

  // A badge you can press is a control, so on iOS 26 it is tinted glass like
  // the buttons around it. Static counts and outlines keep their fill.
  const glassBadge = glassAvailable && onPress && !outline && !small;
  const badge = glassBadge ? (
    <Glass interactive tintColor={fill} style={badgeStyle}>
      {text}
    </Glass>
  ) : (
    <View style={[badgeStyle, { backgroundColor: fill }]}>{text}</View>
  );

  if (!onPress) {
    return badge;
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      // The interactive glass already answers a press by deforming, so a dim
      // on top would double the feedback.
      activeOpacity={glassBadge ? 1 : 0.6}
      hitSlop={hitSlopFor(size)}
      accessibilityRole="button">
      {badge}
    </TouchableOpacity>
  );
}
