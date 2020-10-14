import * as React from "react";
import Colors from "../constants/Colors";
import Layout from "../constants/Layout";
import { useQuery, useSubscription } from "@apollo/react-hooks";
import {
  View,
  FlatList,
  Text,
  Dimensions,
  Platform,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView } from "react-native-gesture-handler";
import { SectionHeader } from "../components/Section/SectionHeader";
import { ListItem } from "../components/ListItem/ListItem";
import { QuantitySelector } from "../components/Ingredient/QuantitySelector";
import SkeletonContent from "react-native-skeleton-content";
import Type from "../constants/Type";
import { SearchIngredients } from "../components/Search/SearchIngredients";
import { ImageCard } from "../components/Card/ImageCard";
import { SUBSCRIBE_ORDER, GET_ORDER } from "../operations/getOrder";
import { GET_ORDER_COUNT } from "../operations/getOrderCount";
import { GET_RECIPES } from "../operations/getRecipes";

function PlannedRecipes({ navigation }) {
  const { loading, error, data = {} } = useQuery(GET_RECIPES, {
    fetchPolicy: "cache-only",
  });

  if (error) return `Error! ${error}`;

  const { recipes = [] } = data;
  return (
    <View>
      <SkeletonContent
        layout={[
          {
            width: 100,
            height: 90,
            marginLeft: 25,
            marginBottom: 11,
          },
          // short line
          { width: 180, height: 25, marginLeft: 25, marginBottom: 24 },
        ]}
        boneColor={Colors.skeletonBone}
        highlightColor={Colors.skeletonHighlight}
        containerStyle={{ paddingLeft: 0 }}
        isLoading={loading}
      >
        <FlatList
          style={{ paddingHorizontal: 20, height: 150 }}
          containerStyle={{ paddingLeft: 20 }}
          horizontal={true}
          removeClippedSubviews
          data={recipes.filter((recipe) => recipe.isPlanned)}
          keyExtractor={(recipe) => recipe.id}
          renderItem={({ item: recipe, index }) => {
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
                width={100}
                title={recipe.title}
                imageUrl={recipe.imageUrl}
              />
            );
          }}
        />
      </SkeletonContent>
    </View>
  );
}

export default function ListScreen({ navigation }) {
  // idea: use the count of order items to know how many skeletons to render
  const { data: countData } = useQuery(GET_ORDER_COUNT, {
    fetchPolicy: "cache-only",
  });
  const { data: subscription = {} } = useSubscription(SUBSCRIBE_ORDER);
  const { loading, error, data = {} } = useQuery(GET_ORDER, {
    fetchPolicy: "cache-and-network",
  });

  if (error) return `Error! ${error}`;

  const { currentOrder: currentOrderQuery = {} } = data;
  const { currentOrder: currentOrderSubscription } = subscription;
  const currentOrder = currentOrderSubscription || currentOrderQuery;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView>
        <SectionHeader title="Je mandje">
          <Text
            style={[
              Type.sectionLink,
              {
                color: Colors.secondaryText,
                fontSize: 14,
                paddingBottom: 2,
              },
            ]}
            onPress={(e) => {
              e.preventDefault();
              navigation.navigate("Shop");
            }}
          >
            Afvinken
          </Text>
        </SectionHeader>

        <SearchIngredients />

        <PlannedRecipes navigation={navigation} />

        <SkeletonContent
          layout={Array(countData?.currentOrder?.totalCount || 5).fill({
            width: Dimensions.get("window").width - 40,
            height: 60,
            marginHorizontal: 20,
            marginBottom: 10,
          })}
          boneColor={Colors.skeletonBone}
          highlightColor={Colors.skeletonHighlight}
          containerStyle={{}}
          isLoading={loading}
        >
          <FlatList
            style={{ paddingHorizontal: 20, marginBottom: 50 }}
            data={currentOrder.items}
            keyExtractor={(item) => item.id}
            renderItem={({ item: { ingredient }, index }) => {
              const plannedRecipes = ingredient.plannedRecipes || [];
              return (
                <ListItem
                  style={[
                    styles.fadeIn,
                    {
                      animationDuration: `${200 + 100 * index}ms`,
                      backgroundColor: ingredient.isPlanned
                        ? Colors.cardHighlightBackground
                        : Colors.cardBackground,
                    },
                  ]}
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
                  />
                </ListItem>
              );
            }}
          />
        </SkeletonContent>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fadeIn: {
    ...Platform.select({
      web: {
        animationPlayState: "running",
        animationKeyframes: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        transitionProperty: ["background-color", "opacity"],
        transitionDuration: "200ms",
        transitionTimingFunction: "ease-in",
      },
    }),
  },
});
