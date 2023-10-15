import * as React from 'react';
import { Text, FlatList, View, ImageBackground, Dimensions } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useMutation, useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import Colors from '../constants/Colors';
import { BackIcon, CheckIcon } from '../components/Icon';
import Hyperlink from 'react-native-hyperlink';
import { SectionHeader } from '../components/Section/SectionHeader';
import { ListItem } from '../components/ListItem/ListItem';
import SkeletonContent from 'react-native-skeleton-content';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Layout from '../constants/Layout';
import { Badge } from '../components/Badge/Badge';
import { EditIcon } from '../components/Icon/EditIcon';
import { MARK_RECIPE_AS_COOKED } from '../operations/markRecipeAsCooked';
import { FixedFooter } from '../components/Section/FixedFooter';

var linkify = require('linkify-it')();
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

let timerRegex = /((?<time>\d{1,3}\s*-?\s*\d*)\s*(?:min|minuut|minuten)\b)/i;

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
    <ScrollView style={{ flex: 1 }} stickyHeaderIndices={[0]}>
      <BackIcon
        style={{ position: 'absolute', top: insets.top, left: insets.left + 5 }}
        onPress={(e) => {
          e.preventDefault();
          navigation.goBack();
        }}
      />

      <ImageBackground
        source={{ uri: recipe.imageUrl }}
        fadeDuration={0}
        imageStyle={{ resizeMode: 'cover' }}
        style={{
          width: Dimensions.get('window').width,
          height: 200,
        }}>
        <View
          style={{
            flexDirection: 'row',
            width: Dimensions.get('window').width,
            height: 200,
          }}></View>
      </ImageBackground>

      <SectionHeader title={recipe.title}>
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
        isLoading={loading}
      />

      <FlatList
        horizontal={true}
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
                navigation.navigate('EditIngredient', { ingredientId: ingredient.id });
              }}
              title={`${ingredient.name}${warning}`}
              imageUrl={ingredient.imageUrl}></ListItem>
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
                  let newChecked = [...stepChecked];
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
                  let newChecked = [...stepChecked];
                  newChecked[index] = true;
                  setStepsChecked(newChecked);
                }}
              />
            )}
          </View>
        );
      })}
      <View style={{ height: 60 }} />
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
    </ScrollView>
  );
}
