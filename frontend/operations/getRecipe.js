import gql from 'graphql-tag';
export const GET_RECIPE = gql`
  query GetRecipe($recipeId: ID!) {
    node(id: $recipeId) {
      ... on Recipe {
        id
        title
        description
        imageUrl
        ingredients {
          quantity
          ingredient {
            id
            name
            imageUrl
            warning {
              description
            }
          }
        }
      }
    }
  }
`;
