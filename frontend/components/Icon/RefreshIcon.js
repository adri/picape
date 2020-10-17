import * as React from "react";
import Colors from "../../constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { View, TouchableOpacity } from "react-native";

export function RefreshIcon(props) {
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
          name={"ios-refresh"}
          size={18}
          style={{
            lineHeight: 35,
          }}
          color={"white"}
        />
      </View>
    </TouchableOpacity>
  );
}
