import React from "react";
import { ScrollView, StyleSheet } from "react-native";
import { ExpoLinksView } from "@expo/samples";
import gql from "graphql-tag";
import { graphql } from "react-apollo";

class IngredientsScreenComponent extends React.Component {
  static navigationOptions = {
    title: "Ingredients",
  };

  render() {
    return (
      <ScrollView style={styles.container}>
        {/* Go ahead and delete ExpoLinksView and replace it with your
           * content, we just wanted to provide you with some helpful links */}
        <ExpoLinksView />
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: "#fff",
  },
});

export const IngredientsScreen = graphql(gql`
  query IngredientList {
    ingredients(first: 1000, order: [{ field: NAME, direction: ASC }]) {
      edges {
        node {
          id
          name
          imageUrl
          isPlanned
          unitQuantity
          orderedQuantity
        }
      }
    }
  }
`)(IngredientsScreenComponent);
