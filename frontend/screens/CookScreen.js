import * as React from "react";
import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";
import { Text, View, FlatList } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SectionHeader } from "../components/Section/SectionHeader";
import { ImageCard } from "../components/Card/ImageCard";
import SkeletonContent from "react-native-skeleton-content";

const GET_LAST_RECIPES = gql`
  query LastOrderedRecipes {
    recipes: lastOrderedRecipes {
      id
      title
      imageUrl
    }
  }
`;

export default function CookScreen() {
  const { loading, error, data = {} } = useQuery(GET_LAST_RECIPES, {
    variables: { inShoppingList: false },
  });
  if (error) return `Error! ${error}`;

  const { recipes = [] } = data;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "white" }}
      contentContainerStyle={{ paddingTop: 30 }}
    >
      <SectionHeader title="Recepten" />

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
        }}
        isLoading={loading}
      >
        {recipes.map((recipe) => (
          <ImageCard
            key={recipe.id}
            style={{ flexBasis: "50%" }}
            title={recipe.title}
            imageUrl={recipe.imageUrl}
          ></ImageCard>
        ))}
      </SkeletonContent>
    </ScrollView>
  );
}
