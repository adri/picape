import { useLazyQuery, gql } from '@apollo/client';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as React from 'react';
import { useState } from 'react';
import { FlatList, StyleSheet, View, Text } from 'react-native';

import Colors, { useTheme } from '../../constants/Colors';
import { useBottomBarInset } from '../../constants/Layout';
import { Spacing } from '../../constants/Spacing';
import { PlusIcon } from '../Icon';
import { Nutriscore, hasNutriscore } from '../Ingredient/Nutriscore';
import { OrderQuantity } from '../Ingredient/OrderQuantity';
import { ListItem } from '../ListItem/ListItem';
import SearchBar from '../Search/SearchBar';

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
    badges={
      hasNutriscore(ingredient?.nutriscore) ? (
        <Nutriscore nutriscore={ingredient.nutriscore} />
      ) : null
    }
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
          navigator.navigate('AddIngredient', { ingredient });
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
  scrollRef = null,
  embedded = false,
}) {
  const ref = React.createRef();
  const [supermarket, setSupermarket] = useState(supermarketOnly);
  const navigator = useNavigation();
  const colors = useTheme();
  const bottomInset = useBottomBarInset();
  const [
    searchIngredients,
    {
      loading: searchLoading,
      data: { ingredients: foundIngredients = [] } = {},
      variables: { query = '' } = {},
    },
  ] = useLazyQuery(SEARCH_INGREDIENTS, { fetchPolicy: 'cache-and-network' });

  const ingredients = query === '' ? [] : foundIngredients;
  const renderRow = (item) =>
    customRenderItem
      ? customRenderItem({ item, navigator, supermarket, searchRef: ref })
      : renderItem({ item, navigator, supermarket });

  return (
    <View style={embedded ? undefined : { flex: 1 }}>
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

      {/* Embedded in a form's own ScrollView the results cannot be a
          FlatList: a vertical virtualized list inside a plain vertical
          ScrollView has no window to virtualise against. A result set is
          bounded and short, so a mapped view does the same job there. */}
      {embedded ? (
        <View style={{ paddingTop: 20 }}>
          {ingredients.map((item) => (
            <React.Fragment key={item.id}>{renderRow(item)}</React.Fragment>
          ))}
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          {/* The gap is a sibling, not padding on the list: iOS clips a
              ScrollView at its bounds, so padding on the frame still lets
              rows scroll up under the search bar. With the spacer outside
              the list's bounds no row can ever render there. */}
          <View style={{ height: Spacing.xl }} />
          <View style={{ flex: 1 }}>
            <FlatList
              ref={scrollRef}
              contentContainerStyle={{ paddingBottom: bottomInset }}
              data={ingredients}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => renderRow(item)}
            />
            {/* A row hard-clipping at the edge of the list reads as a bug.
                The gradient into the page colour makes it dissolve below
                the gap instead, the way the footer's fade works at the
                bottom. */}
            <LinearGradient
              pointerEvents="none"
              colors={[colors.background, colors.backgroundFade]}
              style={styles.topFade}
            />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  topFade: {
    position: 'absolute',
    // Sits at the list's clip edge, just below the spacer gap.
    top: 0,
    left: 0,
    right: 0,
    height: Spacing.xxl,
  },
});
