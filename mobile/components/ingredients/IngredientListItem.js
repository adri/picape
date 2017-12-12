import React from "react";
import { StyleSheet, View, Text, Image } from "react-native";
import { Entypo } from "@expo/vector-icons";
import gql from "graphql-tag";

export const IngredientListItem = ({ ingredient }) => (
  <View style={styles.listItem}>
    <Image source={{ url: ingredient.imageUrl }} style={styles.image} resizeMode="contain" />
    <View style={styles.descriptionContainer}>
      <Text style={styles.ingredientName}>{ingredient.name}</Text>
      <Text style={styles.unitQuantity}>{ingredient.unitQuantity}</Text>
    </View>
    <View style={styles.orderedQuantityContainer}>
      <Entypo name="circle-with-plus" size={16} color="grey" />
      <Text style={styles.orderedQuantity}>{ingredient.orderedQuantity}</Text>
      <Entypo name="circle-with-minus" size={16} color="grey" />
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
  orderedQuantityContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignSelf: "flex-end",
  },
  orderedQuantity: {
    fontSize: 12,
    paddingHorizontal: 5,
  },
});
