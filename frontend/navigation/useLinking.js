import { useLinking } from "@react-navigation/native";
import * as Linking from "expo-linking";

export default function (containerRef) {
  return useLinking(containerRef, {
    prefixes: [Linking.makeUrl("#")],
    config: {
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
  });
}
