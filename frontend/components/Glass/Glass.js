import { GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable } from 'expo-glass-effect';
import * as React from 'react';
import { Platform, View } from 'react-native';

// The system liquid glass only exists on iOS 26 and later. isGlassEffectAPIAvailable
// stays on the list because the check is free and some iOS 26 betas shipped
// without the API: on those, UIGlassEffect crashes rather than degrades.
export const glassAvailable =
  Platform.OS === 'ios' && isLiquidGlassAvailable() && isGlassEffectAPIAvailable();

// On iOS 26 this is a UIGlassEffect surface. Everywhere else it is a plain
// view, so a control keeps the background it already had on web and older iOS.
export function Glass({ interactive, glassEffectStyle = 'regular', ...props }) {
  if (!glassAvailable) {
    return <View {...props} />;
  }
  return <GlassView glassEffectStyle={glassEffectStyle} isInteractive={interactive} {...props} />;
}
