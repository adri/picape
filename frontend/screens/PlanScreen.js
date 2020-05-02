import * as React from "react";
import { Text, View, FlatList } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useQuery, useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import Colors from "../constants/Colors";
import { ImageCard } from "../components/Card/ImageCard";
import { PlusIcon, CheckIcon } from "../components/Icon";
import { SectionHeader } from "../components/Section/SectionHeader";
import { ListItem } from "../components/ListItem/ListItem";
import { QuantitySelector } from "../components/Ingredient/QuantitySelector";
import SkeletonContent from "react-native-skeleton-content";
import { SafeAreaView } from "react-native-safe-area-context";

const PLAN_RECIPE = gql`
  mutation PlanRecipe($recipeId: ID!) {
    planRecipe(recipeId: $recipeId) {
      id
      isPlanned
    }
  }
`;
const UNPLAN_RECIPE = gql`
  mutation UnplanRecipe($recipeId: ID!) {
    unplanRecipe(recipeId: $recipeId) {
      id
      isPlanned
    }
  }
`;

function optimisticResponse(name, id, isPlanned) {
  return {
    __typename: "Mutation",
    [name]: {
      id: id,
      __typename: "Recipe",
      isPlanned: isPlanned,
    },
  };
}
const GET_RECIPES = gql`
  query RecipeList {
    recipes {
      id
      title
      imageUrl
      isPlanned
    }
  }
`;
const GET_BASICS = gql`
  query BasicsList {
    basics: ingredients(
      first: 1000
      filter: { essential: true }
      order: [{ field: NAME, direction: ASC }]
    ) {
      edges {
        ingredient: node {
          id
          name
          imageUrl
          isPlanned
          orderedQuantity
          plannedRecipes {
            quantity
            recipe {
              id
              title
            }
          }
          season {
            label
          }
        }
      }
    }
  }
`;

function RecipeList({ navigation }) {
  const { loading, error, data = {} } = useQuery(GET_RECIPES);
  const [planRecipe] = useMutation(PLAN_RECIPE, {
    refetchQueries: ["BasicsList", "OrderList"],
  });
  const [unplanRecipe] = useMutation(UNPLAN_RECIPE, {
    refetchQueries: ["BasicsList", "OrderList"],
  });

  if (error) return `Error! ${error}`;

  const { recipes = [] } = data;
  return (
    <View>
      <SectionHeader title="Recepten">
        <Text
          style={{
            color: Colors.secondaryText,
            fontSize: 14,
            paddingBottom: 2,
          }}
        >
          Bekijk alles
        </Text>
      </SectionHeader>

      <ScrollView horizontal={true}>
        <SkeletonContent
          layout={[
            {
              width: 230,
              height: 148,
              marginLeft: 5,
              marginBottom: 10,
            },
            // short line
            { width: 180, height: 25, marginLeft: 5, marginBottom: 24 },
          ]}
          boneColor={Colors.skeletonBone}
          highlightColor={Colors.skeletonHighlight}
          containerStyle={{ paddingLeft: 15 }}
          isLoading={loading}
        />

        {recipes.map((recipe) => (
          <ImageCard
            onPress={(e) => {
              e.preventDefault();
              navigation.navigate("RecipeDetail", {
                id: recipe.id,
                recipe,
              });
            }}
            key={recipe.id}
            title={recipe.title}
            imageUrl={recipe.imageUrl}
          >
            {recipe.isPlanned ? (
              <CheckIcon
                onPress={(e) => {
                  e.preventDefault();
                  unplanRecipe({
                    variables: { recipeId: recipe.id },
                    optimisticResponse: optimisticResponse(
                      "unplanRecipe",
                      recipe.id,
                      false
                    ),
                  });
                }}
              />
            ) : (
              <PlusIcon
                onPress={(e) => {
                  e.preventDefault();
                  planRecipe({
                    variables: { recipeId: recipe.id },
                    optimisticResponse: optimisticResponse(
                      "planRecipe",
                      recipe.id,
                      true
                    ),
                  });
                }}
              />
            )}
          </ImageCard>
        ))}
      </ScrollView>
    </View>
  );
}

function BasicsList() {
  const { loading, error, data = {} } = useQuery(GET_BASICS);

  if (error) return `Error! ${error}`;

  const { basics: { edges = [] } = {} } = data;
  return (
    <View>
      <SectionHeader title="Basics" />
      <SkeletonContent
        layout={Array(5).fill({
          width: "auto",
          height: 60,
          marginHorizontal: 20,
          marginBottom: 10,
        })}
        boneColor={Colors.skeletonBone}
        highlightColor={Colors.skeletonHighlight}
        containerStyle={{ flex: 1 }}
        isLoading={loading}
      >
        <FlatList
          style={{ paddingHorizontal: 20 }}
          data={edges}
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
                  isPlanned={ingredient.isPlanned}
                />
              </ListItem>
            );
          }}
        />
      </SkeletonContent>
    </View>
  );
}

export default function PlanScreen({ navigation }) {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={{ paddingBottom: 50 }}>
        {/* <View style={{ flex: 1, flexDirection: "row", marginHorizontal: 20 }}>
          <View
            style={{
              flexDirection: "row",
              backgroundColor: Colors.navButtonSelectedBackground,
              padding: 5,
              paddingHorizontal: 10,
              borderRadius: 5,
            }}
          >
            <Text
              style={{
                alignSelf: "center",
                color: Colors.navButtonSelectedText,
              }}
            >
              Recepten
            </Text>
            <View
              style={{
                alignSelf: "center",
                backgroundColor: Colors.badgeBackground,
                borderRadius: 10,
                width: 20,
                height: 20,
                alignItems: "center",
                justifyContent: "center",
                marginLeft: 10,
              }}
            >
              <Text
                style={{
                  paddingHorizontal: 4,
                  fontSize: 12,
                  fontWeight: "700",
                  color: Colors.badgeText,
                }}
              >
                2
              </Text>
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              padding: 5,
              paddingHorizontal: 10,
              borderRadius: 5,
              backgroundColor: Colors.navButtonBackground,
            }}
          >
            <Text style={{ alignSelf: "center", color: Colors.navButtonText }}>
              Basics
            </Text>
          </View>
        </View>
        */}

        <RecipeList navigation={navigation} />
        <BasicsList />
      </ScrollView>
    </SafeAreaView>
  );
}

PlanScreen.navigationOptions = {
  header: null,
};
