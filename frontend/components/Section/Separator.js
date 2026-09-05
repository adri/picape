import * as React from 'react';
import { View } from 'react-native';

import { useTheme } from '../../constants/Colors';
import { Gutter, Hairline } from '../../constants/Spacing';

// The hairline between sections. One device pixel, the same translucent tone as
// the tab bar's edge, inset to the gutter so it starts where the text does.
export function Separator({ style, full }) {
  const colors = useTheme();

  return (
    <View
      style={[
        {
          marginHorizontal: full ? 0 : Gutter,
          borderTopColor: colors.hairLineBackground,
          borderTopWidth: Hairline,
        },
        style,
      ]}
    />
  );
}
