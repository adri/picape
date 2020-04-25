import * as React from "react";
import Colors from "../../constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";

export function MinusIcon(props) {
  return (
    <TouchableOpacity
      style={{
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: "white",
        margin: 10,
      }}
    >
      <Ionicons
        onPress={props.onPress}
        name={"md-remove-circle"}
        size={38}
        style={{ marginTop: -5 }}
        color={Colors.iconDefault}
      />
    </TouchableOpacity>
  );
}
