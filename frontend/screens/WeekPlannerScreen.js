import { useQuery, useMutation } from '@apollo/client';
import * as React from 'react';
import { View, Text, ScrollView, FlatList, StyleSheet } from 'react-native';
import { useSafeArea } from 'react-native-safe-area-context';

import { Card } from '../components/Card/Card';
import { ImageCard } from '../components/Card/ImageCard';
import { BackIcon, RefreshIcon, MinusIcon, PlusIcon } from '../components/Icon';
import { FixedFooter, FOOTER_HEIGHT } from '../components/Section/FixedFooter';
import { SectionHeader } from '../components/Section/SectionHeader';
import SkeletonContent from '../components/Skeleton/SkeletonContent';
import Colors from '../constants/Colors';
import { FloatingTop, Gutter, Spacing } from '../constants/Spacing';
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
          isLoading={loading && chosenRecipes.length === 0}>
          <FlatList
            initialNumToRender={3}
            numColumns={2}
            windowSize={3}
            columnWrapperStyle={{ paddingHorizontal: Gutter - Spacing.xs }}
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
                    onPress={(e) => {
                      e.preventDefault();
                      setRecipes(replaceRecipe(chosenRecipes, index, getRandom(recipes, 1)[0]));
                    }}
                  />
                  <MinusIcon
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

      <BackIcon
        style={{
          position: 'absolute',
          top: insets.top + FloatingTop,
          left: insets.left + Spacing.md,
        }}
        onPress={(e) => {
          e.preventDefault();
          navigation.goBack();
        }}
      />

      <FixedFooter
        buttonText="Recepten plannen"
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
      />
    </View>
  );
}

const styles = StyleSheet.create({
  imageCard: {
    width: '50%',
    paddingHorizontal: Spacing.xs,
    paddingBottom: Spacing.xl,
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
});
