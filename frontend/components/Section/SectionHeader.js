import * as React from 'react';
import { View, Text } from 'react-native';

import { useTheme } from '../../constants/Colors';
import { Gutter, Spacing } from '../../constants/Spacing';
import Type from '../../constants/Type';

// The row that titles a screen or a section, with room on the right for a link
// or a control. Pass `large` on the one heading that names the whole screen;
// everything below it is a section and takes the smaller size, so a screen
// reads as a hierarchy rather than a stack of equal shouts.
export function SectionHeader({ title, large, style, children }) {
  const colors = useTheme();

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginHorizontal: Gutter,
          paddingTop: large ? Spacing.lg : Spacing.xl,
          paddingBottom: Spacing.md,
          gap: Spacing.md,
        },
        style,
      ]}>
      <Text
        style={[large ? Type.largeTitle : Type.title, { color: colors.sectionHeaderText, flex: 1 }]}
        // A screen has one title, and it is the first thing to read out.
        accessibilityRole="header">
        {title}
      </Text>
      {children}
    </View>
  );
}
