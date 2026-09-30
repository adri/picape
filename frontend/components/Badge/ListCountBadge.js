import { useQuery, useSubscription } from '@apollo/client';
import * as React from 'react';
import { Animated, Platform, Text, StyleSheet } from 'react-native';

import Colors from '../../constants/Colors';
import { prefersReducedMotion } from '../../constants/Motion';
import { GET_ORDER_COUNT, SUBSCRIBE_ORDER_COUNT } from '../../operations/getOrderCount';

export function useOrderCount() {
  const { loading, error, data = {} } = useQuery(GET_ORDER_COUNT);
  const { data: subscription = {} } = useSubscription(SUBSCRIBE_ORDER_COUNT);
  const { currentOrder: { totalCount: countQuery } = {} } = data;
  const { currentOrder: { totalCount: countSubscription } = {} } = subscription;
  const totalCount = isNaN(countSubscription) ? countQuery : countSubscription;
  return { totalCount, loading, error };
}

export function ListCountBadge({ focused = false }) {
  const { totalCount, loading, error } = useOrderCount();

  // A changed count grows the badge and lets it settle, which is what catches
  // the eye on a small circle. Nothing moves when the reader asked for less
  // motion. The hooks sit above the early return so their order stays fixed.
  const scale = React.useRef(new Animated.Value(1)).current;
  const previous = React.useRef(totalCount);
  React.useEffect(() => {
    if (previous.current !== totalCount && !prefersReducedMotion()) {
      scale.setValue(1.35);
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: Platform.OS !== 'web',
        speed: 30,
        bounciness: 8,
      }).start();
    }
    previous.current = totalCount;
  }, [totalCount, scale]);

  if (!totalCount || loading || error) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ scale }] },
        { backgroundColor: focused ? Colors.badgeBackground : Colors.badgeBackgroundInactive },
      ]}>
      <Text style={{ color: Colors.badgeText, fontSize: 10, fontWeight: 'bold' }}>
        {totalCount}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: -6,
    top: 2,
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
