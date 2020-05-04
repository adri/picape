import * as React from "react";
import { Text, FlatList, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useQuery, useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import Colors from "../constants/Colors";
import Layout from "../constants/Layout";
import { CloseIcon, CheckIcon } from "../components/Icon";
import { SectionHeader } from "../components/Section/SectionHeader";
import { ListItem } from "../components/ListItem/ListItem";
import SkeletonContent from "react-native-skeleton-content";
import { useSafeArea } from "react-native-safe-area-context";
import { BuyIngredient } from "../components/Ingredient/BuyIngredient";
import { Badge } from "../components/Badge/Badge";
import { BlurView } from "expo-blur";
import { useColorScheme } from "react-native-appearance";

const GET_SHOPPING_LIST = gql`
  query ShoppingList {
    lastOrder: currentOrder {
      id
      totalCount
      totalPrice
      items {
        id
        imageUrl
        name
        ingredient {
          id
          name
          imageUrl
          isBought
          isPlanned(inShoppingList: false)
          orderedQuantity(inShoppingList: false)
          plannedRecipes(inShoppingList: false) {
            quantity
            recipe {
              id
              title
            }
          }
          tags {
            id
            name
          }
        }
      }
    }
  }
`;

const START_SHOPPING = gql`
  mutation StartShopping {
    StartShopping {
      id
    }
  }
`;

const STOP_SHOPPING = gql`
  mutation StopShopping {
    stopShopping {
      id
    }
  }
`;

function groupByTag(items) {
  return items.reduce((grouped, item) => {
    let tag = { id: "other", name: "Other" };

    if (item.ingredient.tags.length > 0) {
      tag = item.ingredient.tags[0];
    }

    if (!(tag.id in grouped)) {
      grouped[tag.id] = {
        tag: tag,
        ingredients: [],
      };
    }
    grouped[tag.id].ingredients.push(item.ingredient);

    return grouped;
  }, {});
}

export default function ShopScreen({ navigation }) {
  const { loading, error, data = {} } = useQuery(GET_SHOPPING_LIST);
  const [startShopping] = useMutation(START_SHOPPING, {
    refetchQueries: [
      "BasicsList",
      "OrderList",
      "RecipeList",
      "LastOrderedRecipes",
    ],
    onCompleted: () => navigation.goBack(),
  });

  if (error) return `Error! ${error}`;
  const { lastOrder = { items: [] } } = data;
  const insets = useSafeArea();

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1, paddingBottom: 70 }}
        stickyHeaderIndices={[0]}
      >
        <CloseIcon
          style={{ position: "absolute", top: insets.top, right: insets.right }}
          onPress={(e) => {
            e.preventDefault();
            navigation.goBack();
          }}
        />

        <SectionHeader title={"Afvinken"} />

        <SkeletonContent
          layout={[
            ...Array(5).fill({
              width: "auto",
              height: 60,
              marginBottom: 10,
            }),
          ]}
          boneColor={Colors.skeletonBone}
          highlightColor={Colors.skeletonHighlight}
          containerStyle={{ paddingHorizontal: 20 }}
          isLoading={loading}
        />

        <FlatList
          style={{ paddingHorizontal: 20 }}
          data={Object.values(groupByTag(lastOrder.items))}
          keyExtractor={({ tag }) => tag.id}
          renderItem={({ item: { tag, ingredients } }) => {
            return (
              <View>
                <Text
                  style={{
                    paddingBottom: 7,
                    paddingTop: 10,
                    color: Colors.text,
                  }}
                >
                  {tag.name}
                </Text>
                {ingredients.map((ingredient) => (
                  <ListItem
                    style={{ opacity: ingredient.isBought ? 0.5 : 1.0 }}
                    textStyle={{
                      textDecorationLine: ingredient.isBought
                        ? "line-through"
                        : null,
                    }}
                    key={ingredient.id}
                    title={ingredient.name}
                    imageUrl={ingredient.imageUrl}
                  >
                    <Badge amount={ingredient.orderedQuantity} />
                    <BuyIngredient
                      id={ingredient.id}
                      isBought={ingredient.isBought}
                    />
                  </ListItem>
                ))}
              </View>
            );
          }}
        />
      </ScrollView>

      <BlurView
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
        }}
        tint={useColorScheme()}
        intensity={50}
      >
        <Text
          onPress={(e) => {
            e.preventDefault();
            startShopping();
          }}
          style={{
            color: Colors.text,
            alignSelf: "center",
            padding: 10,
            paddingHorizontal: 20,
            marginTop: 10,
            marginBottom: insets.bottom + 20,
            backgroundColor: Colors.iconDefault,
            borderRadius: Layout.borderRadius,
          }}
        >
          Lijst leegmaken
        </Text>
      </BlurView>
    </View>
  );
}
