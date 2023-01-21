import {
  createBottomTabNavigator,
  BottomTabBar,
} from "@react-navigation/bottom-tabs";
import * as React from "react";
import { BlurView } from "expo-blur";
import {
  createStackNavigator,
  TransitionPresets,
} from "@react-navigation/stack";
import Colors from "../constants/Colors";
import TabBarIcon from "../components/TabBarIcon";
import PlanScreen from "../screens/PlanScreen";
import ListScreen from "../screens/ListScreen";
import SearchScreen from "../screens/SearchScreen";
import BasicsScreen from "../screens/BasicsScreen";
import { StyleSheet, useColorScheme } from "react-native";
import { ListCountBadge } from "../components/Badge/ListCountBadge";
import RecipeDetailScreen from "../screens/RecipeDetailScreen";
import WeekPlannerScreen from "../screens/WeekPlannerScreen";
import {EditRecipeScreen} from "../screens/EditRecipeScreen";
import { RecipeListScreen } from "../screens/RecipeListScreen";
import { NewRecipeScreen } from "../screens/NewRecipeScreen";
import { AddIngredientScreen } from "../screens/AddIngredientScreen";

const INITIAL_ROUTE_NAME = "plan";

function TabBar(props) {
  const colorScheme = useColorScheme();

  return (
    <BlurView
      style={styles.blurContainer}
      tint={colorScheme}
      intensity={50}
    >
      <BottomTabBar {...props} />
    </BlurView>
  );
}

const Stack = createStackNavigator();

const modal = () => ({
  animationEnabled: true,
  ...TransitionPresets.ModalPresentationIOS,
})

export default function PlanStackScreen() {
  return (
    <Stack.Navigator
      headerMode="none"
      screenOptions={() => ({
        animationEnabled: true,
        ...TransitionPresets.SlideFromRightIOS,
      })}
    >
      <Stack.Screen name="PlanScreen" component={BottomTabNavigator} />
      <Stack.Screen name="RecipeList" component={RecipeListScreen} />
      <Stack.Screen name="WeekPlanner" component={WeekPlannerScreen} />
      <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
      <Stack.Screen name="EditRecipe" component={EditRecipeScreen} options={modal} />
      <Stack.Screen name="NewRecipe" component={NewRecipeScreen} options={modal} />
      <Stack.Screen name="AddIngredient" component={AddIngredientScreen} options={modal} />
    </Stack.Navigator>
  );
}

const BottomTab = createBottomTabNavigator();

function BottomTabNavigator() {
  return (
    <BottomTab.Navigator
      initialRouteName={INITIAL_ROUTE_NAME}
      tabBar={(props) => <TabBar {...props} />}
      headerTransparent={true}
      tabBarOptions={{
        showLabel: false,
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
            <TabBarIcon focused={focused} name="ios-restaurant" />
          ),
        }}
      />
      <BottomTab.Screen
        name="search"
        component={SearchScreen}
        options={{
          title: "Zoeken",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} name="ios-search" />
          ),
        }}
      />
      <BottomTab.Screen
        name="basics"
        component={BasicsScreen}
        options={{
          title: "Basics",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} name="ios-home" />
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
              badge={<ListCountBadge focused={focused} />}
              name="ios-cart"
            />
          ),
        }}
      />
    </BottomTab.Navigator>
  );
}

const styles = StyleSheet.create({
  blurContainer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backdropFilter: `blur(${100 * 0.2}px)`,
      WebkitBackdropFilter: `saturate(180%) blur(${100 * 0.2}px)`
  }
 });
