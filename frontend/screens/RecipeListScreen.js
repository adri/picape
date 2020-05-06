import * as React from "react";
import { Text, ScrollView, FlatList } from "react-native";
import { useQuery, useMutation } from "@apollo/react-hooks";
import Colors from "../constants/Colors";
import { ImageCard } from "../components/Card/ImageCard";
import { SectionHeader } from "../components/Section/SectionHeader";
import SkeletonContent from "react-native-skeleton-content";
import { useSafeArea } from "react-native-safe-area-context";
import { CloseIcon } from "../components/Icon";
import Type from "../constants/Type";
import { GET_RECIPES } from "../operations/getRecipes";
import { PlanRecipe } from "../components/Recipe/PlanRecipe";

export function RecipeListScreen({ navigation }) {
  const { loading, error, data = {} } = useQuery(GET_RECIPES);
  const { recipes = [] } = data;
  const insets = useSafeArea();

  if (error) return `Error! ${error}`;

  return (
    <ScrollView style={{ flex: 1 }} stickyHeaderIndices={[0]}>
      <CloseIcon
        style={{ position: "absolute", top: insets.top, right: insets.left }}
        onPress={(e) => {
          e.preventDefault();
          navigation.goBack();
        }}
      />
      <SectionHeader title="Alle Recepten" />

      <SkeletonContent
        layout={Array(3).fill({
          width: 50,
          height: 60,
          margin: 5,
          marginBottom: 10,
          flexBasis: "50%",
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
        <FlatList
          initialNumToRender={3}
          numColumns={2}
          windowSize={3}
          data={recipes}
          keyExtractor={(recipe) => recipe.id}
          renderItem={({ item: recipe }) => {
            return (
              <ImageCard
                style={{ flexBasis: "50%" }}
                imageStyle={{ width: "100%" }}
                key={recipe.id}
                title={recipe.title}
                imageUrl={recipe.imageUrl}
                onPress={(e) => {
                  e.preventDefault();
                  navigation.navigate("RecipeDetail", {
                    id: recipe.id,
                    recipe,
                  });
                }}
              >
                <PlanRecipe id={recipe.id} isPlanned={recipe.isPlanned} />
              </ImageCard>
            );
          }}
        />
      </SkeletonContent>
    </ScrollView>
  );
}
