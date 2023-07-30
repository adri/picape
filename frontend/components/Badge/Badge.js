import * as React from 'react';
import Colors from '../../constants/Colors';
import { View, Text, TouchableOpacity } from 'react-native';

export function Badge({ amount, onPress, outline = false, small }) {
  const badge = (
    <View
      style={{
        width: small ? 15 : 30,
        height: small ? 15 : 30,
        margin: small ? 2 : 10,
        backgroundColor: outline
          ? 'transparent'
          : onPress
          ? Colors.badgeBackground
          : Colors.iconDefault,
        borderWidth: outline ? 1 : 0,
        borderColor: outline ? Colors.tintColor : 'transparent',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Text
        style={{
          fontWeight: '700',
          fontSize: small ? 10 : 15,
          color: 'white',
        }}>
        {amount}
      </Text>
    </View>
  );

  if (!onPress) {
    return badge;
  }

  return <TouchableOpacity onPress={onPress}>{badge}</TouchableOpacity>;
}
