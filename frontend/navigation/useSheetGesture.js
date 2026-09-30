import { useCallback, useRef } from 'react';
import { Platform } from 'react-native';

// A sheet should only grab a downward pull while its ScrollView sits at the
// top. Below that the pull belongs to the scroll, which is how a real iOS
// sheet treats it. Attach the returned handler to the sheet's ScrollView.
// Native iOS sheets already coordinate this in UIKit, so this only applies
// to the JS stack on web.
export function useSheetGesture(navigation) {
  const atTop = useRef(true);

  return useCallback(
    (event) => {
      if (Platform.OS !== 'web') {
        return;
      }
      const top = event.nativeEvent.contentOffset.y <= 0;
      if (top !== atTop.current) {
        atTop.current = top;
        navigation.setOptions({ gestureEnabled: top });
      }
    },
    [navigation]
  );
}
