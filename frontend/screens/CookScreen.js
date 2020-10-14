import * as React from "react";
import Colors from "../constants/Colors";
import { useQuery } from "@apollo/react-hooks";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView } from "react-native-gesture-handler";
import { SectionHeader } from "../components/Section/SectionHeader";
import { ImageCard } from "../components/Card/ImageCard";
import SkeletonContent from "react-native-skeleton-content";
import { GET_LAST_RECIPES } from "../operations/getLastRecipes";

export default function CookScreen({ navigation }) {
  const { loading, error, data = {} } = useQuery(GET_LAST_RECIPES, {
    fetchPolicy: "cache-and-network",
  });
  if (error) return `Error! ${error}`;

  const { recipes = [] } = data;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView>
        <SectionHeader title="Recepten" />

        <SkeletonContent
          layout={Array(3).fill({
            width: 200,
            height: 100,
            margin: 5,
            marginBottom: 10,
            flexBasis: "45%",
          })}
          containerStyle={{
            flexDirection: "row",
            flexWrap: "wrap",
            alignContent: "stretch",
            paddingHorizontal: 15,
            marginBottom: 50,
          }}
          boneColor={Colors.skeletonBone}
          highlightColor={Colors.skeletonHighlight}
          isLoading={loading}
        >
          {recipes.map((recipe, index) => (
            <ImageCard
              key={recipe.id}
              style={{
                animationDuration: `${200 + 100 * index}ms`,
                animationPlayState: "running",
                animationKeyframes: {
                  from: { opacity: 0 },
                  to: { opacity: 1 },
                },
                transitionProperty: ["background-color", "opacity"],
                transitionDuration: "200ms",
                transitionTimingFunction: "ease-in",
                flexBasis: "50%",
                width: "100%",
              }}
              title={recipe.title}
              imageUrl={recipe.imageUrl}
              onPress={(e) => {
                e.preventDefault();
                navigation.navigate("RecipeDetail", {
                  id: recipe.id,
                  recipe,
                });
              }}
            ></ImageCard>
          ))}
        </SkeletonContent>
      </ScrollView>
    </SafeAreaView>
  );
}
