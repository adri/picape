import * as React from "react";
import Colors from "../../constants/Colors";
import { Text, TouchableOpacity } from "react-native";

export function Badge(props) {
  return (
    <TouchableOpacity
      onPress={props.onPress}
      style={{
        alignSelf: "center",
        backgroundColor: Colors.tintColor,
        borderRadius: 15,
        width: 30,
        height: 30,
        margin: 10,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          paddingHorizontal: 4,
          fontWeight: "700",
          fontSize: 15,
          color: "white",
        }}
      >
        {props.amount}
      </Text>
    </TouchableOpacity>
  );
}
