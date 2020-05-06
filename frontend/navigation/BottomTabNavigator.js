import {
  createBottomTabNavigator,
  BottomTabBar,
} from "@react-navigation/bottom-tabs";
import * as React from "react";
import { BlurView } from "expo-blur";

import Colors from "../constants/Colors";
import TabBarIcon from "../components/TabBarIcon";
import PlanScreen from "../screens/PlanScreen";
import ListScreen from "../screens/ListScreen";
import CookScreen from "../screens/CookScreen";
import { useColorScheme } from "react-native-appearance";
import { ListCountBadge } from "../components/Badge/ListCountBadge";

const BottomTab = createBottomTabNavigator();
const INITIAL_ROUTE_NAME = "plan";

function TabBar(props) {
  const colorScheme = useColorScheme();

  return (
    <BlurView
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
      }}
      tint={colorScheme}
      intensity={50}
    >
      <BottomTabBar {...props} />
    </BlurView>
  );
}

export default function BottomTabNavigator({ navigation, route }) {
  return (
    <BottomTab.Navigator
      initialRouteName={INITIAL_ROUTE_NAME}
      tabBar={(props) => <TabBar {...props} />}
      headerTransparent={true}
      tabBarOptions={{
        activeTintColor: Colors.tintColor,
        inactiveTintColor: Colors.tabIconDefault,
        style: {
          backgroundColor: "transparent",
        },
      }}
    >
      <BottomTab.Screen
        name="plan"
        component={PlanScreen}
        options={{
          title: "Plannen",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} name="ios-calendar" />
          ),
        }}
      />
      <BottomTab.Screen
        name="shop"
        component={ListScreen}
        options={{
          title: "Lijst",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              badge={<ListCountBadge />}
              name="ios-cart"
            />
          ),
        }}
      />
      <BottomTab.Screen
        name="cook"
        component={CookScreen}
        options={{
          title: "Koken",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} name="ios-restaurant" />
          ),
        }}
      />
    </BottomTab.Navigator>
  );
}
