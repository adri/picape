import { useMutation, useQuery, gql } from '@apollo/client';
import { ImageBackground } from 'expo-image';
import * as React from 'react';
import { Text, FlatList, View, Dimensions } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Hyperlink from 'react-native-hyperlink';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge } from '../components/Badge/Badge';
import { BackIcon, CheckIcon } from '../components/Icon';
import { EditIcon } from '../components/Icon/EditIcon';
import { ListItem } from '../components/ListItem/ListItem';
import { FixedFooter, FOOTER_HEIGHT } from '../components/Section/FixedFooter';
import { SectionHeader } from '../components/Section/SectionHeader';
import SkeletonContent from '../components/Skeleton/SkeletonContent';
import Colors from '../constants/Colors';
import Layout from '../constants/Layout';
import { Spacing } from '../constants/Spacing';
import { MARK_RECIPE_AS_COOKED } from '../operations/markRecipeAsCooked';

const linkify = require('linkify-it')();
linkify.add('shortcuts:', 'http:');

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
            imageUrl
            orderedQuantity
            warning {
              description
            }
          }
        }
        warning
        isCooked
      }
    }
  }
`;

const timerRegex = /((?<time>\d{1,3}\s*-?\s*\d*)\s*(?:min|minuut|minuten)\b)/i;

function stepWithTimerLinks(step) {
  return step.replace(
    timerRegex,
    (text, text1, time) =>
      `shortcuts://run-shortcut?name=Timer&input=${encodeURI(time.trim())}&text=${encodeURI(text)}`
  );
}

export default function RecipeDetailScreen({ route: { params }, navigation }) {
  const {
    loading,
    error,
    data = {},
  } = useQuery(GET_RECIPE, {
    variables: { recipeId: params.id },
    returnPartialData: true,
  });
  if (error) return `Error! ${error}`;
  const { recipe = params.recipe } = data;
  const insets = useSafeAreaInsets();
  const steps = (recipe.description || '').split('\n\n');
  const [stepChecked, setStepsChecked] = React.useState([]);
  const [markRecipeAsCooked] = useMutation(MARK_RECIPE_AS_COOKED, {
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
        <ImageBackground
          source={{ uri: recipe.imageUrl }}
          contentFit="cover"
          style={{
            width: Dimensions.get('window').width,
            height: 200,
          }}>
          <View
            style={{
              flexDirection: 'row',
              width: Dimensions.get('window').width,
              height: 200,
            }}
          />
        </ImageBackground>

        <SectionHeader title={recipe.title} large>
          <EditIcon
            onPress={(e) => {
              e.preventDefault();
              navigation.navigate('EditRecipe', { recipeId: recipe.id });
            }}
          />
        </SectionHeader>

        {recipe.warning && (
          <View
            style={{
              marginHorizontal: 20,
              padding: 10,
              marginBottom: 20,
              backgroundColor: Colors.cardBackground,
              borderRadius: Layout.borderRadius,
            }}>
            <Text style={{ color: Colors.text }}>⚠️ {recipe.warning}</Text>
          </View>
        )}

        <SkeletonContent
          layout={[
            {
              width: Dimensions.get('window').width - 40,
              height: 100,
              marginBottom: 10,
            },
            ...Array(5).fill({
              width: Dimensions.get('window').width - 40,
              height: 60,
              marginBottom: 10,
            }),
          ]}
          boneColor={Colors.skeletonBone}
          highlightColor={Colors.skeletonHighlight}
          containerStyle={{ paddingHorizontal: 20 }}
          isLoading={loading && !recipe.ingredients}
        />

        <FlatList
          horizontal
          style={{ paddingHorizontal: 20 }}
          data={recipe.ingredients}
          keyExtractor={({ ingredient }) => ingredient.id}
          renderItem={({ item: { ingredient }, index }) => {
            const warning = ingredient.warning ? ' ⚠️' : '';
            return (
              <ListItem
                style={{ marginRight: 10 }}
                onImagePress={(e) => {
                  e.preventDefault();
                  navigation.navigate('IngredientDetail', { ingredientId: ingredient.id });
                }}
                title={`${ingredient.name}${warning}`}
                imageUrl={ingredient.imageUrl}
              />
            );
          }}
        />

        {steps.map((step, index) => {
          return (
            <View
              key={`step-${index}`}
              style={{
                marginHorizontal: 20,
                marginBottom: 20,
                padding: 10,
                borderRadius: Layout.borderRadius,
                opacity: stepChecked[index] ? 0.7 : 1,
                backgroundColor: Colors.cardBackground,
                flexDirection: 'row',
              }}>
              <Hyperlink
                linkify={linkify}
                style={{ flex: 1, alignSelf: 'stretch' }}
                linkDefault={!stepChecked[index]}
                linkStyle={{ color: Colors.link }}
                linkText={(url) => {
                  if (url.includes('shortcuts://run-shortcut?name=Timer')) {
                    return new URLSearchParams(url).get('text');
                  }

                  if (url.includes('youtube.com')) {
                    return 'Youtube';
                  }

                  return url;
                }}>
                <Text
                  style={{
                    color: stepChecked[index] ? Colors.secondaryText : Colors.text,
                  }}>
                  {stepWithTimerLinks(step)}
                </Text>
              </Hyperlink>

              {stepChecked[index] ? (
                <CheckIcon
                  style={{ margin: 10 }}
                  onPress={(e) => {
                    e.preventDefault();
                    const newChecked = [...stepChecked];
                    newChecked[index] = false;
                    setStepsChecked(newChecked);
                  }}
                />
              ) : (
                <Badge
                  outline
                  style={{ margin: 10 }}
                  onPress={(e) => {
                    e.preventDefault();
                    const newChecked = [...stepChecked];
                    newChecked[index] = true;
                    setStepsChecked(newChecked);
                  }}
                />
              )}
            </View>
          );
        })}
      </ScrollView>

      <BackIcon
        style={{
          position: 'absolute',
          top: insets.top + Spacing.sm,
          left: insets.left + Spacing.md,
        }}
        onPress={(e) => {
          e.preventDefault();
          navigation.goBack();
        }}
      />

      <FixedFooter
        buttonText={recipe.isCooked ? 'Toch niet gekookt' : 'Gekookt'}
        onPress={(e) => {
          e.preventDefault();
          markRecipeAsCooked({
            variables: {
              recipeId: recipe.id,
              cooked: !recipe.isCooked,
            },
          });
        }}
      />
    </View>
  );
}
