import gql from "graphql-tag";
export const EDIT_RECIPE = gql`
  mutation EditRecipe(
    $recipeId: ID!
    $title: String!
    $imageUrl: String
    $ingredients: [IngredientRef]!
    $description: String
  ) {
    editRecipe(
      recipeId: $recipeId
      title: $title
      imageUrl: $imageUrl
      ingredients: $ingredients
      description: $description
    ) {
      id
      title
      imageUrl
      description
      ingredients {
        quantity
        ingredient {
          id
          name
        }
      }
    }
  }
`;
