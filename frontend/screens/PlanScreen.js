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
import Type from "../constants/Type";
import { PlanRecipe } from "../components/Recipe/PlanRecipe";
import { GET_RECIPES } from "../operations/getRecipes";

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

  if (error) return `Error! ${error}`;

  const { recipes = [] } = data;
  return (
    <View>
      <SectionHeader title="Recepten">
        <Text
          onPress={(e) => {
            e.preventDefault();
            navigation.navigate("RecipeList");
          }}
          style={[
            Type.sectionLink,
            {
              color: Colors.secondaryText,
              fontSize: 14,
              paddingBottom: 2,
            },
          ]}
        >
          Bekijk alles
        </Text>
      </SectionHeader>

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

      <FlatList
        style={{ paddingHorizontal: 20 }}
        horizontal={true}
        initialNumToRender={3}
        windowSize={3}
        data={recipes}
        keyExtractor={(recipe) => recipe.id}
        renderItem={({ item: recipe }) => {
          return (
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
              <PlanRecipe id={recipe.id} isPlanned={recipe.isPlanned} />
            </ImageCard>
          );
        }}
      />
    </View>
  );
}

function BasicsList() {
  const { loading, error, data = {} } = useQuery(GET_BASICS, {
    fetchPolicy: "cache-and-network",
  });

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
      ></SkeletonContent>
      <FlatList
        style={{ paddingHorizontal: 20 }}
        data={edges}
        windowSize={6}
        removeClippedSubviews
        keyExtractor={({ ingredient }) => ingredient.id}
        renderItem={({ item: { ingredient } }) => {
          const plannedRecipes = ingredient.plannedRecipes || [];
          return (
            <ListItem
              style={{
                backgroundColor: ingredient.isPlanned
                  ? Colors.cardHighlightBackground
                  : Colors.cardBackground,
              }}
              title={ingredient.name}
              imageUrl={ingredient.imageUrl}
              subtitle={plannedRecipes
                .map(
                  (planned) =>
                    `${planned.quantity}×\u00A0${planned.recipe.title}`
                )
                .join(", ")}
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
