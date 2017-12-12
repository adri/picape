import React from "react";
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import gql from "graphql-tag";
import { graphql } from "react-apollo";
import { Recipe } from "../components/recipes/Recipe";

const RecipesScreen = ({ data: { loading, error, recipes, refetch } }) => {
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
      {recipes && (
        <FlatList
          style={styles.container}
          keyExtractor={recipe => recipe.id}
          data={recipes}
          renderItem={({ item }) => <Recipe recipe={item} />}
        />
      )}
    </ScrollView>
  );
};

RecipesScreen.navigationOptions = {
  title: "Recipes",
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});

const recipesListQuery = gql`
  query RecipeList {
    recipes {
      ...recipe
    }
  }
  ${Recipe.fragments.recipe}
`;

export const RecipesScreenWithData = graphql(recipesListQuery)(RecipesScreen);
