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
import BasicsScreen from "../screens/BasicsScreen";
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
      intensity={100}
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
          title: "Recepten",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} name="ios-calendar" />
          ),
        }}
      />
      <BottomTab.Screen
        name="shop"
        component={ListScreen}
        options={{
          title: "Mandje",
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
        name="basics"
        component={BasicsScreen}
        options={{
          title: "Basics",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} name="ios-restaurant" />
          ),
        }}
      />
    </BottomTab.Navigator>
  );
}
