import { gql } from "@apollo/client";
export const GET_LAST_RECIPES = gql`
  query LastOrderedRecipes {
    recipes: lastOrderedRecipes {
      id
      title
      imageUrl
      isCooked
    }
  }
`;
