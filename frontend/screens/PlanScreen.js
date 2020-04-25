import * as React from "react";
import { StyleSheet, Text, View, FlatList } from "react-native";
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
    refetchQueries: ["BasicsList"],
  });
  const [unplanRecipe] = useMutation(UNPLAN_RECIPE, {
    refetchQueries: ["BasicsList"],
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

      <SkeletonContent
        layout={[
          {
            width: 250,
            height: 140,
            margin: 20,
            marginTop: 0,
            marginBottom: 10,
          },
          // short line
          { width: 180, height: 25, marginLeft: 20, marginBottom: 32 },
        ]}
        containerStyle={{ flex: 1 }}
        isLoading={loading}
      >
        <View style={{ paddingLeft: 15 }}>
          <ScrollView horizontal={true}>
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
                  <PlusIcon
                    onPress={(e) => {
                      e.preventDefault();
                      unplanRecipe({ variables: { recipeId: recipe.id } });
                    }}
                  />
                ) : (
                  <CheckIcon
                    onPress={(e) => {
                      e.preventDefault();
                      planRecipe({ variables: { recipeId: recipe.id } });
                    }}
                  />
                )}
              </ImageCard>
            ))}
          </ScrollView>
        </View>
      </SkeletonContent>
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
    <ScrollView
      style={{ flex: 1, backgroundColor: "white" }}
      contentContainerStyle={{ paddingTop: 30 }}
    >
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
  );
}

PlanScreen.navigationOptions = {
  header: null,
};
