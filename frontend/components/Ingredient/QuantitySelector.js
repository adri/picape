import { Ionicons } from '@expo/vector-icons';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

import { useTheme } from '../../constants/Colors';
import { Radius, Spacing, hitSlopFor } from '../../constants/Spacing';
import Type from '../../constants/Type';
import { Badge } from '../Badge/Badge';
import { Glass, glassAvailable } from '../Glass/Glass';
import { PlusIcon, MinusIcon } from '../Icon';

export const QuantitySelector = React.memo(function ({ id, orderedQuantity, onChange }) {
  const colors = useTheme();
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
    const decrement = (e) => {
      e.preventDefault();
      onChange(id, orderedQuantity - 1);
    };
    const increment = (e) => {
      e.preventDefault();
      onChange(id, orderedQuantity + 1);
    };

    // One glass capsule, the way the system groups a stepper: the count sits
    // inside the same surface as its buttons rather than bare between two
    // glass circles.
    if (glassAvailable) {
      return (
        <Glass interactive style={styles.stepper}>
          <Pressable
            onPress={decrement}
            hitSlop={hitSlopFor(30)}
            accessibilityRole="button"
            accessibilityLabel="Verwijderen"
            style={styles.stepperButton}>
            <Ionicons name="remove" size={22} color={colors.cardText} />
          </Pressable>
          <Text style={[Type.subtitle, styles.count, { color: colors.text }]}>
            {orderedQuantity}
          </Text>
          <Pressable
            onPress={increment}
            hitSlop={hitSlopFor(30)}
            accessibilityRole="button"
            accessibilityLabel="Toevoegen"
            style={styles.stepperButton}>
            <Ionicons name="add" size={22} color={colors.cardText} />
          </Pressable>
        </Glass>
      );
    }

    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: Spacing.md,
        }}>
        <MinusIcon onPress={decrement} />
        <View style={{ justifyContent: 'center' }}>
          <Text style={[Type.subtitle, styles.count, { color: colors.text }]}>
            {orderedQuantity}
          </Text>
        </View>
        <PlusIcon onPress={increment} />
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

const styles = StyleSheet.create({
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    height: 40,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  stepperButton: {
    padding: Spacing.xs,
  },
  // Fixed-width slot so the count centres between the buttons and the capsule
  // does not resize when the digit count changes.
  count: {
    minWidth: 20,
    textAlign: 'center',
    fontWeight: '600',
  },
});
