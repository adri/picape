import * as React from "react";
import Colors from "../../constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { View, TouchableOpacity } from "react-native";

export function PlusIcon(props) {
  return (
    <TouchableOpacity onPress={props.onPress}>
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
          name={"md-add"}
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
