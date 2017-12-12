import { ImageBackground, StyleSheet, View } from "react-native";
import { Layout } from "../../constants/Layout";
import React from "react";

export const RecipeImage = ({ imageUrl, children }) => {
  if (!imageUrl) {
    return <View style={[styles.image, styles.imagePlaceholder]}>{children}</View>;
  }

  return (
    <ImageBackground source={{ url: imageUrl }} style={styles.image}>
      {children}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  image: {
    margin: 0,
    padding: 0,
    width: Layout.window.width,
    height: Layout.window.width * 0.65,
  },
  imagePlaceholder: {
    backgroundColor: "#CCCCCC",
  },
});
