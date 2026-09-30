import { useQuery, useApolloClient } from '@apollo/client';
import * as React from 'react';
import { View, Text, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { useSafeArea } from 'react-native-safe-area-context';

import { ErrorState } from '../components/ErrorState';
import { Card } from '../components/Card/Card';
import { ImageCard } from '../components/Card/ImageCard';
import { BackIcon, RefreshIcon, MinusIcon, PlusIcon } from '../components/Icon';
import { FixedFooter, FOOTER_HEIGHT } from '../components/Section/FixedFooter';
import { SectionHeader } from '../components/Section/SectionHeader';
import SkeletonContent from '../components/Skeleton/SkeletonContent';
import Colors from '../constants/Colors';
import { gridColumns } from '../constants/Layout';
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
  const columns = gridColumns(useWindowDimensions().width);
  const [amount, setAmount] = React.useState(4);
  const client = useApolloClient();

  const [chosenRecipes, setRecipes] = React.useState(getRandom(recipes, amount));

  if (error) return <ErrorState error={error} />;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top,
          paddingBottom: insets.bottom + FOOTER_HEIGHT + 20,
        }}>
        {/* An empty row under the notch, so the floating back button has
            somewhere to sit that is not on top of the title. */}
        <SectionHeader title="" />
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
          {/* A plan is a handful of cards, so a wrapping row does the job a
              FlatList did. A virtualized list here sat inside the screen's
              ScrollView on the same axis, which broke its windowing. */}
          <View style={styles.grid}>
            {chosenRecipes.map((recipe, index) => (
              <ImageCard
                style={[styles.imageCard, { width: `${100 / columns}%` }]}
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
            ))}
          </View>
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
            client.mutate({
              mutation: PLAN_RECIPE,
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    paddingHorizontal: Gutter - Spacing.xs,
  },
  imageCard: {
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
