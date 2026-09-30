import * as React from 'react';
import { Text, View } from 'react-native';

import { useTheme } from '../constants/Colors';
import { Gutter } from '../constants/Spacing';

export function ErrorState({ error }) {
  const colors = useTheme();

  return (
    <View style={{ flex: 1, padding: Gutter }}>
      <Text style={{ color: colors.text }}>{`Error! ${error}`}</Text>
    </View>
  );
}
