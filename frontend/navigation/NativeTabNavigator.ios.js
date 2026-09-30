import { createNativeBottomTabNavigator } from '@bottom-tabs/react-navigation';
import * as React from 'react';

import { useOrderCount } from '../components/Badge/ListCountBadge';
import Colors from '../constants/Colors';
import { INITIAL_ROUTE_NAME, TABS } from './tabs';

// The real UITabBarController: the liquid glass capsule, the press animation,
// the selection lens and the badge are all system behaviour. `labeled` keeps
// the icons-only design the web bar has.
const NativeTab = createNativeBottomTabNavigator();

export default function NativeTabNavigator() {
  const { totalCount } = useOrderCount();

  return (
    <NativeTab.Navigator
      initialRouteName={INITIAL_ROUTE_NAME}
      labeled={false}
      tabBarActiveTintColor={Colors.tintColor}
      tabBarInactiveTintColor={Colors.tabIconDefault}>
      {TABS.map(({ name, title, component, sf, badge }) => (
        <NativeTab.Screen
          key={name}
          name={name}
          component={component}
          options={{
            title,
            tabBarIcon: () => ({ sfSymbol: sf }),
            tabBarBadge: badge && totalCount ? String(totalCount) : undefined,
          }}
        />
      ))}
    </NativeTab.Navigator>
  );
}
