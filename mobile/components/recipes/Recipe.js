import React from "react";
import gql from "graphql-tag";
import { Text, View, StyleSheet, Button } from "react-native";
import { RecipeImage } from "./RecipeImage";
import { PlanRecipeWithData } from "./PlanRecipe";

export const Recipe = ({ recipe, showEdit }) => {
  console.log(recipe.imageUrl);
  return (
    <RecipeImage imageUrl={recipe.imageUrl}>
      <View style={styles.imageContainer}>
        <View style={styles.textContainer}>
          <View style={{ flex: 3 }}>
            <Text style={styles.title}>{recipe.title}</Text>
            <Text numberOfLines={1} style={styles.ingredients}>
              {recipe.ingredients.map(ref => `${ref.ingredient.name} (${ref.quantity})`).join(", ")}
            </Text>
          </View>
          <PlanRecipeWithData recipeId={recipe.id} isPlanned={recipe.isPlanned} />
        </View>
      </View>
    </RecipeImage>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    flex: 1,
    justifyContent: "flex-end",
  },
  textContainer: {
    flexDirection: "row",
    // backgroundColor: "rgba(255,255,255,0.8)",
    backgroundColor: "white",
  },
  title: {
    fontSize: 15,
    paddingTop: 10,
    paddingHorizontal: 15,
  },
  ingredients: {
    color: "#9e9e9e",
    paddingHorizontal: 15,
    paddingBottom: 10,
    fontSize: 13,
  },
});

Recipe.fragments = {
  recipe: gql`
    fragment recipe on Recipe {
      id
      title
      imageUrl
      isPlanned
      ingredients {
        quantity
        ingredient {
          id
          name
        }
      }
    }
  `,
};
