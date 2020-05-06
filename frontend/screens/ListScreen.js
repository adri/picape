import * as React from "react";
import gql from "graphql-tag";
import Colors from "../constants/Colors";
import { useQuery } from "@apollo/react-hooks";
import { FlatList, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView } from "react-native-gesture-handler";
import { SectionHeader } from "../components/Section/SectionHeader";
import { ListItem } from "../components/ListItem/ListItem";
import { QuantitySelector } from "../components/Ingredient/QuantitySelector";
import { useFocusEffect } from "@react-navigation/native";
import SkeletonContent from "react-native-skeleton-content";
import Type from "../constants/Type";

const GET_ORDER = gql`
  query OrderList {
    currentOrder {
      id
      totalCount
      totalPrice
      items {
        id
        ingredient {
          id
          name
          imageUrl
          isPlanned(inShoppingList: false)
          orderedQuantity(inShoppingList: false)
          plannedRecipes(inShoppingList: false) {
            quantity
            recipe {
              id
              title
            }
          }
        }
      }
    }
  }
`;

export default function ListScreen({ navigation }) {
  const { loading, error, data = {}, refetch } = useQuery(GET_ORDER, {
    fetchPolicy: "cache-and-network",
  });
  if (error) return `Error! ${error}`;

  // useFocusEffect(
  //   React.useCallback(() => {
  //     console.log("hier", networkStatus);
  //     if (networkStatus === 1 || networkStatus === 4) return;
  //     refetch();
  //   }, [refetch])
  // );

  const { currentOrder = {} } = data;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView>
        <SectionHeader title="Lijst">
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

        <SkeletonContent
          layout={Array(5).fill({
            width: "auto",
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
