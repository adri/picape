import * as React from "react";
import Colors from "../../constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { View, TouchableOpacity, Platform, StyleSheet } from "react-native";

export function PlusIcon(props) {
  return (
    <TouchableOpacity onPress={props.onPress}>
      <View style={[styles.container, props.style]}>
        <Ionicons
          name={"md-add"}
          size={25}
          style={styles.icon}
          color={"white"}
        />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.iconDefault,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    lineHeight: 30,
    marginLeft: 2,
  },
});
