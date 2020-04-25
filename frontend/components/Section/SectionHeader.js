import * as React from "react";
import { View, Text } from "react-native";
import Colors from "../../constants/Colors";

export function SectionHeader(props) {
  return (
    <View
      style={[
        props.style,
        {
          flex: 1,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginHorizontal: 20,
          borderTopColor: "#ececec",
          borderTopWidth: 0.5,
        },
      ]}
    >
      <Text
        style={{
          fontSize: 24,
          fontWeight: "700",
          paddingTop: 20,
          paddingBottom: 15,
        }}
      >
        {props.title}
      </Text>
      {props.children}
    </View>
  );
}
