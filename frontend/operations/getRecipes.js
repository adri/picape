import { gql } from "@apollo/client";
export const GET_RECIPES = gql`
  query RecipeList {
    recipes {
      id
      title
      imageUrl
      warning
      isPlanned
      ingredients {
        ingredient {
          id
          name
        }
      }
      warning
    }
  }
`;
