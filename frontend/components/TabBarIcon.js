import { Ionicons } from "@expo/vector-icons";
import * as React from "react";
import { View, Text } from "react-native";

import Colors from "../constants/Colors";

export default function TabBarIcon(props) {
  return (
    <View style={{}}>
      <Ionicons
        name={props.name}
        size={30}
        style={{ marginBottom: -3 }}
        color={props.focused ? Colors.tabIconDefault : Colors.tabIconInactive}
      />
      {props.badge}
    </View>
  );
}
