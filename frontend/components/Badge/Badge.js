import * as React from "react";
import Colors from "../../constants/Colors";
import { View, Text, TouchableOpacity } from "react-native";

export function Badge(props) {
  return (
    <TouchableOpacity onPress={props.onPress}>
      <View
        style={{
          width: 30,
          height: 30,
          margin: 10,
          backgroundColor: Colors.tintColor,
          borderRadius: 15,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontWeight: "700",
            fontSize: 15,
            color: "white",
          }}
        >
          {props.amount}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
