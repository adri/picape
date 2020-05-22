import * as React from "react";
import Colors from "../../constants/Colors";
import { Text } from "react-native";
import Type from "../../constants/Type";

export function Subtitle({ textStyle, subtitle }) {
  return (
    <Text
      style={[
        Type.subtitle,
        {
          color: Colors.cardSubtitleText,
          transitionProperty: ["opacity"],
          transitionDuration: "200ms",
          transitionTimingFunction: "ease-in",
        },
        textStyle,
      ]}
    >
      {subtitle}
    </Text>
  );
}
