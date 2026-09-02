import * as React from 'react';
import { Text, Platform, StyleSheet } from 'react-native';

import Colors from '../../constants/Colors';
import Type from '../../constants/Type';

export function Subtitle({ textStyle, subtitle }) {
  return <Text style={[Type.subtitle, styles.subtitle, textStyle]}>{subtitle}</Text>;
}

const styles = StyleSheet.create({
  subtitle: {
    color: Colors.cardSubtitleText,
    ...Platform.select({
      web: {
        transitionProperty: ['opacity'],
        transitionDuration: '200ms',
        transitionTimingFunction: 'ease-in',
      },
    }),
  },
});
