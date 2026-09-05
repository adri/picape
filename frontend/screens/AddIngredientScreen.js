import { useMutation, gql } from '@apollo/client';
import * as React from 'react';
import { useState } from 'react';
import { View, Switch, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CloseIcon } from '../components/Icon';
import { InputText } from '../components/Input/InputText';
import { FixedFooter, FOOTER_HEIGHT } from '../components/Section/FixedFooter';
import { SectionHeader } from '../components/Section/SectionHeader';
import Colors, { useTheme } from '../constants/Colors';
import { FloatingTop, Spacing } from '../constants/Spacing';

const ADD_INGREDIENT = gql`
  mutation AddIngredient($name: String!, $isEssential: Boolean!, $supermarketProductId: String!) {
    addIngredient(
      name: $name
      isEssential: $isEssential
      supermarketProductId: $supermarketProductId
    ) {
      id
      name
      imageUrl
      isPlanned
      unitQuantity
      orderedQuantity
    }
  }
`;

export function AddIngredientScreen({
  navigation,
  route: {
    params: { ingredient },
  },
}) {
  const [form, changeForm] = useState({
    name: ingredient.name,
    isEssential: false,
    supermarketProductId: ingredient.id,
  });
  const insets = useSafeAreaInsets();
  const colors = useTheme();
  const [addIngredient] = useMutation(ADD_INGREDIENT, {
    onCompleted: () => {
      navigation.goBack();
    },
    onError: (error) => {
      alert(error.message);
    },
  });

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + FOOTER_HEIGHT + 20 }}>
        <SectionHeader title="" />
        <SectionHeader title="Ingredient toevogen" large />

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
      </ScrollView>

      <CloseIcon
        style={{ position: 'absolute', top: FloatingTop, left: Spacing.md }}
        onPress={(e) => {
          e.preventDefault();
          navigation.goBack();
        }}
      />
      <FixedFooter
        buttonText="Toevoegen"
        onPress={(e) => {
          e.preventDefault();
          addIngredient({
            variables: {
              name: form.name,
              supermarketProductId: form.supermarketProductId,
              isEssential: form.isEssential,
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
