import React from "react";
import { graphql, compose } from "react-apollo";
import gql from "graphql-tag";
import { Loading } from "../Loading";
import { IconMinus, IconPlus } from "../Icon";
import { mutateable } from "../../lib/mutateable";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";

const hitSlop = { top: 10, left: 10, right: 10, bottom: 10 };
const modify = (id, quantity, diff) => ({ ingredientId: id, quantity: Math.max(0, quantity + diff) });

const OrderIngredient = ({ id, quantity, submit, loading }) => (
  <View style={styles.container}>
    <TouchableOpacity hitSlop={hitSlop} onPress={() => submit(modify(id, quantity, -1))}>
      <IconMinus />
    </TouchableOpacity>

    {loading && <Loading />}
    {!loading && <Text style={styles.quantity}>{quantity}</Text>}

    <TouchableOpacity hitSlop={hitSlop} onPress={() => submit(modify(id, quantity, 1))}>
      <IconPlus />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 5,
  },
  quantity: {
    fontSize: 12,
    paddingHorizontal: 7,
  },
});

const query = gql`
  mutation orderIngredient($ingredientId: ID!, $quantity: Int!) {
    orderIngredient(ingredientId: $ingredientId, quantity: $quantity) {
      id
      orderedQuantity
    }
  }
`;

export const OrderIngredientWithData = compose(
  graphql(query, {
    options: {
      refetchQueries: ["OrderList"],
    },
  }),
  mutateable(),
)(OrderIngredient);
