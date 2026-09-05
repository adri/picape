import { Ionicons } from '@expo/vector-icons';
import * as React from 'react';
import { View, TouchableOpacity } from 'react-native';

import { useTheme } from '../../constants/Colors';
import { Radius, hitSlopFor } from '../../constants/Spacing';

// The circular glyph button the app uses everywhere: add, remove, check, close,
// back, edit. One component so they share a size, a press feel and a touch
// target, and so a colour change lands on all of them at once.
export const CIRCLE_SIZE = 30;

export function CircleIcon({
  name,
  glyphSize = 22,
  // Ionicons centres each glyph in its own advance box, but the ink inside that
  // box is not always centred, so a few glyphs need a nudge. Measured, not
  // guessed: see the icon alignment check in the browser.
  glyphOffset,
  selected,
  // Room around the circle inside the touchable. The buttons that float over a
  // screen use it to keep their distance from the display edge while staying
  // one target, rather than nesting a margin inside a second view.
  pad = 0,
  style,
  onPress,
  accessibilityLabel,
}) {
  const colors = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      hitSlop={hitSlopFor(CIRCLE_SIZE + pad * 2)}
      activeOpacity={0.6}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[{ padding: pad }, style]}>
      <View
        style={{
          width: CIRCLE_SIZE,
          height: CIRCLE_SIZE,
          borderRadius: Radius.pill,
          backgroundColor: selected ? colors.iconSelected : colors.iconDefault,
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}>
        <Ionicons
          name={name}
          size={glyphSize}
          color="white"
          style={{
            lineHeight: CIRCLE_SIZE,
            marginTop: glyphOffset ? glyphOffset : 0,
          }}
        />
      </View>
    </TouchableOpacity>
  );
}
