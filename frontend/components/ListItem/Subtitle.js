import * as React from "react";
import Colors from "../../constants/Colors";
import { Text } from "react-native";
import Type from "../../constants/Type";
import { Spring, animated } from "@react-spring/native";

const AnimatedText = animated(Text);

export function Subtitle({ textStyle, subtitle }) {
  return (
    <Spring native from={{ opacity: 0 }} to={{ opacity: 1 }}>
      {(opacity) => (
        <AnimatedText
          style={[
            Type.subtitle,
            { color: Colors.cardSubtitleText },
            textStyle,
            opacity,
          ]}
        >
          {subtitle}
        </AnimatedText>
      )}
    </Spring>
  );
}
