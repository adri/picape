import { createBottomTabNavigator, BottomTabBar } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  createStackNavigator,
  CardStyleInterpolators,
  TransitionPresets,
} from '@react-navigation/stack';
import { BlurView } from 'expo-blur';
import * as React from 'react';
import { Dimensions, Platform, StyleSheet, useColorScheme } from 'react-native';

import { ListCountBadge } from '../components/Badge/ListCountBadge';
import TabBarIcon from '../components/TabBarIcon';
import Colors, { useTheme } from '../constants/Colors';
import { contentColumn } from '../constants/Layout';
import { prefersReducedMotion } from '../constants/Motion';
import { Hairline } from '../constants/Spacing';
import { AddIngredientScreen } from '../screens/AddIngredientScreen';
import { BonusScreen } from '../screens/BonusScreen';
import { EditIngredientScreen } from '../screens/EditIngredientScreen';
import { EditRecipeScreen } from '../screens/EditRecipeScreen';
import { IngredientDetailScreen } from '../screens/IngredientDetailScreen';
import { NewRecipeScreen } from '../screens/NewRecipeScreen';
import { PreviouslyOrderedScreen } from '../screens/PreviouslyOrderedScreen';
import RecipeDetailScreen from '../screens/RecipeDetailScreen';
import { RecipeListScreen } from '../screens/RecipeListScreen';
import WeekPlannerScreen from '../screens/WeekPlannerScreen';
import NativeTabNavigator from './NativeTabNavigator';
import { INITIAL_ROUTE_NAME, TABS } from './tabs';

// On web the tab bar is a blur strip pinned to the bottom edge. On iOS the
// native UITabBarController provides the bar, so this component is only used
// by the web build.
function TabBar(props) {
  const colorScheme = useColorScheme();
  const colors = useTheme();

  return (
    <BlurView
      style={[styles.blurContainer, { borderTopColor: colors.hairLineBackground }]}
      tint={colorScheme}
      intensity={50}>
      <BottomTabBar {...props} />
    </BlurView>
  );
}

// Web keeps the JS stack: the native stack is UIViewController-backed and does
// not render in a browser. On iOS the native stack gives the four form routes a
// real page-sheet with UIKit's interactive pull-to-dismiss, which the JS card
// gesture can only approximate.
const isWeb = Platform.OS === 'web';
const Stack = isWeb ? createStackNavigator() : createNativeStackNavigator();

// A card slides in from the right and a modal rises from the bottom, which is
// exactly the axis travel a reader who asked for less motion is asking not to
// see. Apple's own answer to Reduce Motion is to swap a transition along an
// axis for a fade rather than to drop it, so only the interpolator changes: the
// gesture, its direction and the timing stay as they are, and the screen
// cross-fades over the one behind it instead of sliding across it.
const reduceMotion = () =>
  prefersReducedMotion()
    ? isWeb
      ? { cardStyleInterpolator: CardStyleInterpolators.forFadeFromCenter }
      : { animation: 'fade' }
    : null;

const modal = () => ({
  ...(isWeb
    ? {
        ...TransitionPresets.ModalPresentationIOS,
        gestureResponseDistance: Dimensions.get('window').height,
      }
    : { presentation: 'modal' }),
  ...reduceMotion(),
});

// The routes both stacks share. A detail screen pushes from the right — an
// ingredient opens a step deeper into the list it came from — while the
// forms present as sheets from the bottom.
const routes = [
  { name: 'PlanScreen', component: BottomTabNavigator },
  { name: 'RecipeList', component: RecipeListScreen },
  { name: 'PreviouslyOrdered', component: PreviouslyOrderedScreen },
  { name: 'Bonus', component: BonusScreen },
  { name: 'WeekPlanner', component: WeekPlannerScreen },
  { name: 'RecipeDetail', component: RecipeDetailScreen },
  { name: 'IngredientDetail', component: IngredientDetailScreen },
  { name: 'EditRecipe', component: EditRecipeScreen, modal: true },
  { name: 'NewRecipe', component: NewRecipeScreen, modal: true },
  { name: 'AddIngredient', component: AddIngredientScreen, modal: true },
  { name: 'EditIngredient', component: EditIngredientScreen, modal: true },
];

export default function PlanStackScreen() {
  return (
    <Stack.Navigator
      screenOptions={() => ({
        headerShown: false,
        // On web the 'screen' header mode lets a card overflow the body so the
        // browser scrolls the document and can hide its address bar. This app
        // is a standalone PWA with no address bar, and that mode carries the
        // pinned back buttons and footers away with the content. 'float' keeps
        // each card at viewport height, so its own ScrollView scrolls instead.
        //
        // Web also detaches every card but the top one, so an edge swipe back
        // remounts the screen it reveals and shows one blank frame first.
        // Keeping it attached means it is already painted when the swipe starts.
        ...(isWeb
          ? {
              headerMode: 'float',
              detachPreviousScreen: false,
              ...TransitionPresets.SlideFromRightIOS,
            }
          : null),
        ...reduceMotion(),
      })}>
      {routes.map(({ name, component, modal: isModal }) => (
        <Stack.Screen
          key={name}
          name={name}
          component={component}
          options={isModal ? modal : undefined}
        />
      ))}
    </Stack.Navigator>
  );
}

const WebTab = createBottomTabNavigator();

function WebTabNavigator() {
  return (
    <WebTab.Navigator
      initialRouteName={INITIAL_ROUTE_NAME}
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: Colors.tintColor,
        tabBarInactiveTintColor: Colors.tabIconDefault,
        tabBarStyle: {
          backgroundColor: 'transparent',
          // The separator is drawn on the BlurView below instead, so it lands
          // above the blur rather than inside it.
          borderTopWidth: 0,
          // The blur still spans the display, but the four icons cluster in the
          // middle of it. Spread over a 13" tablet they end up a hand's travel
          // apart, and the one you want is never where you last left it.
          ...contentColumn,
        },
      }}>
      {TABS.map(({ name, title, component, icon, badge }) => (
        <WebTab.Screen
          key={name}
          name={name}
          component={component}
          options={{
            title,
            tabBarAccessibilityLabel: title,
            tabBarIcon: ({ focused }) => (
              <TabBarIcon
                focused={focused}
                badge={badge ? <ListCountBadge focused={focused} /> : undefined}
                name={icon}
              />
            ),
          }}
        />
      ))}
    </WebTab.Navigator>
  );
}

function BottomTabNavigator() {
  return isWeb ? <WebTabNavigator /> : <NativeTabNavigator />;
}

const styles = StyleSheet.create({
  blurContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: Hairline,
    backdropFilter: `blur(${100 * 0.2}px)`,
    WebkitBackdropFilter: `saturate(180%) blur(${100 * 0.2}px)`,
  },
});
