import React from "react";
import { ActivityIndicator, ScrollView, StyleSheet, FlatList, Text, View, Image } from "react-native";
import { ExpoLinksView } from "@expo/samples";
import gql from "graphql-tag";
import { graphql } from "react-apollo";

const toListData = ingredients =>
  ingredients.edges.map(edge => ({
    ...edge.node,
    key: edge.node.id,
  }));

const IngredientsScreenComponent = function({ data: { loading, error, ingredients } }) {
  console.log(ingredients && toListData(ingredients));
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
        *
        **/}
      {ingredients && (
        <FlatList
          contentContainerStyle={styles.listContainer}
          style={styles.container}
          keyExtractor={edge => edge.node.id}
          data={ingredients.edges}
          renderItem={({ item: { node } }) => (
            <View style={styles.listItem}>
              <Image source={{ url: node.imageUrl }} style={styles.image} />
              <Text>{node.name}</Text>
            </View>
          )}
        />
      )}
      <ExpoLinksView />
    </ScrollView>
  );
};

IngredientsScreenComponent.navigationOptions = {
  title: "Ingredients",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: "#fff",
  },
  image: {
    width: 32,
    height: 32,
  },
  listContainer: {},
  listItem: {
    flex: 1,
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

export const IngredientsScreen = graphql(ingredientsListQuery)(IngredientsScreenComponent);
