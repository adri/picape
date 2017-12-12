import React from "react";
import { StyleSheet, View, Text, Image } from "react-native";
import gql from "graphql-tag";
import { OrderIngredientWithData } from "./OrderIngredient";

export const IngredientListItem = ({ ingredient }) => (
  <View style={styles.listItem}>
    <Image source={{ url: ingredient.imageUrl }} style={styles.image} resizeMode="contain" />
    <View style={styles.descriptionContainer}>
      <Text style={styles.ingredientName}>{ingredient.name}</Text>
      <Text style={styles.unitQuantity}>{ingredient.unitQuantity}</Text>
    </View>
    <View style={{ flex: 1, marginTop: 0 }}>
      <OrderIngredientWithData id={ingredient.id} quantity={ingredient.orderedQuantity} />
    </View>
  </View>
);

IngredientListItem.fragments = {
  ingredient: gql`
    fragment ingredient on Ingredient {
      id
      name
      imageUrl
      isPlanned
      unitQuantity
      orderedQuantity
    }
  `,
};

const styles = StyleSheet.create({
  listItem: {
    flex: 1,
    flexDirection: "row",
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginLeft: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#EDEDED",
  },
  image: {
    width: 32,
    height: 32,
    overflow: "hidden",
  },
  descriptionContainer: {
    marginTop: 3,
    paddingLeft: 15,
  },
  ingredientName: {
    fontSize: 15,
  },
  unitQuantity: {
    fontSize: 12,
    color: "#CCCCCC",
  },
});
