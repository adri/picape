import * as React from "react";
import gql from "graphql-tag";
import Colors from "../../constants/Colors";
import { useLazyQuery } from "@apollo/react-hooks";
import { FlatList, View } from "react-native";
import { ListItem } from "../ListItem/ListItem";
import { OrderQuantity } from "../Ingredient/OrderQuantity";
import SearchBar from "../Search/SearchBar";

const SEARCH_INGREDIENTS = gql`
  query SearchIngredient($query: String!) {
    searchIngredient(query: $query) {
      id
      name
      imageUrl
      orderedQuantity
    }
  }
`;

const renderItem = ({ item: ingredient }) => (
  <ListItem title={ingredient.name} imageUrl={ingredient.imageUrl}>
    <OrderQuantity
      id={ingredient.id}
      orderedQuantity={ingredient.orderedQuantity}
    />
  </ListItem>
);

export function SearchIngredients({autoFocus = true, customRenderItem = null}) {
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
        autoFocus={autoFocus}
      />

      <FlatList
        style={{
          padding: 20,
        }}
        data={query === "" ? [] : foundIngredients}
        keyExtractor={(item) => item.id}
        renderItem={customRenderItem || renderItem}
      />
    </View>
  );
}
