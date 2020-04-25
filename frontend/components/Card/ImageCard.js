import * as React from "react";
import { View, ImageBackground, Text, TouchableOpacity } from "react-native";

export function ImageCard(props) {
  return (
    <View
      style={[props.style, { borderColor: "#cdcdcd", paddingHorizontal: 5 }]}
    >
      <TouchableOpacity onPress={props.onPress} style={{ flex: 3 }}>
        <ImageBackground
          source={{ uri: props.imageUrl }}
          imageStyle={{ borderRadius: 5, resizeMode: "cover" }}
          style={{ flex: 1 }}
        >
          <View
            style={{
              flexDirection: "row",
              flexDirection: "row-reverse",
              width: 250,
              height: 180,
            }}
          >
            {props.children}
          </View>
        </ImageBackground>
      </TouchableOpacity>
      <View style={{ flex: 1, paddingTop: 10 }}>
        <Text onPress={props.onPress}>{props.title}</Text>
      </View>
    </View>
  );
}
