import * as React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Colors from "../../constants/Colors";
import Type from "../../constants/Type";
import Layout from "../../constants/Layout";

export function Card(props) {
  return (
    <View
      style={[{ borderColor: "#cdcdcd", paddingHorizontal: 5 }, props.style]}
    >
      <TouchableOpacity
        onPress={props.onPress}
        style={{ flex: 3 }}
        delayPressIn={100}
      >
        <View style={{ flex: 1 }}>
          <View
            style={[
              {
                // flexDirection: "row-reverse",
                width: props.width || 230,
                height: props.height || 180,
                backgroundColor: Colors.cardBackground,
                borderRadius: Layout.borderRadius,
              },
              props.cardStyle,
            ]}
          >
            {props.children}
          </View>
        </View>
      </TouchableOpacity>
      {props.title && (
        <View style={{ flex: 1, paddingTop: 10 }}>
          <Text
            style={[Type.body, { color: Colors.cardText }]}
            onPress={props.onPress}
          >
            {props.title}
          </Text>
        </View>
      )}
    </View>
  );
}
