import React from "react";
import { graphql, compose } from "react-apollo";
import gql from "graphql-tag";
import { Loading } from "../Loading";
import { Entypo } from "@expo/vector-icons";
import { mutateable } from "../../lib/mutateable";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";

const hitSlop = { top: 10, left: 10, right: 10, bottom: 10 };

const OrderIngredient = ({ id, quantity, submit, loading }) => (
  <View style={styles.container}>
    <TouchableOpacity
      hitSlop={hitSlop}
      onPress={event => submit(event, { ingredientId: id, quantity: Math.max(0, quantity - 1) })}
    >
      <Entypo name="circle-with-minus" size={16} color="grey" />
    </TouchableOpacity>

    {loading && <Loading />}
    {!loading && <Text style={styles.quantity}>{quantity}</Text>}

    <TouchableOpacity
      hitSlop={hitSlop}
      onPress={event => submit(event, { ingredientId: id, quantity: Math.max(quantity + 1) })}
    >
      <Entypo name="circle-with-plus" size={16} color="grey" />
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
