import * as React from 'react';
import { StyleSheet, View, Image, Text, TouchableOpacity } from 'react-native';

import { Subtitle } from './Subtitle';
import Colors from '../../constants/Colors';
import Layout from '../../constants/Layout';
import Type from '../../constants/Type';
import { Badge } from '../Badge/Badge';

export function ListItem({
  style,
  title,
  badges,
  subtitle,
  children,
  imageUrl,
  textStyle,
  onImagePress,
}) {
  let image = (
    <View style={styles.imageContainer}>
      <Image
        source={{ uri: imageUrl }}
        fadeDuration={0.2}
        resizeMode="contain"
        style={styles.image}
      />
    </View>
  );

  if (onImagePress) {
    image = <TouchableOpacity onPress={onImagePress}>{image}</TouchableOpacity>;
  }

  return (
    <View style={[styles.container, style]}>
      {image}
      <View style={styles.titleContainer}>
        <Text style={[Type.body, { color: Colors.cardText }, textStyle]}>
          {title}
          {!!badges && <View style={{ marginLeft: 3 }}>{badges}</View>}
        </Text>
        {!!subtitle && <Subtitle subtitle={subtitle} textStyle={textStyle} />}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 10,
    flexDirection: 'row',
    backgroundColor: Colors.cardBackground,
    paddingHorizontal: 10,
    paddingLeft: 5,
    paddingVertical: 5,
    borderRadius: Layout.borderRadius,
  },
  imageContainer: {
    justifyContent: 'center',
    padding: 4,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  image: {
    width: 40,
    height: 40,
  },
  titleContainer: {
    flex: 1,
    marginLeft: 10,
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
});
