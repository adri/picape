import { useMutation, useQuery, gql } from '@apollo/client';
import * as React from 'react';
import { useState, useRef } from 'react';
import { View, Switch, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CloseIcon, PlusIcon } from '../components/Icon';
import { InputText } from '../components/Input/InputText';
import { ListItem } from '../components/ListItem/ListItem';
import { SearchIngredients } from '../components/Search/SearchIngredients';
import { FixedFooter, FOOTER_HEIGHT } from '../components/Section/FixedFooter';
import { SectionHeader } from '../components/Section/SectionHeader';
import Colors, { useTheme } from '../constants/Colors';
import Layout from '../constants/Layout';
import { FloatingTop, Spacing } from '../constants/Spacing';
import { useSheetGesture } from '../navigation/useSheetGesture';

const EDIT_INGREDIENT = gql`
  mutation EditIngredient($input: EditIngredientInput!) {
    editIngredient(input: $input) {
      id
      name
      imageUrl
      isPlanned
      unitQuantity
      orderedQuantity
      warning {
        description
      }
    }
  }
`;

const GET_INGREDIENT = gql`
  query GetIngredient($ingredientId: ID!) {
    node(id: $ingredientId) {
      ... on Ingredient {
        id
        name
        imageUrl
        isEssential
        supermarketProductId
        supermarketName
        picnicProductId
        picnicName
        picnicImageUrl
        tags {
          id
          name
          count
        }
        warning {
          description
        }
      }
    }
    currentOrder {
      mode
    }
    ingredients(first: 1000) {
      tags {
        id
        name
        count
      }
    }
  }
`;

export function EditIngredientScreen({
  navigation,
  route: {
    params: { ingredientId },
  },
}) {
  const insets = useSafeAreaInsets();
  const colors = useTheme();
  const onSheetScroll = useSheetGesture(navigation);
  const [editIngredient] = useMutation(EDIT_INGREDIENT, {
    refetchQueries: ['GetRecipe', 'RecipeList'],
    onCompleted: () => {
      navigation.goBack();
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  const [form, changeForm] = useState({
    name: '',
    isEssential: false,
    supermarketProductId: '',
    picnicProductId: null,
    picnicName: '',
  });

  const { data: { node: ingredient, currentOrder: { mode } = {} } = {}, loading } = useQuery(
    GET_INGREDIENT,
    {
      variables: { ingredientId },
      onCompleted: (data) => {
        changeForm({
          name: data.node.name,
          isEssential: data.node.isEssential,
          supermarketProductId: data.node.supermarketProductId,
          picnicProductId: data.node.picnicProductId,
        });
      },
    }
  );
  const picnic = mode === 'picnic';

  if (loading) return null;
  if (!loading && !ingredient) {
    navigation.goBack();
    return;
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        onScroll={onSheetScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: insets.bottom + FOOTER_HEIGHT + 20 }}>
        <SectionHeader title="" />
        <SectionHeader title="Bewerk ingrediënt" large />

        {ingredient.warning && (
          <View
            style={{
              marginHorizontal: 20,
              padding: 10,
              marginBottom: 20,
              backgroundColor: Colors.cardBackground,
              borderRadius: Layout.borderRadius,
            }}>
            <Text style={{ color: Colors.text }}>⚠️ {ingredient.warning.description}</Text>
          </View>
        )}
        <View style={styles.container}>
          <InputText
            testID="name"
            label="Naam"
            onChangeText={(name) => changeForm({ ...form, name })}
            defaultValue={form.name}
            labelStyle={[styles.label, { color: colors.text }]}
            inputStyle={styles.input}
            inputContainerStyle={[
              styles.inputContainer,
              { backgroundColor: colors.cardBackground },
            ]}
          />
        </View>

        <View style={[styles.switch, { backgroundColor: colors.cardBackground }]}>
          <View style={[styles.container]}>
            <Text style={{ color: Colors.text, flexGrow: 1 }}>Altijd in huis</Text>
            <Switch
              onValueChange={() => changeForm({ ...form, isEssential: !form.isEssential })}
              value={form.isEssential}
            />
          </View>
          <Text style={{ color: Colors.secondaryText, paddingHorizontal: 20, paddingTop: 10 }}>
            Als dit aan staat, zal het ingrediënt niet automatisch aan de bestelling worden
            toegevoegd. Het wordt alleen gemarkeerd in de "altijd in huis" sectie.
          </Text>
        </View>

        <View style={[styles.searchContainer]}>
          <Text style={[styles.label, { color: colors.text }]}>
            {picnic ? 'Picnic' : 'Supermarket'}
          </Text>
          <SearchIngredients
            autoFocus={false}
            embedded
            supermarketOnly
            placeholder={
              picnic
                ? form.picnicName || ingredient.picnicName || 'Zoek in Picnic'
                : form.supermarketName || ingredient.supermarketName
            }
            customRenderItem={({ item: product, searchRef }) => (
              <ListItem autoFocus={false} title={product.name} imageUrl={product.imageUrl}>
                <PlusIcon
                  style={{ margin: 10 }}
                  onPress={(e) => {
                    e.preventDefault();
                    searchRef.current.clear();
                    return changeForm(
                      picnic
                        ? {
                            ...form,
                            picnicProductId: product.id,
                            picnicName: product.name,
                          }
                        : {
                            ...form,
                            supermarketProductId: product.id,
                            supermarketName: product.name,
                          }
                    );
                  }}
                />
              </ListItem>
            )}
          />
          {picnic && form.picnicProductId && (
            <ListItem
              title={form.picnicName || ingredient.picnicName || 'Picnic product'}
              imageUrl={ingredient.picnicImageUrl}
              chevron={false}
              onPress={() =>
                changeForm({ ...form, picnicProductId: null, picnicName: '(geen Picnic product)' })
              }
            />
          )}
        </View>
      </ScrollView>

      <CloseIcon
        style={{ position: 'absolute', top: FloatingTop, left: Spacing.md }}
        onPress={(e) => {
          e.preventDefault();
          navigation.goBack();
        }}
      />
      <FixedFooter
        buttonText="Bewerken"
        onPress={(e) => {
          e.preventDefault();
          editIngredient({
            variables: {
              input: {
                ingredientId,
                name: form.name,
                supermarketProductId: form.supermarketProductId,
                picnicProductId: form.picnicProductId,
                isEssential: form.isEssential,
                tagIds: ingredient.tags.map((tag) => tag.id),
              },
            },
          });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    overflow: 'hidden',
    alignItems: 'center',
  },
  input: {
    marginLeft: 10,
    overflow: 'hidden',
  },
  searchContainer: {
    marginVertical: 20,
    marginBottom: 80,
    paddingHorizontal: 20,
  },
  descriptionInput: {
    marginTop: 10,
    marginBottom: 10,
  },
  spacer: {
    marginTop: 100,
  },
  switch: {
    flex: 1,
    marginHorizontal: 20,
    borderRadius: 9,
    padding: 10,
  },
  label: {
    paddingBottom: 5,
  },
  inputContainer: {
    borderBottomWidth: 0,
    borderRadius: 9,
    minHeight: 36,
  },
});
