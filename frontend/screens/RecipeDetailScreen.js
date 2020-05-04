import * as React from "react";
import {
  StyleSheet,
  Text,
  FlatList,
  View,
  ImageBackground,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import Colors from "../constants/Colors";
import { CloseIcon } from "../components/Icon";
import { SectionHeader } from "../components/Section/SectionHeader";
import { ListItem } from "../components/ListItem/ListItem";
import { QuantitySelector } from "../components/Ingredient/QuantitySelector";
import SkeletonContent from "react-native-skeleton-content";
import { useSafeArea } from "react-native-safe-area-context";
import Layout from "../constants/Layout";

const GET_RECIPE = gql`
  query GetRecipe($recipeId: ID!) {
    recipe: node(id: $recipeId) {
      ... on Recipe {
        id
        title
        description
        imageUrl
        ingredients {
          quantity
          ingredient {
            id
            name
            imageUrl
            orderedQuantity
          }
        }
      }
    }
  }
`;

export default function RecipeDetailScreen({ route: { params }, navigation }) {
  const { loading, error, data = {} } = useQuery(GET_RECIPE, {
    variables: { recipeId: params.id },
    returnPartialData: true,
  });
  if (error) return `Error! ${error}`;
  const { recipe = params.recipe } = data;
  const insets = useSafeArea();

  navigation.setOptions({ title: recipe.title, header: () => null });

  return (
    <ScrollView style={{ flex: 1 }} stickyHeaderIndices={[0]}>
      <CloseIcon
        style={{ position: "absolute", top: insets.top, right: insets.left }}
        onPress={(e) => {
          e.preventDefault();
          navigation.goBack();
        }}
      />

      <ImageBackground
        source={{ uri: recipe.imageUrl }}
        fadeDuration={0}
        imageStyle={{ resizeMode: "cover" }}
      >
        <View
          style={{
            flexDirection: "row",
            width: "auto",
            height: 200,
          }}
        ></View>
      </ImageBackground>

      <SectionHeader title={recipe.title} />

      <SkeletonContent
        layout={[
          {
            width: "auto",
            height: 100,
            marginBottom: 10,
          },
          ...Array(5).fill({
            width: "auto",
            height: 60,
            marginBottom: 10,
          }),
        ]}
        boneColor={Colors.skeletonBone}
        highlightColor={Colors.skeletonHighlight}
        containerStyle={{ paddingHorizontal: 20 }}
        isLoading={loading}
      />
      <Text
        style={{
          backgroundColor: Colors.cardBackground,
          color: Colors.text,
          marginHorizontal: 20,
          marginBottom: 20,
          padding: 10,
          borderRadius: Layout.borderRadius,
        }}
      >
        {recipe.description}
      </Text>

      <FlatList
        style={{ paddingHorizontal: 20 }}
        data={recipe.ingredients}
        keyExtractor={({ ingredient }) => ingredient.id}
        renderItem={({ item: { ingredient } }) => {
          return (
            <ListItem
              style={{
                backgroundColor: ingredient.isPlanned
                  ? Colors.cardHighlightBackground
                  : Colors.cardBackground,
              }}
              title={ingredient.name}
              imageUrl={ingredient.imageUrl}
            >
              <QuantitySelector
                id={ingredient.id}
                orderedQuantity={ingredient.orderedQuantity}
              />
            </ListItem>
          );
        }}
      />
    </ScrollView>
  );
}
