import { gql } from "@apollo/client";
export const MARK_RECIPE_AS_COOKED = gql`
  mutation MarkRecipeAsCooked($recipeId: ID!, $cooked: Boolean!) {
    markRecipeAsCooked(recipeId: $recipeId, cooked: $cooked) {
      id
      isCooked
    }
  }
`;
