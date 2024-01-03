import { useQuery, useMutation, gql } from "@apollo/client";
import * as React from "react";
import {
  Linking,
  Text,
  FlatList,
  View,
  Dimensions,
  Platform,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
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
import { useColorScheme } from "react-native";
import Svg, { Path } from "react-native-svg";

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

    if (item.ingredient && item.ingredient.tags.length > 0) {
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
              width: Dimensions.get("window").width - 40,
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

        <View
          style={{
            padding: 20,
            paddingBottom: 40,
            alignSelf: "center",
          }}
        >
          {Platform.OS === "web" && (
            <Svg
              onPress={async (e) => {
                e.preventDefault();
                await Linking.openURL("https://randombonuskaart.nl");
              }}
              viewBox="0 0 24 24"
              style={{
                alignSelf: "center",
                width: 50,
                height: 50,
                marginBottom: 5,
              }}
              width="100%"
              height="100%"
            >
              <Path
                d="M22.55 11.09L17.67 2A2.61 2.61 0 0 0 16 .6a2.47 2.47 0 0 0-.7-.1 2.78 2.78 0 0 0-1.3.4L5 5.88a3 3 0 0 0-1.38 1.78l-2.41 8.39A2.55 2.55 0 0 0 3 19.33l14.25 4.05a2.41 2.41 0 0 0 3.16-1.76l2.35-8.26a3.07 3.07 0 0 0-.21-2.27z"
                fill="#fff"
              ></Path>
              <Path
                d="M21.63 11.57l-4.77-8.9a1.88 1.88 0 0 0-2.58-.76L5.54 6.78A2 2 0 0 0 4.61 8l-2.34 8.1a1.83 1.83 0 0 0 1.23 2.28l13.77 3.92a1.8 1.8 0 0 0 2.25-1.25l2.28-8a2.07 2.07 0 0 0-.17-1.48z"
                fill="#00ade6"
              ></Path>
              <Path
                d="M12.87 10.81c.77-1.11 1.48-2.22 2.79-2.22a2.25 2.25 0 0 1 2.25 2.24v6.55h-1.64v-6.2c0-.85-.69-.85-.69-.85-.56 0-1.57 1.38-2.7 2.92v4.13h-1.66v-1.91s-1.09 1.92-2.73 1.92C6.64 17.39 6 16.11 6 13.06S6.42 8.6 8.4 8.6c1.51 0 2.81 2.2 2.81 2.2V9.4l1.66-2.23s-.01 3.65 0 3.64zm-1.95 2.47s-1.51-2.95-2.49-2.95c-.76 0-.83.8-.83 2.73s.11 2.69.82 2.69c.97-.01 2.5-2.47 2.5-2.47z"
                fill="#fff"
              ></Path>
            </Svg>
          )}
          <Text
            onPress={async (e) => {
              e.preventDefault();
              await Linking.openURL("https://randombonuskaart.nl");
            }}
            style={{ alignSelf: "center", color: "#00ade6" }}
          >
            AH Bonuskaart
          </Text>
        </View>
      </ScrollView>

      <BlurView
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
        }}
        tint={useColorScheme()}
        intensity={100}
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
