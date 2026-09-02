import { Ionicons } from '@expo/vector-icons';
import * as React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';

import Colors from '../../constants/Colors';

export function EditIcon(props) {
  return (
    <TouchableOpacity onPress={props.onPress} style={styles.touchable}>
      <View style={[styles.container, props.style]}>
        <Ionicons name="create-outline" size={20} style={styles.icon} color="white" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchable: {
    // SectionHeader aligns its children on the text baseline, and this
    // touchable is the flex item, so its position came from the icon glyph's
    // baseline. Ionicons changed its font metrics and the button moved.
    // Centring the item instead makes the position independent of the font.
    alignSelf: 'center',
    // Centring alone sits 5px above where the old baseline alignment put it,
    // because the title's padding is asymmetric (20 top, 15 bottom). A centred
    // flex item shifts by half its top margin, so 10 restores those 5px.
    marginTop: 10,
  },
  container: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.iconDefault,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    lineHeight: 30,
    marginLeft: 2,
  },
});
