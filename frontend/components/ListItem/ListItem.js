import * as React from "react";
import Colors from "../../constants/Colors";
import { View, Image, Text } from "react-native";

export function ListItem(props) {
  return (
    <View
      style={[
        {
          flex: 1,
          marginBottom: 10,
          flexDirection: "row",
          backgroundColor: Colors.cardBackground,
          paddingHorizontal: 10,
          paddingVertical: 5,
          borderRadius: 5,
        },
        props.style,
      ]}
    >
      <View style={{ justifyContent: "center" }}>
        <Image
          source={{ uri: props.imageUrl }}
          fadeDuration={0.2}
          resizeMode="contain"
          style={{ width: 35, height: 35 }}
        />
      </View>
      <View
        style={{
          flex: 1,
          marginLeft: 10,
          alignSelf: "stretch",
          justifyContent: "center",
        }}
      >
        <Text>{props.title}</Text>
      </View>
      {props.children}
    </View>
  );
}
