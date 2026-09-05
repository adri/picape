import { gql, useMutation } from '@apollo/client';
import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CloseIcon } from '../components/Icon';
import { InputText } from '../components/Input/InputText';
import { FixedFooter, FOOTER_HEIGHT } from '../components/Section/FixedFooter';
import { SectionHeader } from '../components/Section/SectionHeader';
import { SectionLink } from '../components/Section/SectionLink';
import Colors from '../constants/Colors';
import { FloatingTop, Spacing } from '../constants/Spacing';
import Type from '../constants/Type';

const ADD_RECIPE = gql`
  mutation NewIngredient($title: String!) {
    addRecipe(title: $title) {
      id
      title
    }
  }
`;
export function NewRecipeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [form, changeForm] = useState({
    title: '',
  });
  const [addRecipe] = useMutation(ADD_RECIPE, {
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
        <SectionHeader title="">
          <SectionLink
            title="Opslaan"
            onPress={(e) => {
              e.preventDefault();
              navigation.goBack();
            }}
          />
        </SectionHeader>

        <SectionHeader title="Nieuw Recept" large />

        <View style={styles.container}>
          <InputText
            testID="title"
            label="Title"
            onChangeText={(title) => changeForm({ ...form, title })}
            labelStyle={styles.label}
            inputStyle={styles.input}
            inputContainerStyle={styles.inputContainer}
          />
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
          addRecipe({
            variables: {
              title: form.title,
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
    marginLeft: 6,
    overflow: 'hidden',
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
