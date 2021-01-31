import * as Linking from "expo-linking";

const config = {
  prefixes: [Linking.makeUrl("#")],
  config: {
    screens: {
      Root: {
        initialRouteName: "plan",
        path: "/",
        screens: {
          plan: "plan",
          search: "search",
          shop: "shop",
          basics: "basics",
        },
      },
      RecipeDetail: {
        path: "recipe/:id",
        parse: {
          id: (id) => decodeURIComponent(id),
        },
      },
      RecipeList: {
        path: "recipes",
      },
      WeekPlanner: {
        path: "recipes",
      },
    },
  },
};

export default config;
