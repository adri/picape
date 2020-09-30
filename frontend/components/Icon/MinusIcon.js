import * as React from "react";
import Colors from "../../constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { View, TouchableOpacity } from "react-native";

export function MinusIcon(props) {
  return (
    <TouchableOpacity onPress={props.onPress}>
      <View
        style={[
          {
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor: Colors.iconDefault,
            alignItems: "center",
            justifyContent: "center",
          },
          props.style,
        ]}
      >
        <Ionicons
          name={"md-remove"}
          size={25}
          style={{
            marginTop: 2,
          }}
          color={"white"}
        />
      </View>
    </TouchableOpacity>
  );
}
