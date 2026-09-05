import * as React from 'react';
import { Text } from 'react-native';

import { useTheme } from '../../constants/Colors';
import Type from '../../constants/Type';

export function Subtitle({ textStyle, subtitle }) {
  const colors = useTheme();

  return (
    <Text
      style={[
        Type.caption,
        {
          color: colors.cardSubtitleText,
          transitionProperty: 'opacity',
          transitionDuration: '200ms',
          transitionTimingFunction: 'ease-in',
        },
        textStyle,
      ]}>
      {subtitle}
    </Text>
  );
}
