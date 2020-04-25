import * as React from "react";
import Colors from "../../constants/Colors";
import { Badge } from "../Badge/Badge";
import gql from "graphql-tag";
import { PlusIcon, MinusIcon } from "../Icon";
import { useMutation } from "@apollo/react-hooks";
import { withState, compose, withHandlers, lifecycle } from "recompose";
import { View, Text } from "react-native";

const enhance = compose(
  withState("opened", "toggle", false),
  withHandlers(({ toggle }) => {
    let timeout = null;

    return {
      clearTimeout: () => () => clearTimeout(timeout),
      resetCloseTimout: ({ opened }) => () => {
        clearTimeout(timeout);
        if (opened) {
          timeout = setTimeout(() => toggle(() => false), 3000);
        }
      },
    };
  }),
  lifecycle({
    componentWillUnmount() {
      this.props.clearTimeout();
    },
  })
);

const ORDER_INGREDIENT = gql`
  mutation orderIngredient($ingredientId: ID!, $quantity: Int!) {
    orderIngredient(ingredientId: $ingredientId, quantity: $quantity) {
      id
      orderedQuantity
    }
  }
`;

export const QuantitySelector = enhance(
  ({ id, orderedQuantity, opened, toggle, resetCloseTimout }) => {
    const [orderIngredient] = useMutation(ORDER_INGREDIENT, {
      refetchQueries: ["OrderList"],
      onCompleted: ({ orderIngredient }) => {
        if (orderIngredient.orderedQuantity === 0) {
          toggle(() => false);
        }
      },
    });

    if (orderedQuantity === 0) {
      return (
        <PlusIcon
          onPress={(e) => {
            e.preventDefault();
            orderIngredient({ variables: { ingredientId: id, quantity: 1 } });
          }}
        />
      );
    }

    if (opened) {
      resetCloseTimout();

      return (
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignContent: "flex-end",
            marginRight: -10,
          }}
        >
          <MinusIcon
            onPress={(e) => {
              e.preventDefault();
              orderIngredient({
                variables: { ingredientId: id, quantity: orderedQuantity - 1 },
              });
            }}
          />

          <View style={{ justifyContent: "center" }}>
            <Text>{orderedQuantity}</Text>
          </View>

          <PlusIcon
            onPress={(e) => {
              e.preventDefault();
              orderIngredient({
                variables: { ingredientId: id, quantity: orderedQuantity + 1 },
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
          toggle((opened) => !opened);
        }}
      />
    );
  }
);
