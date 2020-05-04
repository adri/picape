import * as React from "react";
import Colors from "../../constants/Colors";
import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";
import { View, Text } from "react-native";

const GET_ORDER_COUNT = gql`
  query OrderListCount {
    currentOrder {
      id
      totalCount
    }
  }
`;
export function ListCountBadge(props) {
  const { loading, error, data = {} } = useQuery(GET_ORDER_COUNT);
  const { currentOrder: { totalCount } = {} } = data;

  if (!totalCount || loading || error) {
    return null;
  }

  return (
    <View
      style={{
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
      }}
    >
      <Text
        style={{ color: Colors.badgeText, fontSize: 10, fontWeight: "bold" }}
      >
        {totalCount}
      </Text>
    </View>
  );
}
