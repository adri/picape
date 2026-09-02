import { Ionicons } from '@expo/vector-icons';
import * as React from 'react';
import { View, TouchableOpacity } from 'react-native';

import Colors from '../../constants/Colors';

export function MinusIcon(props) {
  return (
    <TouchableOpacity onPress={props.onPress}>
      <View
        style={[
          {
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor: Colors.iconDefault,
            alignItems: 'center',
            justifyContent: 'center',
          },
          props.style,
        ]}>
        <Ionicons
          name="remove"
          size={25}
          style={{
            marginTop: 2,
          }}
          color="white"
        />
      </View>
    </TouchableOpacity>
  );
}
