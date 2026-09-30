import BasicsScreen from '../screens/BasicsScreen';
import ListScreen from '../screens/ListScreen';
import PlanScreen from '../screens/PlanScreen';
import SearchScreen from '../screens/SearchScreen';

// The four tabs, shared by the web tab navigator and the native one. `icon`
// is the Ionicon the web bar draws; `sf` is the SF Symbol the iOS tab bar
// renders natively.
export const TABS = [
  {
    name: 'plan',
    title: 'Recepten',
    component: PlanScreen,
    icon: 'restaurant',
    sf: 'fork.knife',
  },
  {
    name: 'search',
    title: 'Zoeken',
    component: SearchScreen,
    icon: 'search',
    sf: 'magnifyingglass',
  },
  {
    name: 'basics',
    title: 'Basics',
    component: BasicsScreen,
    icon: 'home',
    sf: 'house',
  },
  {
    name: 'shop',
    title: 'Mandje',
    component: ListScreen,
    icon: 'cart',
    sf: 'cart',
    badge: true,
  },
];

export const INITIAL_ROUTE_NAME = 'plan';
