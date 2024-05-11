import { gql, useMutation } from '@apollo/client';
import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Colors from '../constants/Colors';
import { SectionHeader } from '../components/Section/SectionHeader';
import { CloseIcon } from '../components/Icon';
import { InputText } from '../components/Input/InputText';
import Type from '../constants/Type';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FixedFooter } from '../components/Section/FixedFooter';

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
      <ScrollView style={{ flex: 1 }} stickyHeaderIndices={[0]}>
        <CloseIcon
          style={{ position: 'absolute', top: insets.top, left: insets.left + 5 }}
          inputStyle={StyleSheet.flatten([styles.input])}
          inputContainerStyle={StyleSheet.flatten([styles.inputContainer])}
          onPress={(e) => {
            e.preventDefault();
            navigation.goBack();
          }}
        />

        <SectionHeader title={''}>
          <Text
            onPress={(e) => {
              e.preventDefault();
              navigation.goBack();
            }}
            style={[
              Type.sectionLink,
              {
                color: Colors.secondaryText,
                fontSize: 14,
                paddingBottom: 2,
              },
            ]}>
            Opslaan
          </Text>
        </SectionHeader>

        <SectionHeader title="Nieuw Recept" />

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
      <FixedFooter
        buttonText={'Toevoegen'}
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
