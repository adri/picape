import { BlurView } from 'expo-blur';
import * as React from 'react';
import { Text, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '../../constants/Colors';
import Layout from '../../constants/Layout';

// What the footer occupies above the bottom safe-area inset: the button's
// 10 margin, its 20 of vertical padding, one line of text and the 20 below it.
// A screen adds this to its scroll padding so its last row clears the footer.
export const FOOTER_HEIGHT = 70;

export function FixedFooter({ buttonText, onPress, disabled }) {
  const insets = useSafeAreaInsets();
  return (
    <BlurView
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
      }}
      tint={useColorScheme()}
      intensity={100}>
      <Text
        disabled={disabled}
        onPress={(e) => !disabled && onPress(e)}
        style={{
          color: Colors.text,
          alignSelf: 'center',
          padding: 10,
          paddingHorizontal: 20,
          marginTop: 10,
          marginBottom: insets.bottom + 20,
          backgroundColor: disabled ? Colors.iconDefault : Colors.iconSelected,
          borderRadius: Layout.borderRadius,
        }}>
        {buttonText}
      </Text>
    </BlurView>
  );
}
