import * as React from "react";
import { View, Text } from "react-native";
import Colors from "../../constants/Colors";
import Type from "../../constants/Type";

export function SectionHeader(props) {
  return (
    <View
      style={[
        props.style,
        {
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginHorizontal: 20,
          borderTopColor: Colors.hairLineBackground,
          borderTopWidth: 0.5,
        },
      ]}
    >
      <Text
        style={[
          Type.sectionHeader,
          {
            paddingTop: 20,
            paddingBottom: 15,
            color: Colors.sectionHeaderText,
          },
        ]}
      >
        {props.title}
      </Text>
      {props.children}
    </View>
  );
}
