import * as React from "react";
import Colors from "../../constants/Colors";
import { useState, useEffect } from "react";
import { Badge } from "../Badge/Badge";
import gql from "graphql-tag";
import { PlusIcon, MinusIcon } from "../Icon";
import { useMutation } from "@apollo/react-hooks";
import { View, Text } from "react-native";

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
    __typename: "Mutation",
    orderIngredient: {
      id: id,
      __typename: "Ingredient",
      orderedQuantity: orderedQuantity,
    },
  };
}

export const QuantitySelector = React.memo(function ({ id, orderedQuantity }) {
  const [opened, setOpened] = useState(false);
  const [orderIngredient] = useMutation(ORDER_INGREDIENT, {
    onCompleted: ({ orderIngredient }) => {
      if (orderIngredient.orderedQuantity === 0) {
        setOpened(false);
      }
    },
  });
  // Hide plus/min buttons after x seconds
  useEffect(() => {
    let timeout = null;
    clearTimeout(timeout);
    if (opened) {
      timeout = setTimeout(() => setOpened(false), 3000);
    }

    return () => clearTimeout(timeout);
  }, [opened, orderedQuantity]);

  if (orderedQuantity === 0) {
    return (
      <PlusIcon
        style={{ margin: 10 }}
        onPress={(e) => {
          e.preventDefault();
          orderIngredient({
            variables: { ingredientId: id, quantity: 1 },
            optimisticResponse: optimisticResponse(id, 1),
          });
        }}
      />
    );
  }

  if (opened) {
    return (
      <View
        style={{
          flexDirection: "row",
          alignContent: "flex-end",
        }}
      >
        <MinusIcon
          style={{ margin: 10 }}
          onPress={(e) => {
            e.preventDefault();
            orderIngredient({
              variables: { ingredientId: id, quantity: orderedQuantity - 1 },
              optimisticResponse: optimisticResponse(id, orderedQuantity - 1),
            });
          }}
        />

        <View style={{ justifyContent: "center" }}>
          <Text style={{ color: Colors.text }}>{orderedQuantity}</Text>
        </View>

        <PlusIcon
          style={{ margin: 10 }}
          onPress={(e) => {
            e.preventDefault();
            orderIngredient({
              variables: { ingredientId: id, quantity: orderedQuantity + 1 },
              optimisticResponse: optimisticResponse(id, orderedQuantity + 1),
            });
          }}
        />
      </View>
    );
  }

  return (
    <Badge
      amount={orderedQuantity}
      onPress={(e) => {
        e.preventDefault();
        setOpened(!opened);
      }}
    />
  );
});
