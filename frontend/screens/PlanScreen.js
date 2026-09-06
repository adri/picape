import { useQuery } from '@apollo/client';
import { useScrollToTop } from '@react-navigation/native';
import * as React from 'react';
import { Text, View, FlatList } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge } from '../components/Badge/Badge';
import { CARD_WIDTH, ImageCard } from '../components/Card/ImageCard';
import { PlanRecipe } from '../components/Recipe/PlanRecipe';
import { SectionHeader } from '../components/Section/SectionHeader';
import { SectionLink } from '../components/Section/SectionLink';
import { Separator } from '../components/Section/Separator';
import SkeletonContent from '../components/Skeleton/SkeletonContent';
import Colors from '../constants/Colors';
import Layout from '../constants/Layout';
import { Gutter, Spacing } from '../constants/Spacing';
import { GET_LAST_RECIPES } from '../operations/getLastRecipes';
import { GET_RECIPES } from '../operations/getRecipes';

function LastRecipesList({ navigation }) {
  const { loading, error, data = {} } = useQuery(GET_LAST_RECIPES);

  if (error) return `Error! ${error}`;

  const { recipes = [] } = data;

  // Nothing cooked recently means nothing to show. A heading over an empty
  // strip reads as a section that failed to load.
  if (!loading && recipes.length === 0) return null;

  // What is still to cook comes first; what is already cooked falls to the end
  // of the shelf rather than sitting in the way of it. Sort is stable, so each
  // group keeps the order the server sent.
  const ordered = [...recipes].sort((a, b) => Number(a.isCooked) - Number(b.isCooked));

  return (
    <View style={{ paddingBottom: Spacing.xl }}>
      {/* This section is the last order, so the way to every order before it
          belongs beside it. The screen's own title row is full: a third link
          there overflows the row and cuts "Bekijk alles" off the edge. */}
      <SectionHeader title="Dit heb je in huis">
        <SectionLink
          title="Eerder gekocht"
          onPress={(e) => {
            e.preventDefault();
            navigation.navigate('PreviouslyOrdered');
          }}
        />
      </SectionHeader>
      <SkeletonContent
        layout={[
          {
            width: 100,
            height: 90,
            marginLeft: 25,
            marginBottom: 11,
          },
          // short line
          { width: 180, height: 25, marginLeft: 25, marginBottom: 24 },
        ]}
        boneColor={Colors.skeletonBone}
        highlightColor={Colors.skeletonHighlight}
        containerStyle={{ paddingLeft: 0 }}
        isLoading={loading && recipes.length === 0}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: Gutter, gap: Spacing.md }}
          removeClippedSubviews
          data={ordered}
          keyExtractor={(recipe) => recipe.id}
          renderItem={({ item: recipe, index }) => {
            return (
              <ImageCard
                onPress={(e) => {
                  e.preventDefault();
                  navigation.navigate('RecipeDetail', {
                    id: recipe.id,
                    recipe,
                  });
                }}
                key={recipe.id}
                style={{ width: 110 }}
                height={110}
                titleLines={1}
                title={recipe.title}
                imageUrl={recipe.imageUrl}
                muted={recipe.isCooked}
              />
            );
          }}
        />
      </SkeletonContent>
    </View>
  );
}

function FilteredRecipeList({ navigation, loading, title, recipes }) {
  const plannedCount = filterByRecipe(recipes, (r) => r.isPlanned).length;

  if (!loading && recipes.length === 0) return null;

  return (
    <View style={{ paddingBottom: Spacing.xl }}>
      <SectionHeader title={title}>
        {plannedCount > 0 && <Badge amount={plannedCount} />}
      </SectionHeader>

      <SkeletonContent
        layout={[
          {
            width: 230,
            height: 148,
            marginLeft: 5,
            marginBottom: 11,
          },
          // short line
          { width: 180, height: 25, marginLeft: 5, marginBottom: 24 },
        ]}
        boneColor={Colors.skeletonBone}
        highlightColor={Colors.skeletonHighlight}
        containerStyle={{ paddingLeft: 15 }}
        isLoading={loading && recipes.length === 0}
      />

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: Gutter, gap: Spacing.md }}
        removeClippedSubviews
        data={recipes}
        keyExtractor={(recipe) => recipe.id}
        renderItem={({ item: recipe, index }) => {
          return (
            <ImageCard
              style={{
                width: CARD_WIDTH,
                animationDuration: `${200}ms`,
                animationPlayState: 'running',
                animationKeyframes: {
                  from: { opacity: 0 },
                  to: { opacity: 1 },
                },
                transitionProperty: ['opacity'],
                transitionDuration: '200ms',
                transitionTimingFunction: 'ease-in',
              }}
              onPress={(e) => {
                e.preventDefault();
                navigation.navigate('RecipeDetail', {
                  id: recipe.id,
                  recipe,
                });
              }}
              key={recipe.id}
              titleLines={1}
              title={recipe.title}
              imageUrl={recipe.imageUrl}
              badges={recipe.warning && <Text>⚠️</Text>}>
              <PlanRecipe id={recipe.id} isPlanned={recipe.isPlanned} />
            </ImageCard>
          );
        }}
      />
    </View>
  );
}

function filterByIngredient(recipes, match) {
  return recipes.filter(
    (recipe) => recipe.ingredients.find((e) => match(e.ingredient)) !== undefined
  );
}

function filterByRecipe(recipes, match) {
  return recipes.filter((recipe) => match(recipe));
}

// The shelves the home screen sorts recipes onto, in order. A shelf with
// nothing on it is dropped rather than rendered as a heading over a gap.
const SHELVES = [
  {
    title: 'Met aardappelen',
    pick: (recipes) => filterByIngredient(recipes, (i) => i.name === 'Aardappelen'),
  },
  {
    title: 'Met rijst',
    pick: (recipes) => filterByIngredient(recipes, (i) => i.name.toLowerCase().includes('rijst')),
  },
  {
    title: 'Met pasta',
    pick: (recipes) =>
      filterByIngredient(
        recipes,
        (i) => i.name.toLowerCase().includes('pasta') || i.name.toLowerCase().includes('noodles')
      ),
  },
  {
    title: 'Met wraps',
    pick: (recipes) => filterByIngredient(recipes, (i) => i.name.toLowerCase().includes('wrap')),
  },
  {
    title: 'Soep',
    pick: (recipes) => filterByRecipe(recipes, (r) => r.title.toLowerCase().includes('soep')),
  },
];

function RecipeList({ navigation }) {
  const { loading, error, data = {} } = useQuery(GET_RECIPES);

  if (error) return `Error! ${error}`;

  const { recipes = [] } = data;
  const shelves = SHELVES.map((shelf) => ({ ...shelf, recipes: shelf.pick(recipes) })).filter(
    (shelf) => loading || shelf.recipes.length > 0
  );

  return (
    <View>
      {shelves.map((shelf, index) => (
        <React.Fragment key={shelf.title}>
          {index > 0 && <Separator />}
          <FilteredRecipeList
            loading={loading}
            navigation={navigation}
            title={shelf.title}
            recipes={shelf.recipes}
          />
        </React.Fragment>
      ))}
    </View>
  );
}

export default function PlanScreen({ navigation }) {
  const scrollRef = React.useRef(null);
  useScrollToTop(scrollRef);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView ref={scrollRef} contentContainerStyle={{ paddingBottom: Layout.tabBarHeight }}>
        <SectionHeader title="Recepten" large>
          <SectionLink
            title="Planner"
            onPress={(e) => {
              e.preventDefault();
              navigation.navigate('WeekPlanner');
            }}
          />
          <SectionLink
            title="Bekijk alles"
            onPress={(e) => {
              e.preventDefault();
              navigation.navigate('RecipeList');
            }}
          />
        </SectionHeader>
        <Separator />
        <View style={{ backgroundColor: Colors.groupedBackground }}>
          <LastRecipesList navigation={navigation} />
        </View>
        <Separator />
        <RecipeList navigation={navigation} />
        <Separator />
      </ScrollView>
    </SafeAreaView>
  );
}
