import * as React from "react";
import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";
import { Text, View, FlatList } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SectionHeader } from "../components/Section/SectionHeader";
import { ListItem } from "../components/ListItem/ListItem";
import { QuantitySelector } from "../components/Ingredient/QuantitySelector";
import SkeletonContent from "react-native-skeleton-content";

const GET_ORDER = gql`
  query OrderList($inShoppingList: Boolean!) {
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
          isPlanned(inShoppingList: $inShoppingList)
          orderedQuantity(inShoppingList: $inShoppingList)
          plannedRecipes(inShoppingList: $inShoppingList) {
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

export default function ShopScreen() {
  const { loading, error, data = {} } = useQuery(GET_ORDER, {
    variables: { inShoppingList: false },
  });
  if (error) return `Error! ${error}`;

  const { currentOrder = {} } = data;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "white" }}
      contentContainerStyle={{ paddingTop: 30 }}
    >
      <SectionHeader title="Lijst" />

      <SkeletonContent
        layout={Array(5).fill({
          width: "auto",
          height: 60,

          marginHorizontal: 20,
          marginBottom: 10,
        })}
        containerStyle={{}}
        isLoading={loading}
      >
        <FlatList
          style={{ paddingHorizontal: 20 }}
          data={currentOrder.items}
          keyExtractor={(item) => item.id}
          renderItem={({ item: { ingredient } }) => {
            return (
              <ListItem title={ingredient.name} imageUrl={ingredient.imageUrl}>
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
  );
}
