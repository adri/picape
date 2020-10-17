import * as React from "react";
import { View, Text, ScrollView, FlatList, StyleSheet } from "react-native";
import { useQuery, useMutation } from "@apollo/react-hooks";
import Colors from "../constants/Colors";
import { ImageCard } from "../components/Card/ImageCard";
import { Card } from "../components/Card/Card";
import { SectionHeader } from "../components/Section/SectionHeader";
import SkeletonContent from "react-native-skeleton-content";
import { useSafeArea } from "react-native-safe-area-context";
import {
  RefreshIcon,
  CloseIcon,
  MinusIcon,
  PlusIcon,
} from "../components/Icon";
import { GET_RECIPES } from "../operations/getRecipes";
import { BlurView } from "expo-blur";
import { useColorScheme } from "react-native-appearance";
import Layout from "../constants/Layout";
import { PLAN_RECIPE, optimisticResponse } from "../operations/planRecipe";

function getRandom(recipes, amount) {
  return Object.values(recipes)
    .sort(() => 0.5 - Math.random())
    .slice(0, amount);
}

function replaceRecipe(recipes, index, recipe) {
  recipes[index] = recipe;
  return Object.values(recipes);
}

function removeRecipe(recipes, index) {
  const list = Object.values(recipes);
  list.splice(index, 1);

  return list;
}

export default function WeekPlannerScreen({ navigation }) {
  const { loading, error, data = {} } = useQuery(GET_RECIPES);
  const { recipes = [] } = data;
  const insets = useSafeArea();
  const [amount, setAmount] = React.useState(4);
  const [planRecipe] = useMutation(PLAN_RECIPE, { ignoreResults: true });

  const [chosenRecipes, setRecipes] = React.useState(
    getRandom(recipes, amount)
  );

  if (error) return `Error! ${error}`;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }} stickyHeaderIndices={[0]}>
        <CloseIcon
          style={{ position: "absolute", top: insets.top, right: insets.left }}
          onPress={(e) => {
            e.preventDefault();
            navigation.goBack();
          }}
        />
        <SectionHeader title="Week planner" />

        <SkeletonContent
          layout={Array(3).fill({
            width: 50,
            height: 60,
            margin: 5,
            marginBottom: 10,
            flexBasis: "50%",
          })}
          containerStyle={styles.skeletonContainerStyle}
          boneColor={Colors.skeletonBone}
          highlightColor={Colors.skeletonHighlight}
          isLoading={loading}
        >
          <FlatList
            initialNumToRender={3}
            numColumns={2}
            windowSize={3}
            data={chosenRecipes}
            keyExtractor={(recipe) => recipe.id}
            renderItem={({ item: recipe, index }) => {
              return (
                <ImageCard
                  style={styles.imageCard}
                  imageStyle={styles.imageCardStyle}
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
                  <RefreshIcon
                    style={styles.refreshIcon}
                    onPress={(e) => {
                      e.preventDefault();
                      setRecipes(
                        replaceRecipe(
                          chosenRecipes,
                          index,
                          getRandom(recipes, 1)[0]
                        )
                      );
                    }}
                  />
                  <MinusIcon
                    style={styles.minusIcon}
                    onPress={(e) => {
                      e.preventDefault();
                      setRecipes(removeRecipe(chosenRecipes, index));
                    }}
                  />
                </ImageCard>
              );
            }}
          />
          <Card
            style={{ flexBasis: "100%", marginTop: 10 }}
            cardStyle={styles.cardStyle}
            width={"auto"}
            height={80}
            key="new-recipe"
          >
            <PlusIcon
              style={{ alignSelf: "center" }}
              onPress={(e) => {
                e.preventDefault();
                setRecipes(
                  replaceRecipe(
                    chosenRecipes,
                    chosenRecipes.length,
                    getRandom(recipes, 1)[0]
                  )
                );
              }}
            />
          </Card>
        </SkeletonContent>
      </ScrollView>
      <BlurView
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
        }}
        tint={useColorScheme()}
        intensity={100}
      >
        <Text
          onPress={(e) => {
            e.preventDefault();
            chosenRecipes.map(({ id }) =>
              planRecipe({
                variables: { recipeId: id },
                optimisticResponse: optimisticResponse("planRecipe", id, true),
              })
            );
            navigation.goBack();
          }}
          style={{
            color: Colors.text,
            alignSelf: "center",
            padding: 10,
            paddingHorizontal: 20,
            marginTop: 20,
            marginBottom: insets.bottom + 20,
            backgroundColor: Colors.iconDefault,
            borderRadius: Layout.borderRadius,
          }}
        >
          Recepten plannen
        </Text>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  imageCard: {
    flexBasis: "50%",
  },
  imageCardStyle: {
    width: "100%",
    justifyContent: "space-between",
  },
  cardStyle: {
    alignContent: "center",
    justifyContent: "center",
  },
  skeletonContainerStyle: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignContent: "stretch",
    paddingHorizontal: 15,
    marginBottom: 50,
  },
  refreshIcon: {
    marginTop: 10,
    marginRight: 10,
  },
  minusIcon: {
    marginTop: 10,
    marginLeft: 10,
  },
});
