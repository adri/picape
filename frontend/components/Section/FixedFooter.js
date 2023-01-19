import * as React from "react";
import { Text } from "react-native";
import Colors from "../../constants/Colors";
import { useColorScheme } from "react-native";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Layout from "../../constants/Layout";

export function FixedFooter({ buttonText, onPress, disabled}) {
  const insets = useSafeAreaInsets();
  return (
    <BlurView
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
        }}
        tint={useColorScheme()}
        intensity={100}
      >
        <Text
          disabled={disabled}
          onPress={(e) => !disabled && onPress(e)}
          style={{
            color: Colors.text,
            alignSelf: "center",
            padding: 10,
            paddingHorizontal: 20,
            marginTop: 10,
            marginBottom: insets.bottom + 20,
            backgroundColor: disabled ? Colors.iconDefault : Colors.iconSelected,
            borderRadius: Layout.borderRadius,
          }}
        >
          {buttonText}
        </Text>
      </BlurView>
  );
}
