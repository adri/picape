import * as React from "react";
import { SplashScreen } from "expo";
import * as Font from "expo-font";
import { Ionicons } from "@expo/vector-icons";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { ApolloClient } from "apollo-client";
import { ApolloProvider } from "react-apollo";
import { InMemoryCache } from "apollo-cache-inmemory";
import * as AbsintheSocket from "@absinthe/socket";
import { createAbsintheSocketLink } from "@absinthe/socket-apollo-link";
import { Socket as PhoenixSocket } from "phoenix";
import { onError } from "apollo-link-error";
import { ApolloLink } from "apollo-link";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppearanceProvider, useColorScheme } from "react-native-appearance";

import BottomTabNavigator from "./navigation/BottomTabNavigator";
import RecipeDetailScreen from "./screens/RecipeDetailScreen";
import ShopScreen from "./screens/ShopScreen";
import useLinking from "./navigation/useLinking";

const onErrorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.map(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );

  if (networkError) console.log(`[Network error]: ${networkError}`);
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
  cache: new InMemoryCache(),
});

const LightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "white",
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
        SplashScreen.preventAutoHide();

        // Load our initial navigation state
        setInitialNavigationState(await getInitialState());

        // Load fonts
        await Font.loadAsync({
          ...Ionicons.font,
          "space-mono": require("./assets/fonts/SpaceMono-Regular.ttf"),
        });
      } catch (e) {
        // We might want to provide this error information to an error reporting service
        console.warn(e);
      } finally {
        setLoadingComplete(true);
        SplashScreen.hide();
      }
    }

    loadResourcesAndDataAsync();
  }, []);

  if (!isLoadingComplete && !props.skipLoadingScreen) {
    return null;
  } else {
    return (
      <AppearanceProvider>
        <SafeAreaProvider>
          {/* <StatusBar barStyle="default" /> */}
          <ApolloProvider client={client}>
            <NavigationContainer
              ref={containerRef}
              initialState={initialNavigationState}
              theme={theme}
            >
              <Stack.Navigator headerMode="none">
                <Stack.Screen name="Root" component={BottomTabNavigator} />
                <Stack.Screen
                  name="RecipeDetail"
                  component={RecipeDetailScreen}
                />
                <Stack.Screen name="Shop" component={ShopScreen} />
              </Stack.Navigator>
            </NavigationContainer>
          </ApolloProvider>
        </SafeAreaProvider>
      </AppearanceProvider>
    );
  }
}
