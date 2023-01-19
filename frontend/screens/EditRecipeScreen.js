import * as React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useState  } from "react";
import { useQuery, useMutation } from "@apollo/react-hooks";
import Colors from "../constants/Colors";
import { SectionHeader } from "../components/Section/SectionHeader";
import { QuantitySelector } from "../components/Ingredient/QuantitySelector";
import { CloseIcon  } from "../components/Icon";
import { GET_RECIPE } from "../operations/getRecipe";
import { InputText } from "../components/Input/InputText";
import { ListItem } from "../components/ListItem/ListItem";
import { SearchIngredients } from "../components/Search/SearchIngredients";
import { EDIT_RECIPE } from "../operations/editRecipe";
import { FixedFooter } from "../components/Section/FixedFooter";

const setIngredientQuantity = (form, ingredientId, quantity) => ({
  ...form,
  changed: true,
  ingredients: form.ingredients.map(ref => {
    if (ref.ingredient.id === ingredientId) {
      return {
        ...ref,
        quantity: parseInt(quantity, 10) || 1,
      };
    }

    return ref;
  }),
});

const deleteIngredient = (form, ingredientId) => ({
  ...form,
  changed: true,
  ingredients: form.ingredients.filter(ref => ref.ingredient.id !== ingredientId),
});

const addIngredient = (form, ingredient) => ({
  ...form,
  changed: true,
  ingredients: [
    ...form.ingredients,
    {
      quantity: 1,
      ingredient,
    },
  ],
});

export function EditRecipeScreen({ navigation, route: { params: { recipeId }} }) {
  const { loading, error, data = {} } = useQuery(GET_RECIPE, { variables: { recipeId } });
  const [editRecipe] = useMutation(EDIT_RECIPE, {
    onCompleted: () => {
      navigation.goBack();
    },
    onError: (error) => {
     alert(error.message)
    }
  });
  const { node: recipe = {} } = data;

  if (loading) return "Loading...";
  if (error) return `Error! ${error}`;

  const [form, changeForm] = useState({
    title: recipe.title,
    description: recipe.description,
    imageUrl: recipe.imageUrl,
    ingredients: recipe.ingredients,
    changed: false,
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
      <SectionHeader title="Bewerk recept" />

      <View style={styles.container}>
        <InputText
          testID="title"
          label="Naam"
          onChangeText={(title) => changeForm({...form, title, changed: true})}
          defaultValue={form.title}
          labelStyle={styles.label}
          inputStyle={styles.input}
          inputContainerStyle={styles.inputContainer}
        />
      </View>

      <View style={styles.container}>
        <InputText
          testID="imageUrl"
          label="Image"
          onChangeText={(title) => changeForm({...form, imageUrl, changed: true})}
          defaultValue={form.imageUrl}
          labelStyle={styles.label}
          inputStyle={styles.input}
          inputContainerStyle={styles.inputContainer}
        />
      </View>

      <View style={styles.container}>
        <InputText
          label="Instructies"
          multiline={true}
          scrollEnabled={true}
          onChangeText={(description) => changeForm({...form, description, changed: true})}
          defaultValue={form.description}
          numberOfLines={(form.description || "").split('\n').length}
          testID="description"
          labelStyle={styles.label}
          inputStyle={[styles.input, styles.descriptionInput]}
          inputContainerStyle={styles.inputContainer}
        />
      </View>

      <View style={{ marginHorizontal: 20,}}>
        <Text style={styles.label}>
          Ingrediënten
        </Text>
        {form.ingredients.map((row) => (
          <ListItem
            key={row.ingredient.id}
            title={row.ingredient.name}
            imageUrl={row.ingredient.imageUrl}
          >
            <QuantitySelector
              id={row.ingredient.id}
              orderedQuantity={
                row.quantity
              }
              onChange={(id, quantity) => {
                if (quantity === 0) {
                  changeForm(deleteIngredient(form, id));
                } else {
                  changeForm(setIngredientQuantity(form, id, quantity));
                }
              }}
            />
          </ListItem>
        ))}
      </View>
      <SearchIngredients
        autoFocus={false}
        customRenderItem={({ item: ingredient }) => (
          <ListItem title={ingredient.name} imageUrl={ingredient.imageUrl}>
            <QuantitySelector
              id={ingredient.id}
              orderedQuantity={0}
              onChange={() => {
                var existing = form.ingredients.find(ref => ref.ingredient.id === ingredient.id);
                if (existing) {
                  changeForm(setIngredientQuantity(form, ingredient.id, existing.quantity + 1));
                } else {
                  changeForm(addIngredient(form, ingredient))
                }
              }}
            />
          </ListItem>
        )}
      />

      <View style={styles.spacer}></View>
      </ScrollView>
      <FixedFooter
        buttonText={"Opslaan"}
        disabled={form.changed == false}
        onPress={(e) => {
            e.preventDefault();
            editRecipe({
              variables: {
                recipeId,
                title: form.title,
                description: form.description,
                imageUrl: form.imageUrl,
                ingredients: form.ingredients.map(ref => ({
                  ingredientId: ref.ingredient.id,
                  quantity: ref.quantity || 1,
                })),
              },
            });
      }}/>
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
