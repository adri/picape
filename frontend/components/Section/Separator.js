import * as React from "react";
import { View } from "react-native";
import Colors from "../../constants/Colors";

export function Separator(props) {
  return (
    <View
      style={[
        props.style,
        {
          marginTop: 20,
          marginHorizontal: 20,
          borderTopColor: Colors.hairLineBackground,
          borderTopWidth: 0.5,
        },
      ]}
    />
  );
}
