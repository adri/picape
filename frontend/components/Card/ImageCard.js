import * as React from "react";
import { View, ImageBackground, Text, TouchableOpacity } from "react-native";
import Colors from "../../constants/Colors";

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
              width: 230,
              height: 180,
            }}
          >
            {props.children}
          </View>
        </ImageBackground>
      </TouchableOpacity>
      <View style={{ flex: 1, paddingTop: 10 }}>
        <Text style={{ color: Colors.cardText }} onPress={props.onPress}>
          {props.title}
        </Text>
      </View>
    </View>
  );
}
