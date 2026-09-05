import { useQuery, useMutation } from '@apollo/client';
import { BlurView } from 'expo-blur';
import * as React from 'react';
import { View, Text, ScrollView, FlatList, StyleSheet, useColorScheme } from 'react-native';
import { useSafeArea } from 'react-native-safe-area-context';

import { Card } from '../components/Card/Card';
import { ImageCard } from '../components/Card/ImageCard';
import { RefreshIcon, CloseIcon, MinusIcon, PlusIcon } from '../components/Icon';
import { FOOTER_HEIGHT } from '../components/Section/FixedFooter';
import { SectionHeader } from '../components/Section/SectionHeader';
import SkeletonContent from '../components/Skeleton/SkeletonContent';
import Colors from '../constants/Colors';
import Layout from '../constants/Layout';
import { FloatingTop, Spacing } from '../constants/Spacing';
import { GET_RECIPES } from '../operations/getRecipes';
import { PLAN_RECIPE, optimisticResponse } from '../operations/planRecipe';

function getRandom(recipes, amount) {
  return Object.values(recipes)
    .sort(() => 0.5 - Math.random())
    .slice(0, amount);
}

function replaceRecipe(recipes, index, recipe) {
  recipes[index] = recipe;
  return Object.values(recipes);
}

function removeRecipe(recipes, index) {
  const list = Object.values(recipes);
  list.splice(index, 1);

  return list;
}

export default function WeekPlannerScreen({ navigation }) {
  const { loading, error, data = {} } = useQuery(GET_RECIPES);
  const { recipes = [] } = data;
  const insets = useSafeArea();
  const [amount, setAmount] = React.useState(4);
  const [planRecipe] = useMutation(PLAN_RECIPE, { ignoreResults: true });

  const [chosenRecipes, setRecipes] = React.useState(getRandom(recipes, amount));

  if (error) return `Error! ${error}`;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top,
          paddingBottom: insets.bottom + FOOTER_HEIGHT + 20,
        }}>
        <SectionHeader title="Week planner" large />

        <SkeletonContent
          layout={Array(3).fill({
            width: 50,
            height: 60,
            margin: 5,
            marginBottom: 10,
            flexBasis: '50%',
          })}
          containerStyle={styles.skeletonContainerStyle}
          boneColor={Colors.skeletonBone}
          highlightColor={Colors.skeletonHighlight}
          isLoading={loading}>
          <FlatList
            initialNumToRender={3}
            numColumns={2}
            windowSize={3}
            data={chosenRecipes}
            keyExtractor={(recipe) => recipe.id}
            renderItem={({ item: recipe, index }) => {
              return (
                <ImageCard
                  style={styles.imageCard}
                  imageStyle={styles.imageCardStyle}
                  key={recipe.id}
                  title={recipe.title}
                  imageUrl={recipe.imageUrl}
                  badges={recipe.warning && <Text>⚠️</Text>}
                  onPress={(e) => {
                    e.preventDefault();
                    navigation.navigate('RecipeDetail', {
                      id: recipe.id,
                      recipe,
                    });
                  }}>
                  <RefreshIcon
                    style={styles.refreshIcon}
                    onPress={(e) => {
                      e.preventDefault();
                      setRecipes(replaceRecipe(chosenRecipes, index, getRandom(recipes, 1)[0]));
                    }}
                  />
                  <MinusIcon
                    style={styles.minusIcon}
                    onPress={(e) => {
                      e.preventDefault();
                      setRecipes(removeRecipe(chosenRecipes, index));
                    }}
                  />
                </ImageCard>
              );
            }}
          />
          <Card
            style={{ flexBasis: '100%', marginTop: 10 }}
            cardStyle={styles.cardStyle}
            width="auto"
            height={60}
            key="new-recipe">
            <PlusIcon
              style={{ alignSelf: 'center' }}
              onPress={(e) => {
                e.preventDefault();
                setRecipes(
                  replaceRecipe(chosenRecipes, chosenRecipes.length, getRandom(recipes, 1)[0])
                );
              }}
            />
          </Card>
        </SkeletonContent>
      </ScrollView>

      <CloseIcon
        style={{
          position: 'absolute',
          top: insets.top + FloatingTop,
          right: insets.right + Spacing.md,
        }}
        onPress={(e) => {
          e.preventDefault();
          navigation.goBack();
        }}
      />

      <BlurView
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        }}
        tint={useColorScheme()}
        intensity={100}>
        <Text
          onPress={(e) => {
            e.preventDefault();
            chosenRecipes.map(({ id }) =>
              planRecipe({
                variables: { recipeId: id },
                optimisticResponse: optimisticResponse('planRecipe', id, true),
              })
            );
            navigation.goBack();
          }}
          style={{
            color: Colors.text,
            alignSelf: 'center',
            padding: 10,
            paddingHorizontal: 20,
            marginTop: 20,
            marginBottom: insets.bottom + 20,
            backgroundColor: Colors.iconDefault,
            borderRadius: Layout.borderRadius,
          }}>
          Recepten plannen
        </Text>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  imageCard: {
    flexBasis: '50%',
  },
  imageCardStyle: {
    width: '100%',
    justifyContent: 'space-between',
  },
  cardStyle: {
    alignContent: 'center',
    justifyContent: 'center',
  },
  skeletonContainerStyle: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'stretch',
    paddingHorizontal: 15,
    marginBottom: 100,
  },
  refreshIcon: {
    marginTop: 10,
    marginRight: 10,
  },
  minusIcon: {
    marginTop: 10,
    marginLeft: 10,
  },
});
