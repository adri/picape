import * as React from "react";
import Colors from "../../constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { View, TouchableOpacity } from "react-native";

export function CheckIcon(props) {
  return (
    <TouchableOpacity onPress={props.onPress}>
      <View
        style={[
          {
            width: 30,
            height: 30,
            borderRadius: 15,
            backgroundColor: Colors.iconSelected,
            alignItems: "center",
            justifyContent: "center",
          },
          props.style,
        ]}
      >
        <Ionicons
          name={"ios-checkmark"}
          size={40}
          style={{
            lineHeight: 35,
            // borderColor: "red",
            // borderWidth: 1,
            // height: 30,
            // alignSelf: "center",
            // justifyContent: "center",
          }}
          color={"white"}
        />
      </View>
    </TouchableOpacity>
  );
}
