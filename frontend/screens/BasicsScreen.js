import * as React from "react";
import { View, FlatList, Dimensions } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useQuery, useSubscription } from "@apollo/react-hooks";
import gql from "graphql-tag";
import Colors from "../constants/Colors";
import { SectionHeader } from "../components/Section/SectionHeader";
import { ListItem } from "../components/ListItem/ListItem";
import { OrderQuantity } from "../components/Ingredient/OrderQuantity";
import SkeletonContent from "react-native-skeleton-content";
import { SafeAreaView } from "react-native-safe-area-context";

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

const SUBSCRIBE_UNPLANNED_RECIPES = gql`
  subscription RecipeUnplanned {
    recipeUnplanned {
      ingredients {
        ingredient {
          id
          isPlanned
          orderedQuantity
          plannedRecipes {
            quantity
          }
        }
      }
    }
  }
`;

const SUBSCRIBE_PLANNED_RECIPES = gql`
  subscription RecipePlanned {
    recipePlanned {
      ingredients {
        ingredient {
          id
          isPlanned
          orderedQuantity
          plannedRecipes {
            quantity
          }
        }
      }
    }
  }
`;

function BasicsList() {
  const { loading, error, data = {} } = useQuery(GET_BASICS);
  useSubscription(SUBSCRIBE_PLANNED_RECIPES);
  useSubscription(SUBSCRIBE_UNPLANNED_RECIPES);

  if (error) return `Error! ${error}`;

  const { basics: { edges = [] } = {} } = data;
  return (
    <View>
      <SectionHeader title="Altijd in huis" />
      <SkeletonContent
        layout={Array(5).fill({
          width: Dimensions.get("window").width - 40,
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
          windowSize={6}
          removeClippedSubviews
          keyExtractor={({ ingredient }) => ingredient.id}
          renderItem={({ item: { ingredient }, index }) => {
            const plannedRecipes = ingredient.plannedRecipes || [];
            return (
              <ListItem
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
                <OrderQuantity
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
        <BasicsList />
      </ScrollView>
    </SafeAreaView>
  );
}
