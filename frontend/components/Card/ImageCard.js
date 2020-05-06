import * as React from "react";
import { View, ImageBackground, Text, TouchableOpacity } from "react-native";
import Colors from "../../constants/Colors";
import Type from "../../constants/Type";
import Layout from "../../constants/Layout";

export function ImageCard(props) {
  return (
    <View
      style={[{ borderColor: "#cdcdcd", paddingHorizontal: 5 }, props.style]}
    >
      <TouchableOpacity
        onPress={props.onPress}
        style={{ flex: 3 }}
        delayPressIn={100}
      >
        <ImageBackground
          source={{ uri: props.imageUrl }}
          imageStyle={{
            borderRadius: Layout.borderRadius,
            resizeMode: "cover",
          }}
          style={{ flex: 1 }}
        >
          <View
            style={[
              {
                flexDirection: "row-reverse",
                width: 230,
                height: 180,
              },
              props.imageStyle,
            ]}
          >
            {props.children}
          </View>
        </ImageBackground>
      </TouchableOpacity>
      <View style={{ flex: 1, paddingTop: 10 }}>
        <Text
          style={[Type.body, { color: Colors.cardText }]}
          onPress={props.onPress}
        >
          {props.title}
        </Text>
      </View>
    </View>
  );
}
