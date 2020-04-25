import * as React from "react";
import { StyleSheet, Text, View, ImageBackground } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import Colors from "../constants/Colors";
import { ImageCard } from "../components/Card/ImageCard";
import { PlusIcon, CheckIcon } from "../components/Icon";
import { SectionHeader } from "../components/Section/SectionHeader";
import { ListItem } from "../components/ListItem/ListItem";
import { QuantitySelector } from "../components/Ingredient/QuantitySelector";

const GET_RECIPE = gql`
  query GetRecipe($recipeId: ID!) {
    recipe: node(id: $recipeId) {
      ... on Recipe {
        id
        title
        description
        imageUrl
        ingredients {
          quantity
          ingredient {
            id
            name
          }
        }
      }
    }
  }
`;

export default function RecipeDetailScreen({ route: { params }, navigation }) {
  const { loading, error, data } = useQuery(GET_RECIPE, {
    variables: { recipeId: params.id },
    returnPartialData: true,
  });
  if (error) return `Error! ${error}`;
  if (loading)
    return (
      <View>
        <Text>Loading</Text>
      </View>
    );
  const { recipe } = data;
  navigation.setOptions({ title: recipe.title });

  return (
    <View style={styles.container}>
      <ScrollView style={styles.container}>
        <ImageBackground
          source={{ uri: recipe.imageUrl }}
          imageStyle={{ resizeMode: "cover" }}
          fadeDuration={0.2}
          style={{ flex: 1 }}
        >
          <View
            style={{
              flexDirection: "row",
              flexDirection: "row-reverse",
              width: 250,
              height: 180,
            }}
          ></View>
        </ImageBackground>
      </ScrollView>
    </View>
  );
}

RecipeDetailScreen.navigationOptions = {
  header: null,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
