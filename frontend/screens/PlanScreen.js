import * as React from 'react';
import { Text, View, FlatList } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useQuery } from '@apollo/react-hooks';
import Colors from '../constants/Colors';
import { ImageCard } from '../components/Card/ImageCard';
import { SectionHeader } from '../components/Section/SectionHeader';
import SkeletonContent from 'react-native-skeleton-content';
import { SafeAreaView } from 'react-native-safe-area-context';
import Type from '../constants/Type';
import { PlanRecipe } from '../components/Recipe/PlanRecipe';
import { GET_RECIPES } from '../operations/getRecipes';
import { GET_LAST_RECIPES } from '../operations/getLastRecipes';
import { Separator } from '../components/Section/Separator';
import { Badge } from '../components/Badge/Badge';

function LastRecipesList({ navigation }) {
  const { loading, error, data = {} } = useQuery(GET_LAST_RECIPES);

  if (error) return `Error! ${error}`;

  const { recipes = [] } = data;
  return (
    <View>
      <SectionHeader title="Dit heb je in huis" />
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
        isLoading={loading}>
        <FlatList
          style={{ paddingHorizontal: 20, height: 150 }}
          containerStyle={{ paddingLeft: 20 }}
          horizontal={true}
          removeClippedSubviews
          data={recipes}
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
                width={100}
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
  return (
    <View>
      <SectionHeader title={title}>{plannedCount && <Badge amount={plannedCount} />}</SectionHeader>

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
        isLoading={loading}
      />

      <FlatList
        style={{ paddingHorizontal: 20 }}
        horizontal={true}
        removeClippedSubviews
        data={recipes}
        keyExtractor={(recipe) => recipe.id}
        renderItem={({ item: recipe, index }) => {
          return (
            <ImageCard
              style={{
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
              title={recipe.title}
              imageUrl={recipe.imageUrl}>
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

function RecipeList({ navigation }) {
  const { loading, error, data = {} } = useQuery(GET_RECIPES);

  if (error) return `Error! ${error}`;

  const { recipes = [] } = data;

  return (
    <View>
      <FilteredRecipeList
        loading={loading}
        navigation={navigation}
        title="Met aardappelen"
        recipes={filterByIngredient(recipes, (i) => i.name == 'Aardappelen')}
      />
      <Separator />
      <FilteredRecipeList
        loading={loading}
        navigation={navigation}
        title="Met rijst"
        recipes={filterByIngredient(recipes, (i) => i.name.toLowerCase().includes('rijst'))}
      />
      <Separator />
      <FilteredRecipeList
        loading={loading}
        navigation={navigation}
        title="Met pasta"
        recipes={filterByIngredient(
          recipes,
          (i) => i.name.toLowerCase().includes('pasta') || i.name.toLowerCase().includes('noodles')
        )}
      />
      <Separator />
      <FilteredRecipeList
        loading={loading}
        navigation={navigation}
        title="Met wraps"
        recipes={filterByIngredient(recipes, (i) => i.name.toLowerCase().includes('wrap'))}
      />
      <Separator />
      <FilteredRecipeList
        loading={loading}
        navigation={navigation}
        title="Soep"
        recipes={filterByRecipe(recipes, (r) => r.title.toLowerCase().includes('soep'))}
      />
    </View>
  );
}

export default function PlanScreen({ navigation }) {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={{ paddingBottom: 50 }}>
        <SectionHeader title={'Recepten'}>
          <Text
            onPress={(e) => {
              e.preventDefault();
              navigation.navigate('WeekPlanner');
            }}
            style={[
              Type.sectionLink,
              {
                color: Colors.secondaryText,
                fontSize: 14,
                paddingBottom: 2,
              },
            ]}>
            Planner
          </Text>
          <Text
            onPress={(e) => {
              e.preventDefault();
              navigation.navigate('RecipeList');
            }}
            style={[
              Type.sectionLink,
              {
                color: Colors.secondaryText,
                fontSize: 14,
                paddingBottom: 2,
              },
            ]}>
            Bekijk alles
          </Text>
        </SectionHeader>
        <Separator />
        <View style={{ backgroundColor: Colors.skeletonBone }}>
          <LastRecipesList navigation={navigation} />
        </View>
        <Separator />
        <RecipeList navigation={navigation} />
        <Separator />
      </ScrollView>
    </SafeAreaView>
  );
}
