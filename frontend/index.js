// Sets up Metro's web runtime, including fast refresh. Expo Router's entry
// does this for you; a custom entry has to import it, or React Native's native
// HMR client runs instead and fails with "Missing required parameter `platform`".
import '@expo/metro-runtime';
import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App)
// and sets up the web environment. Replaces the legacy
// "main": "node_modules/expo/AppEntry.js" entry, which reached back out of
// node_modules with `import App from '../../App'`.
registerRootComponent(App);
