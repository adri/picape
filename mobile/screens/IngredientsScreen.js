import React from "react";
import { ActivityIndicator, ScrollView, StyleSheet, FlatList, Text, View, Image } from "react-native";
import { ExpoLinksView } from "@expo/samples";
import { Entypo } from "@expo/vector-icons";

import gql from "graphql-tag";
import { graphql } from "react-apollo";

const IngredientsScreen = ({ data: { loading, error, ingredients } }) => {
  if (loading) {
    return <ActivityIndicator />;
  }

  return (
    <ScrollView style={styles.container}>
      {error && (
        <View>
          <Text>Error! {error.message}</Text>
        </View>
      )}

      {/*
        * Wishlist:
        * - Local search 🔍
        * - Offline sync
        **/}
      {ingredients && (
        <FlatList
          style={styles.container}
          keyExtractor={edge => edge.node.id}
          data={ingredients.edges}
          renderItem={({ item: { node } }) => (
            <View style={styles.listItem}>
              <Image source={{ url: node.imageUrl }} style={styles.image} resizeMode="contain" />
              <View style={styles.descriptionContainer}>
                <Text style={styles.ingredientName}>{node.name}</Text>
                <Text style={styles.unitQuantity}>{node.unitQuantity}</Text>
              </View>
              <View style={styles.ingredientQuantityContainer}>
                <Entypo name="circle-with-plus" size={16} color="grey" />
                <Text style={styles.orderedQuantity}>{node.orderedQuantity}</Text>
                <Entypo name="circle-with-minus" size={16} color="grey" />
              </View>
            </View>
          )}
        />
      )}
      <ExpoLinksView />
    </ScrollView>
  );
};

IngredientsScreen.navigationOptions = {
  title: "Ingredients",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  image: {
    width: 32,
    height: 32,
    overflow: "hidden",
  },
  listItem: {
    flex: 1,
    flexDirection: "row",
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginLeft: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#EDEDED",
  },
  descriptionContainer: {
    marginTop: 3,
    paddingLeft: 15,
  },
  ingredientName: {
    fontSize: 15,
  },
  ingredientQuantityContainer: {
    flex: 1,
    flexDirection: "row",
    alignSelf: "flex-end",
  },
  unitQuantity: {
    fontSize: 12,
    color: "#CCCCCC",
  },
  orderedQuantity: {
    fontSize: 12,
  },
});

const ingredientsListQuery = gql`
  query IngredientList {
    ingredients(first: 1000, order: [{ field: NAME, direction: ASC }]) {
      edges {
        node {
          id
          name
          imageUrl
          isPlanned
          unitQuantity
          orderedQuantity
        }
      }
    }
  }
`;

export const IngredientsScreenWithData = graphql(ingredientsListQuery)(IngredientsScreen);
