import gql from 'graphql-tag';
export const GET_RECIPES = gql`
  query RecipeList {
    recipes {
      id
      title
      imageUrl
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
