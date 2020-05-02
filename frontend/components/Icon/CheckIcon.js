import * as React from "react";
import Colors from "../../constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { View, TouchableOpacity } from "react-native";

export function CheckIcon(props) {
  return (
    <TouchableOpacity onPress={props.onPress}>
      <View
        style={{
          width: 30,
          height: 30,
          margin: 10,
          borderRadius: 15,
          backgroundColor: Colors.iconSelected,
        }}
      >
        <Ionicons
          name={"ios-checkmark"}
          size={38}
          style={{
            marginTop: -5,
            alignSelf: "center",
            justifyContent: "center",
          }}
          color={"white"}
        />
      </View>
    </TouchableOpacity>
  );
}
