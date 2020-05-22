import * as React from "react";
import Colors from "../../constants/Colors";
import { useQuery, useSubscription } from "@apollo/react-hooks";
import { View, Text, StyleSheet } from "react-native";
import {
  GET_ORDER_COUNT,
  SUBSCRIBE_ORDER_COUNT,
} from "../../operations/getOrderCount";

export function ListCountBadge() {
  const { loading, error, data = {} } = useQuery(GET_ORDER_COUNT);
  const { data: subscription = {} } = useSubscription(SUBSCRIBE_ORDER_COUNT);
  const { currentOrder: { totalCount: countQuery } = {} } = data;
  const { currentOrder: { totalCount: countSubscription } = {} } = subscription;
  const totalCount = isNaN(countSubscription) ? countQuery : countSubscription;

  if (!totalCount || loading || error) {
    return null;
  }

  return (
    <View style={styles.container}>
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
    backgroundColor: Colors.badgeBackground,
    borderWidth: 1,
    borderColor: Colors.tabIconDefault,
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
  },
});
