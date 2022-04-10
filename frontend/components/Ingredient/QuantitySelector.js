import * as React from "react";
import Colors from "../../constants/Colors";
import { useState, useEffect } from "react";
import { Badge } from "../Badge/Badge";
import { PlusIcon, MinusIcon } from "../Icon";
import { View, Text } from "react-native";

export const QuantitySelector = React.memo(function ({ id, orderedQuantity, onChange }) {
  const [opened, setOpened] = useState(false);

  // Hide plus/min buttons after x seconds
  useEffect(() => {
    let timeout = null;
    clearTimeout(timeout);
    if (opened) {
      timeout = setTimeout(() => setOpened(false), 3000);
    }

    return () => clearTimeout(timeout);
  }, [opened, orderedQuantity]);

  if (orderedQuantity === 0) {
    return (
      <PlusIcon
        style={{ margin: 10 }}
        onPress={(e) => {
          e.preventDefault();
          onChange(id, 1);
        }}
      />
    );
  }

  if (opened) {
    return (
      <View
        style={{
          flexDirection: "row",
          alignContent: "flex-end",
        }}
      >
        <MinusIcon
          style={{ margin: 10 }}
          onPress={(e) => {
            e.preventDefault();
            onChange(id, orderedQuantity - 1);
          }}
        />

        <View style={{ justifyContent: "center" }}>
          <Text style={{ color: Colors.text }}>{orderedQuantity}</Text>
        </View>

        <PlusIcon
          style={{ margin: 10 }}
          onPress={(e) => {
            e.preventDefault();
            onChange(id, orderedQuantity + 1);
          }}
        />
      </View>
    );
  }

  return (
    <Badge
      amount={orderedQuantity}
      onPress={(e) => {
        e.preventDefault();
        setOpened(!opened);
      }}
    />
  );
});
