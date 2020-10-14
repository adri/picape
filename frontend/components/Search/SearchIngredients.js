import * as React from "react";
import gql from "graphql-tag";
import Colors from "../../constants/Colors";
import { useLazyQuery } from "@apollo/react-hooks";
import { FlatList, Text, View } from "react-native";
import { ListItem } from "../ListItem/ListItem";
import { QuantitySelector } from "../Ingredient/QuantitySelector";
import SearchBar from "../Search/SearchBar";
import { orderFields } from "../../operations/getOrder";

const SEARCH_INGREDIENTS = gql`
  query SearchIngredient($query: String!) {
    searchIngredient(query: $query) {
      id
      name
      imageUrl
      orderedQuantity
    }
  }
  ${orderFields}
`;

export function SearchIngredients() {
  const [
    searchIngredients,
    {
      loading: searchLoading,
      data: { searchIngredient: foundIngredients = [] } = {},
      variables: { query } = {},
    },
  ] = useLazyQuery(SEARCH_INGREDIENTS, {
    fetchPolicy: "cache-and-network",
  });

  return (
    <View>
      <SearchBar
        placeholder={"Zoek ingredienten..."}
        showLoading={searchLoading}
        loadingProps={{ color: Colors.tintColor }}
        onChangeText={(query) => {
          return searchIngredients({ variables: { query } });
        }}
        value={query}
        autoFocus
      />

      <FlatList
        style={{
          padding: 20,
        }}
        data={query === "" ? [] : foundIngredients}
        keyExtractor={(item) => item.id}
        renderItem={({ item: ingredient }) => {
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
    </View>
  );
}
