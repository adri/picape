import * as React from 'react';
import Colors from '../../constants/Colors';
import { useState } from 'react';
import { useLazyQuery, gql } from '@apollo/client';
import { FlatList, View, Text } from 'react-native';
import { ListItem } from '../ListItem/ListItem';
import { OrderQuantity } from '../Ingredient/OrderQuantity';
import SearchBar from '../Search/SearchBar';
import { PlusIcon } from '../Icon';
import { useNavigation } from '@react-navigation/native';
import { Nutriscore } from '../Ingredient/Nutriscore';

const SEARCH_INGREDIENTS = gql`
  query SearchIngredient($query: String!, $supermarket: Boolean!) {
    ingredients: searchIngredient(query: $query) @skip(if: $supermarket) {
      id
      name
      imageUrl
      nutriscore
      orderedQuantity
      warning {
        description
      }
    }
    ingredients: searchSupermarket(query: $query) @include(if: $supermarket) {
      id
      name
      imageUrl
      unitQuantity
    }
  }
`;

const renderItem = ({ navigator, item: ingredient, supermarket }) => (
  <ListItem
    title={`${ingredient.name}${ingredient.warning ? ' ⚠️' : ''}`}
    badges={ingredient?.nutriscore ? <Nutriscore nutriscore={ingredient.nutriscore} /> : null}
    imageUrl={ingredient.imageUrl}
    onImagePress={(e) => {
      e.preventDefault();
      if (supermarket) return;
      navigator.navigate('EditIngredient', { ingredientId: ingredient.id });
    }}>
    {supermarket ? (
      <PlusIcon
        style={{ margin: 10 }}
        onPress={(e) => {
          e.preventDefault();
          navigator.navigate('AddIngredient', { ingredient: ingredient });
        }}
      />
    ) : (
      <OrderQuantity id={ingredient.id} orderedQuantity={ingredient.orderedQuantity} />
    )}
  </ListItem>
);

export function SearchIngredients({
  autoFocus = true,
  customRenderItem = null,
  supermarketOnly = false,
  placeholder = 'Zoek ingredienten...',
}) {
  const ref = React.createRef();
  const [supermarket, setSupermarket] = useState(supermarketOnly);
  const navigator = useNavigation();
  const [
    searchIngredients,
    {
      loading: searchLoading,
      data: { ingredients: foundIngredients = [] } = {},
      variables: { query = '' } = {},
    },
  ] = useLazyQuery(SEARCH_INGREDIENTS, { fetchPolicy: 'cache-and-network' });

  return (
    <View>
      <SearchBar
        ref={ref}
        placeholder={placeholder}
        showLoading={searchLoading}
        loadingProps={{ color: Colors.tintColor }}
        onChangeText={(query) => searchIngredients({ variables: { query, supermarket } })}
        value={query}
        rightIcon={
          supermarketOnly ? null : (
            <Text
              onPress={() => {
                setSupermarket(!supermarket);
                return searchIngredients({ variables: { query, supermarket: !supermarket } });
              }}
              style={{
                color: Colors.text,
                fontSize: 10,
                borderColor: Colors.iconDefault,
                borderWidth: 1,
                borderRadius: 7,
                padding: 5,
              }}>
              {supermarket ? 'AH' : 'Picape'}
            </Text>
          )
        }
        autoFocus={autoFocus}
      />

      <FlatList
        style={{ paddingTop: 20 }}
        data={query === '' ? [] : foundIngredients}
        keyExtractor={(item) => item.id}
        renderItem={(item) => {
          if (customRenderItem) {
            return customRenderItem({ ...item, navigator, supermarket, searchRef: ref });
          }
          return renderItem({ ...item, navigator, supermarket });
        }}
      />
    </View>
  );
}
