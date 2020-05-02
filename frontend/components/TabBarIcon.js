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
        color={props.focused ? Colors.tabIconSelected : Colors.tabIconDefault}
      />
      {props.badgeCount > 0 && (
        <View
          style={{
            position: "absolute",
            right: -6,
            top: 0,
            backgroundColor: "red",
            borderRadius: 8,
            width: 16,
            height: 16,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white", fontSize: 10, fontWeight: "bold" }}>
            {props.badgeCount}
          </Text>
        </View>
      )}
    </View>
  );
}
