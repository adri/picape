import { useQuery } from "@apollo/client";
import * as React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import Colors from "../constants/Colors";
import { SectionHeader } from "../components/Section/SectionHeader";
import { useSafeArea } from "react-native-safe-area-context";
import { CloseIcon, PlusIcon } from "../components/Icon";
import { GET_RECIPES } from "../operations/getRecipes";
import { InputText } from "../components/Input/InputText";
import Type from "../constants/Type";

export function NewRecipeScreen({ navigation }) {
  const { loading, error, data = {} } = useQuery(GET_RECIPES);
  const { recipe = {} } = data;
  const insets = useSafeArea();

  if (error) return `Error! ${error}`;

  return (
    <ScrollView style={{ flex: 1 }} stickyHeaderIndices={[0]}>
      <CloseIcon
        style={{ position: "absolute", top: insets.top, left: insets.left + 5 }}
        inputStyle={StyleSheet.flatten([styles.input])}
        inputContainerStyle={StyleSheet.flatten([styles.inputContainer])}
        onPress={(e) => {
          e.preventDefault();
          navigation.goBack();
        }}
      />

      <SectionHeader title={""}>
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
          ]}
        >
          Opslaan
        </Text>
      </SectionHeader>

      <SectionHeader title="Nieuw Recept" />

      <View style={styles.container}>
        <InputText
          testID="name"
          label="Name"
          labelStyle={styles.label}
          inputStyle={styles.input}
          inputContainerStyle={styles.inputContainer}
        />
      </View>

      <View style={styles.container}>
        <InputText
          label="Omschrijving"
          multiline={true}
          numberOfLines={4}
          testID="description"
          labelStyle={styles.label}
          inputStyle={styles.input}
          inputContainerStyle={styles.inputContainer}
        />
      </View>
    </ScrollView>
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
    marginLeft: 6,
    overflow: "hidden",
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
