import { useNavigation } from '@react-navigation/native';
import * as React from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { useTheme } from '../../constants/Colors';
import { DETAIL_PANE_WIDTH, PANE_MIN_WIDTH } from '../../constants/Layout';
import { Hairline, Spacing } from '../../constants/Spacing';
import Type from '../../constants/Type';

// Two panes on a tablet, one pushed screen on a phone.
//
// A list screen keeps working the way it always did; what changes is where the
// thing you tapped ends up. Wide enough and it lands in the pane beside the
// list, so the list keeps its scroll position and you can go straight to the
// next item. Narrow and it is pushed onto the stack exactly as before, which is
// why every phone screenshot is unchanged.

// Whether this screen is wide enough for two panes. Reads the window rather
// than the screen, so a resize and a rotation both move it.
export function useSplitLayout() {
  return useWindowDimensions().width >= PANE_MIN_WIDTH;
}

// What a detail screen is rendered inside. Absent means it was pushed.
const PaneContext = React.createContext(null);

// A detail screen asks this what "done" means, rather than assuming a stack
// under it. In a pane, done clears the selection beside the list; pushed, it is
// the back button it has always been.
export function useDetailPane() {
  const pane = React.useContext(PaneContext);
  const navigation = useNavigation();

  return pane || { inPane: false, dismiss: () => navigation.goBack() };
}

// The selection a list screen holds while it is wide.
//
// `open` is what a row's press handler calls in place of navigate. It is the
// one place that knows which of the two behaviours this width gets, so nothing
// below has to ask.
export function useSelection(routeName) {
  const navigation = useNavigation();
  const wide = useSplitLayout();
  const [selected, setSelected] = React.useState(null);

  const open = React.useCallback(
    (params) => {
      if (wide) setSelected(params);
      else navigation.navigate(routeName, params);
    },
    [wide, navigation, routeName]
  );

  const clear = React.useCallback(() => setSelected(null), []);

  // Rotating to a width with no pane takes the pane away, and with it whatever
  // was in it. Hand that to the stack instead: you end up on the detail you
  // were reading, with a back button to the list, rather than back on the list
  // with nothing to show for the tap.
  // Only the screen you are looking at: every tab stays mounted, so without
  // this a selection left behind on another tab would push its own detail over
  // the one you are actually reading.
  React.useEffect(() => {
    if (wide || !selected || !navigation.isFocused()) return;

    setSelected(null);
    navigation.navigate(routeName, selected);
  }, [wide, selected, navigation, routeName]);

  return { wide, selected, open, clear };
}

export function SplitView({ list, detail, placeholder, onDismiss }) {
  const colors = useTheme();
  const pane = React.useMemo(() => ({ inPane: true, dismiss: onDismiss }), [onDismiss]);

  return (
    <View style={styles.split}>
      <View style={styles.list}>{list}</View>
      <View
        style={[
          styles.detail,
          { borderLeftColor: colors.hairLineBackground, backgroundColor: colors.background },
        ]}>
        {detail ? (
          <PaneContext.Provider value={pane}>{detail}</PaneContext.Provider>
        ) : (
          <View style={styles.placeholder}>
            <Text style={[Type.row, { color: colors.secondaryText }]}>{placeholder}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  split: {
    flex: 1,
    flexDirection: 'row',
  },
  // The list absorbs the extra width a bigger display brings, because that is
  // what turns into another column of recipes.
  list: {
    flex: 1,
    minWidth: 0,
  },
  detail: {
    width: DETAIL_PANE_WIDTH,
    borderLeftWidth: Hairline,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
});
