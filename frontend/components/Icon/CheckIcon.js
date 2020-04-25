import * as React from "react";
import Colors from "../../constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { View, TouchableOpacity } from "react-native";

export function CheckIcon(props) {
  return (
    <TouchableOpacity
      onPress={props.onPress}
      style={{
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: "white",
        margin: 10,
      }}
    >
      <Ionicons
        name={"ios-checkmark-circle"}
        size={38}
        style={{ marginTop: -5 }}
        color={Colors.iconSelected}
      />
    </TouchableOpacity>
  );
}
