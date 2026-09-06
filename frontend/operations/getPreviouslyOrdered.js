import { gql } from '@apollo/client';

export const GET_PREVIOUSLY_ORDERED = gql`
  query PreviouslyOrderedIngredients {
    ingredients: previouslyOrderedIngredients {
      id
      name
      imageUrl
      isPlanned
      orderedQuantity
    }
  }
`;
