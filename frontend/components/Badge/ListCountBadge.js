import { useQuery, useSubscription } from "@apollo/client";
import * as React from "react";
import Colors from "../../constants/Colors";
import { View, Text, StyleSheet } from "react-native";
import {
  GET_ORDER_COUNT,
  SUBSCRIBE_ORDER_COUNT,
} from "../../operations/getOrderCount";

export function ListCountBadge({ focused = false }) {
  const { loading, error, data = {} } = useQuery(GET_ORDER_COUNT);
  const { data: subscription = {} } = useSubscription(SUBSCRIBE_ORDER_COUNT);
  const { currentOrder: { totalCount: countQuery } = {} } = data;
  const { currentOrder: { totalCount: countSubscription } = {} } = subscription;
  const totalCount = isNaN(countSubscription) ? countQuery : countSubscription;

  if (!totalCount || loading || error) {
    return null;
  }

  return (
    <View style={[
      styles.container,
      { backgroundColor: focused ? Colors.badgeBackground : Colors.badgeBackgroundInactive }]}>
      <Text
        style={{ color: Colors.badgeText, fontSize: 10, fontWeight: "bold" }}
      >
        {totalCount}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    right: -6,
    top: 2,
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});
