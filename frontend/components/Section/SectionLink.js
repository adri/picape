import * as React from 'react';
import { Text, TouchableOpacity } from 'react-native';

import { useTheme } from '../../constants/Colors';
import { HitTarget } from '../../constants/Spacing';
import Type from '../../constants/Type';

// The tappable word beside a section title. Plain label colour, no accent and
// no chevron: green is what this app uses to mean planned or ticked, so
// spending it on navigation makes every heading compete with the state it
// describes, and a chevron beside a heading is a table-row idiom, not a
// title-bar one. Its size and weight against the title carry it.
export function SectionLink({ title, onPress }) {
  const colors = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.4}
      accessibilityRole="link"
      accessibilityLabel={title}
      style={{ justifyContent: 'center', minHeight: HitTarget }}>
      <Text style={[Type.sectionLink, { color: colors.text }]}>{title}</Text>
    </TouchableOpacity>
  );
}
