import * as React from 'react';
import { Text, TouchableOpacity } from 'react-native';

import { useTheme } from '../../constants/Colors';
import { HitTarget } from '../../constants/Spacing';
import Type from '../../constants/Type';

// The tappable word beside a section title. It takes the accent colour, because
// grey text that happens to be a button reads as a label nobody can press.
export function SectionLink({ title, onPress }) {
  const colors = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.5}
      accessibilityRole="link"
      accessibilityLabel={title}
      style={{ justifyContent: 'center', minHeight: HitTarget }}>
      <Text style={[Type.sectionLink, { color: colors.link }]}>{title}</Text>
    </TouchableOpacity>
  );
}
