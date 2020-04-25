import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import * as React from "react";

import Colors from "../constants/Colors";
import TabBarIcon from "../components/TabBarIcon";
import PlanScreen from "../screens/PlanScreen";
import ShopScreen from "../screens/ShopScreen";
import CookScreen from "../screens/CookScreen";

const BottomTab = createBottomTabNavigator();
const INITIAL_ROUTE_NAME = "plan";

export default function BottomTabNavigator({ navigation, route }) {
  // Set the header title on the parent stack navigator depending on the
  // currently active tab. Learn more in the documentation:
  // https://reactnavigation.org/docs/en/screen-options-resolution.html
  navigation.setOptions({
    header: () => null, // hide header title
  });

  return (
    <BottomTab.Navigator
      initialRouteName={INITIAL_ROUTE_NAME}
      tabBarOptions={{
        activeTintColor: Colors.tintColor,
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
        component={ShopScreen}
        options={{
          title: "Winkelen",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} name="ios-cart" />
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
