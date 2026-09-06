import * as React from 'react';
import { useState, useEffect } from 'react';
import { View, Text } from 'react-native';

import Colors from '../../constants/Colors';
import { Spacing } from '../../constants/Spacing';
import { Badge } from '../Badge/Badge';
import { PlusIcon, MinusIcon } from '../Icon';

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
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.md,
        }}>
        <MinusIcon
          onPress={(e) => {
            e.preventDefault();
            onChange(id, orderedQuantity - 1);
          }}
        />

        <View style={{ justifyContent: 'center' }}>
          <Text style={{ color: Colors.text }}>{orderedQuantity}</Text>
        </View>

        <PlusIcon
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
