import { StyleSheet, Text, TouchableHighlight } from "react-native";
import React from "react";
import gql from "graphql-tag";
import { graphql, compose } from "react-apollo";
import { IngredientListItem } from "../ingredients/IngredientListItem";

const Button = ({ onPress, title, children }) => (
  <TouchableHighlight style={styles.button} onPress={onPress}>
    <Text>{title}</Text>
  </TouchableHighlight>
);

const PlanRecipe = ({ recipeId, isPlanned, unplanRecipe, planRecipe }) => {
  if (isPlanned) {
    return <Button onPress={() => submit({ recipeId })} title="Unplan" />;
  }

  return <Button onPress={() => submit({ recipeId })} title="Plan" />;
};

const styles = StyleSheet.create({
  button: {
    padding: 10,
    paddingTop: 20,
    backgroundColor: "transparent",
  },
});

const recipeFragment = gql`
  fragment recipe on Recipe {
    id
    isPlanned
    ingredients {
      quantity
      ingredient {
        ... ingredient
      }
    } 
  }
  
  ${IngredientListItem.fragments.ingredient}
`;

const planRecipeMutation = gql`
  mutation planRecipe($recipeId: ID!) {
    planRecipe(recipeId: $recipeId) {
      ... recipe
    }
  }
  ${recipeFragment} 
`;

const unplanRecipeMutation = gql`
  mutation planRecipe($recipeId: ID!) {
    planRecipe(recipeId: $recipeId) {
      ... recipe
    }
  }
  ${recipeFragment}
`;

export const PlanRecipeWithData = compose(
  graphql(planRecipeMutation, { name: "planRecipe" }),
  graphql(unplanRecipeMutation, { name: "unplanRecipe" }),
)(PlanRecipe);
