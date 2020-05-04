import { useLinking } from "@react-navigation/native";
import { Linking } from "expo";

export default function (containerRef) {
  return useLinking(containerRef, {
    prefixes: [Linking.makeUrl("#")],
    config: {
      Root: {
        initialRouteName: "plan",
        path: "/",
        screens: {
          plan: "plan",
          shop: "shop",
          cook: "cook",
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
    },
  });
}
