import * as React from "react";
import Colors from "../../constants/Colors";
import { StyleSheet, View, Image, Text } from "react-native";
import Type from "../../constants/Type";
import Layout from "../../constants/Layout";
import { Subtitle } from "./Subtitle";

export function ListItem({
  style,
  title,
  subtitle,
  children,
  imageUrl,
  textStyle,
}) {
  return (
    <View style={[styles.container, style]}>
      <View style={{ justifyContent: "center" }}>
        <Image
          source={{ uri: imageUrl }}
          fadeDuration={0.2}
          resizeMode="contain"
          style={styles.image}
        />
      </View>
      <View style={styles.titleContainer}>
        <Text style={[Type.body, { color: Colors.cardText }, textStyle]}>
          {title}
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
    flexDirection: "row",
    backgroundColor: Colors.cardBackground,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Layout.borderRadius,
  },
  image: {
    borderRadius: 8,
    width: 35,
    height: 35,
  },
  titleContainer: {
    flex: 1,
    marginLeft: 10,
    alignSelf: "stretch",
    justifyContent: "center",
  },
});
