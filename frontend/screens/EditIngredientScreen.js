import * as React from 'react';
import gql from 'graphql-tag';
import { View, Switch, Text, StyleSheet, ScrollView } from 'react-native';
import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/react-hooks';
import Colors from '../constants/Colors';
import { SectionHeader } from '../components/Section/SectionHeader';
import { CloseIcon, PlusIcon } from '../components/Icon';
import { InputText } from '../components/Input/InputText';
import { FixedFooter } from '../components/Section/FixedFooter';
import { SearchIngredients } from '../components/Search/SearchIngredients';
import { ListItem } from '../components/ListItem/ListItem';
import { useRef } from 'react';
import Layout from '../constants/Layout';

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
  });

  const { data: { node: ingredient } = {}, loading } = useQuery(GET_INGREDIENT, {
    variables: { ingredientId },
    onCompleted: (data) => {
      changeForm({
        name: data.node.name,
        isEssential: data.node.isEssential,
        supermarketProductId: data.node.supermarketProductId,
      });
    },
  });

  if (loading) return null;
  if (!loading && !ingredient) {
    navigation.goBack();
    return;
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }} stickyHeaderIndices={[0]}>
        <CloseIcon
          style={{ position: 'absolute' }}
          inputStyle={StyleSheet.flatten([styles.input])}
          inputContainerStyle={StyleSheet.flatten([styles.inputContainer])}
          onPress={(e) => {
            e.preventDefault();
            navigation.goBack();
          }}
        />

        <SectionHeader title="" />
        <SectionHeader title="Bewerk ingrediënt" />

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
            labelStyle={styles.label}
            inputStyle={styles.input}
            inputContainerStyle={styles.inputContainer}
          />
        </View>

        <View style={[styles.switch]}>
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
          <Text style={styles.label}>Supermarket</Text>
          <SearchIngredients
            autoFocus={false}
            supermarketOnly={true}
            placeholder={form.supermarketName || ingredient.supermarketName}
            customRenderItem={({ item: ingredient, searchRef }) => (
              <ListItem autoFocus={false} title={ingredient.name} imageUrl={ingredient.imageUrl}>
                <PlusIcon
                  style={{ margin: 10 }}
                  onPress={(e) => {
                    e.preventDefault();
                    searchRef.current.clear();
                    console.log(ingredient);
                    return changeForm({
                      ...form,
                      supermarketProductId: ingredient.id,
                      supermarketName: ingredient.name,
                    });
                  }}
                />
              </ListItem>
            )}
          />
        </View>
      </ScrollView>
      <FixedFooter
        buttonText={'Bewerken'}
        onPress={(e) => {
          e.preventDefault();
          editIngredient({
            variables: {
              input: {
                ingredientId: ingredientId,
                name: form.name,
                supermarketProductId: form.supermarketProductId,
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
    backgroundColor: Colors.cardBackground,
    marginHorizontal: 20,
    borderRadius: 9,
    padding: 10,
  },
  label: {
    color: Colors.text,
    paddingBottom: 5,
  },
  inputContainer: {
    borderBottomWidth: 0,
    backgroundColor: Colors.cardBackground,
    borderRadius: 9,
    minHeight: 36,
  },
});
