import gql from 'graphql-tag';
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
