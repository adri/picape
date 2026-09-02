import * as React from 'react';
import { View, ImageBackground, Text, TouchableOpacity, StyleSheet } from 'react-native';

import Colors from '../../constants/Colors';
import Layout from '../../constants/Layout';
import Type from '../../constants/Type';

export function ImageCard({
  imageUrl,
  width,
  children,
  onPress,
  title,
  style,
  imageStyle,
  muted,
  badges,
}) {
  return (
    <View style={[{ borderColor: '#cdcdcd', paddingHorizontal: 5 }, style]}>
      <TouchableOpacity onPress={onPress} style={{ flex: 3 }} delayPressIn={100}>
        <ImageBackground
          source={{ uri: imageUrl }}
          imageStyle={[styles.imageBackground, muted && styles.mutedImage]}
          style={{ flex: 1 }}>
          <View
            style={[
              {
                flexDirection: 'row-reverse',
                width: width || 230,
                height: 180,
              },
              imageStyle,
            ]}>
            {children}
          </View>
        </ImageBackground>
      </TouchableOpacity>
      <View style={{ flex: 1, flexDirection: 'row', gap: 5, paddingTop: 10 }}>
        <Text
          style={[Type.body, { color: Colors.cardText }, muted && styles.mutedText]}
          onPress={onPress}>
          {title}
        </Text>
        {badges && badges}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  imageBackground: {
    borderRadius: Layout.borderRadius,
    resizeMode: 'cover',
  },
  mutedImage: {
    opacity: 0.2,
  },
  mutedText: {
    opacity: 0.5,
  },
});
