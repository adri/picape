import * as React from "react";
import Colors from "../../constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { View, TouchableOpacity } from "react-native";

export function BackIcon(props) {
  return (
    <TouchableOpacity
      style={[{ width: 50, height: 50 }, props.style]}
      onPress={props.onPress}
    >
      <View
        style={[
          {
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor: Colors.iconDefault,
            margin: 10,
          },
          props.style,
        ]}
      >
        <Ionicons
          name={"ios-chevron-back"}
          size={25}
          style={{
            alignSelf: "center",
            justifyContent: "center",
            marginTop: 1,
          }}
          color={"white"}
        />
      </View>
    </TouchableOpacity>
  );
}
