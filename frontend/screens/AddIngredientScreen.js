import * as React from "react";
import gql from "graphql-tag";
import { View, Switch, Text, StyleSheet, ScrollView } from "react-native";
import { useState  } from "react";
import { useMutation } from "@apollo/react-hooks";
import Colors from "../constants/Colors";
import { SectionHeader } from "../components/Section/SectionHeader";
import { CloseIcon  } from "../components/Icon";
import { InputText } from "../components/Input/InputText";
import { FixedFooter } from "../components/Section/FixedFooter";

const ADD_INGREDIENT = gql`
  mutation AddIngredient($name: String!, $isEssential: Boolean!, $supermarketProductId: String!) {
    addIngredient(name: $name, isEssential: $isEssential, supermarketProductId: $supermarketProductId) {
      id
      name
      imageUrl
      isPlanned
      unitQuantity
      orderedQuantity
    }
  }
`;

export function AddIngredientScreen({ navigation, route: { params: { ingredient }} }) {
  const [form, changeForm] = useState({
    name: ingredient.name,
    isEssential: false,
    supermarketProductId: ingredient.id,
  });
  const [addIngredient] = useMutation(ADD_INGREDIENT, {
    onCompleted: () => {
      navigation.goBack();
    },
    onError: (error) => {
     alert(error.message)
    }
  });

  return (
    <View style={{ flex: 1 }}>

    <ScrollView style={{ flex: 1 }} stickyHeaderIndices={[0]}>
      <CloseIcon
        style={{ position: "absolute", }}
        inputStyle={StyleSheet.flatten([styles.input])}
        inputContainerStyle={StyleSheet.flatten([styles.inputContainer])}
        onPress={(e) => {
          e.preventDefault();
          navigation.goBack();
        }}
      />

      <SectionHeader title="" />
      <SectionHeader title="Ingredient toevogen" />

      <View style={styles.container}>
        <InputText
          testID="name"
          label="Naam"
          onChangeText={(name) => changeForm({...form, name})}
          defaultValue={form.name}
          labelStyle={styles.label}
          inputStyle={styles.input}
          inputContainerStyle={styles.inputContainer}
        />
      </View>

     <View style={[styles.switch]}>
      <View style={[styles.container]}>
        <Text style={{ color: Colors.text, flexGrow: 1 }}>
          Altijd in huis
        </Text>
        <Switch
          onValueChange={() => changeForm({...form, isEssential: !form.isEssential})}
          value={form.isEssential}
        />

        </View>
        <Text style={{ color: Colors.secondaryText, paddingHorizontal: 20, paddingTop: 10 }}>
            Als dit aan staat, zal het ingrediënt niet automatisch aan de bestelling worden toegevoegd. Het wordt alleen gemarkeerd in de "altijd in huis" sectie.
        </Text>
      </View>

      </ScrollView>
      <FixedFooter
        buttonText={"Toevoegen"}
        onPress={(e) => {
            e.preventDefault();
            addIngredient({
              variables: {
                name: form.name,
                supermarketProductId: form.supermarketProductId,
                isEssential: form.isEssential,
              },
            });
      }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 10,
    paddingHorizontal: 20,
    flexDirection: "row",
    overflow: "hidden",
    alignItems: "center",
  },
  input: {
    marginLeft: 10,
    overflow: "hidden",
  },
  descriptionInput: {
    marginTop: 10,
    marginBottom: 10,
  },
  spacer: {
    marginTop: 100
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
