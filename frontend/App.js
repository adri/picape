import * as React from "react";
import * as SplashScreen from "expo-splash-screen";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import {
  createStackNavigator,
  TransitionPresets,
} from "@react-navigation/stack";
import { ApolloClient } from "apollo-client";
import { ApolloProvider } from "@apollo/react-hooks";
import { InMemoryCache } from "apollo-cache-inmemory";
import * as AbsintheSocket from "@absinthe/socket";
import { createAbsintheSocketLink } from "@absinthe/socket-apollo-link";
import { Socket as PhoenixSocket } from "phoenix";
import { onError } from "apollo-link-error";
import { ApolloLink } from "apollo-link";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppearanceProvider, useColorScheme } from "react-native-appearance";
import * as Updates from "expo-updates";
import BottomTabNavigator from "./navigation/BottomTabNavigator";
import RecipeDetailScreen from "./screens/RecipeDetailScreen";
import WeekPlannerScreen from "./screens/WeekPlannerScreen";
import ShopScreen from "./screens/ShopScreen";
import useLinking from "./navigation/useLinking";
import { RecipeListScreen } from "./screens/RecipeListScreen";
import Sentry from "./Sentry";

const onErrorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.map(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );

  if (networkError) console.log(`[Network error]:`, networkError);
});

const Stack = createStackNavigator();
const host = "wss://picape.whybug.com/socket";
// const host = "ws://localhost:4000/socket";
const link = ApolloLink.from([
  onErrorLink,
  createAbsintheSocketLink(AbsintheSocket.create(new PhoenixSocket(host))),
]);
const client = new ApolloClient({
  link: link,
  cache: new InMemoryCache({ freezeResults: true }),
  assumeImmutableResults: true,
});

const LightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "white", // by default this is grey
  },
};

const DarkTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: "black", // by default this is grey
    border: "#404040",
  },
};
export default function App(props) {
  const [isLoadingComplete, setLoadingComplete] = React.useState(false);
  const [initialNavigationState, setInitialNavigationState] = React.useState();
  const containerRef = React.useRef();
  const { getInitialState } = useLinking(containerRef);
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? DarkTheme : LightTheme;

  // Load any resources or data that we need prior to rendering the app
  React.useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        SplashScreen.preventAutoHideAsync();

        // Load our initial navigation state
        setInitialNavigationState(await getInitialState());
      } catch (e) {
        // We might want to provide this error information to an error reporting service
        console.warn(e);
      } finally {
        setLoadingComplete(true);
        SplashScreen.hideAsync();
      }
    }

    loadResourcesAndDataAsync();
  }, []);

  if (!isLoadingComplete && !props.skipLoadingScreen) {
    return null;
  } else {
    return (
      <SafeAreaProvider>
        <ApolloProvider client={client}>
          <NavigationContainer
            ref={containerRef}
            initialState={initialNavigationState}
            theme={theme}
          >
            <Stack.Navigator
              headerMode="none"
              mode="modal"
              screenOptions={() => ({
                cardOverlayEnabled: true,
                ...TransitionPresets.ModalPresentationIOS,
              })}
            >
              <Stack.Screen name="Root" component={BottomTabNavigator} />
              <Stack.Screen name="WeekPlanner" component={WeekPlannerScreen} />
              <Stack.Screen
                name="RecipeDetail"
                component={RecipeDetailScreen}
              />
              <Stack.Screen name="RecipeList" component={RecipeListScreen} />
              <Stack.Screen name="Shop" component={ShopScreen} />
            </Stack.Navigator>
          </NavigationContainer>
        </ApolloProvider>
      </SafeAreaProvider>
    );
  }
}
