import { ApolloClient, ApolloProvider, InMemoryCache, ApolloLink } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import * as React from 'react';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import Sentry from './Sentry';
import BottomTabNavigator from './navigation/BottomTabNavigator';
import linking from './navigation/useLinking';
import { createAbsintheSocketLink } from './src/absintheSocketLink';
import { persistCacheOnChange, restoreCache } from './src/persistedCache';
import * as serviceWorkerRegistration from './src/serviceWorkerRegistration';

const onErrorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.map(({ message, locations, path }) =>
      console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
    );

  if (networkError) console.log(`[Network error]:`, networkError);
});

const host = __DEV__ ? 'ws://localhost:4010/socket' : 'wss://picape.whybug.com/socket';
const link = ApolloLink.from([onErrorLink, createAbsintheSocketLink(host)]);

const cache = new InMemoryCache();
// Before the first render, so the screens have something to paint rather than
// sweeping skeletons while the socket connects.
restoreCache(cache);
persistCacheOnChange(cache);

const client = new ApolloClient({
  link,
  cache,
  defaultOptions: {
    watchQuery: {
      // Show what was restored straight away and refresh it over the socket.
      // Without this the restored cache would satisfy the query and the screen
      // would keep showing whatever was true when the app was last closed.
      fetchPolicy: 'cache-and-network',
      // Only the first fetch needs the network; refetches within a session are
      // driven by the subscriptions.
      nextFetchPolicy: 'cache-first',
    },
  },
});

const LightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'white', // by default this is grey
  },
};

const DarkTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: 'black', // by default this is grey
    border: '#404040',
  },
};

export default function App(props) {
  const [isLoadingComplete, setLoadingComplete] = React.useState(false);
  const [initialNavigationState, setInitialNavigationState] = React.useState();
  const containerRef = React.useRef();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? DarkTheme : LightTheme;

  // Load any resources or data that we need prior to rendering the app
  React.useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        SplashScreen.preventAutoHideAsync();

        // Load our initial navigation state
        // setInitialNavigationState(await getInitialState());
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
            linking={linking}
            initialState={initialNavigationState}
            theme={theme}>
            <BottomTabNavigator />
          </NavigationContainer>
        </ApolloProvider>
      </SafeAreaProvider>
    );
  }
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.register();
