import React from "react";
import { ActivityIndicator, ScrollView, StyleSheet, FlatList, Text, View, RefreshControl } from "react-native";
import { IngredientListItem } from "../components/ingredients/IngredientListItem";
import gql from "graphql-tag";
import { graphql } from "react-apollo";

const IngredientsScreen = ({ data: { loading, error, ingredients, refetch } }) => {
  if (loading) {
    return <ActivityIndicator />;
  }

  return (
    <ScrollView refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} />} style={styles.container}>
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
          renderItem={({ item: { node } }) => <IngredientListItem ingredient={node} />}
        />
      )}
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
});

const ingredientsListQuery = gql`
  query IngredientList {
    ingredients(first: 1000, order: [{ field: NAME, direction: ASC }]) {
      edges {
        node {
          ...ingredient
        }
      }
    }
  }
  ${IngredientListItem.fragments.ingredient}
`;

export const IngredientsScreenWithData = graphql(ingredientsListQuery)(IngredientsScreen);
