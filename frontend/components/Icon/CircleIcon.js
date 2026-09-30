import { Ionicons } from '@expo/vector-icons';
import * as React from 'react';
import { View, TouchableOpacity } from 'react-native';

import { useTheme } from '../../constants/Colors';
import { Radius, hitSlopFor } from '../../constants/Spacing';
import { Glass, glassAvailable } from '../Glass/Glass';

// The circular glyph button the app uses everywhere: add, remove, check, close,
// back, edit. One component so they share a size, a press feel and a touch
// target, and so a colour change lands on all of them at once.
export const CIRCLE_SIZE = 36;

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

  const circleStyle = {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  };

  const glyph = (
    <Ionicons
      name={name}
      size={glyphSize}
      color={glassAvailable && !selected ? colors.cardText : 'white'}
      style={{
        lineHeight: CIRCLE_SIZE,
        marginTop: glyphOffset ? glyphOffset : 0,
      }}
    />
  );

  return (
    <TouchableOpacity
      onPress={onPress}
      hitSlop={hitSlopFor(CIRCLE_SIZE + pad * 2)}
      // The interactive glass already answers a press by deforming, so a dim
      // on top would double the feedback.
      activeOpacity={glassAvailable ? 1 : 0.6}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={[{ padding: pad }, style]}>
      {glassAvailable ? (
        <Glass
          interactive
          tintColor={selected ? colors.iconSelected : undefined}
          style={circleStyle}>
          {glyph}
        </Glass>
      ) : (
        <View
          style={[
            circleStyle,
            { backgroundColor: selected ? colors.iconSelected : colors.iconDefault },
          ]}>
          {glyph}
        </View>
      )}
    </TouchableOpacity>
  );
}
