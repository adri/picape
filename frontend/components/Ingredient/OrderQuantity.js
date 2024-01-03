import * as React from 'react';
import gql from 'graphql-tag';
import { useMutation } from '@apollo/client';
import { QuantitySelector } from './QuantitySelector';

const ORDER_INGREDIENT = gql`
  mutation orderIngredient($ingredientId: ID!, $quantity: Int!) {
    orderIngredient(ingredientId: $ingredientId, quantity: $quantity) {
      id
      orderedQuantity
    }
  }
`;

function optimisticResponse(id, orderedQuantity) {
  return {
    __typename: 'Mutation',
    orderIngredient: {
      id: id,
      __typename: 'Ingredient',
      orderedQuantity: orderedQuantity,
    },
  };
}

export const OrderQuantity = React.memo(function ({ id, orderedQuantity }) {
  const [orderIngredient] = useMutation(ORDER_INGREDIENT);

  return (
    <QuantitySelector
      id={id}
      orderedQuantity={orderedQuantity}
      onChange={(id, quantity) => {
        orderIngredient({
          variables: { ingredientId: id, quantity: quantity },
          optimisticResponse: optimisticResponse(id, quantity),
        });
      }}
    />
  );
});
