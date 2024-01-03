import { useMutation, gql } from "@apollo/client";
import * as React from "react";
import { Badge } from "../Badge/Badge";
import { CheckIcon } from "../Icon";

const BUY_INGREDIENT = gql`
  mutation buyIngredient($ingredientId: ID!, $undo: Boolean!) {
    buyIngredient(ingredientId: $ingredientId, undo: $undo) {
      id
      isBought
    }
  }
`;

function optimisticResponse(id, isBought) {
  return {
    __typename: "Mutation",
    buyIngredient: {
      id: id,
      __typename: "Comment",
      isBought: isBought,
    },
  };
}

export function BuyIngredient({ id, isBought }) {
  const [buyIngredient] = useMutation(BUY_INGREDIENT);

  if (isBought) {
    return (
      <CheckIcon
        style={{ margin: 10 }}
        onPress={(e) => {
          e.preventDefault();
          buyIngredient({
            variables: { ingredientId: id, undo: true },
            optimisticResponse: optimisticResponse(id, false),
          });
        }}
      />
    );
  }

  return (
    <Badge
      outline
      onPress={(e) => {
        e.preventDefault();
        buyIngredient({
          variables: { ingredientId: id, undo: false },
          optimisticResponse: optimisticResponse(id, true),
        });
      }}
    />
  );
}
