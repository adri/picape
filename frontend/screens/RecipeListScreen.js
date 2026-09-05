import { useQuery } from '@apollo/client';
import * as React from 'react';
import { Text, View, FlatList } from 'react-native';
import { useSafeArea } from 'react-native-safe-area-context';

import { ImageCard } from '../components/Card/ImageCard';
import { BackIcon } from '../components/Icon';
import { PlanRecipe } from '../components/Recipe/PlanRecipe';
import { SectionHeader } from '../components/Section/SectionHeader';
import { SectionLink } from '../components/Section/SectionLink';
import SkeletonContent from '../components/Skeleton/SkeletonContent';
import Colors from '../constants/Colors';
import { FloatingTop, Gutter, Spacing } from '../constants/Spacing';
import { GET_RECIPES } from '../operations/getRecipes';

const SKELETON_LAYOUT = Array(6).fill({
  height: 134,
  flexBasis: '50%',
  marginBottom: Spacing.xl,
});

export function RecipeListScreen({ navigation }) {
  const { loading, error, data = {} } = useQuery(GET_RECIPES);
  const { recipes = [] } = data;
  const insets = useSafeArea();

  if (error) return `Error! ${error}`;

  const header = (
    <View>
      <SectionHeader title="">
        <SectionLink
          title="Nieuw Recept"
          onPress={(e) => {
            e.preventDefault();
            navigation.navigate('NewRecipe');
          }}
        />
      </SectionHeader>
      <SectionHeader title="Alle Recepten" large />
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      {/* The grid is the scroller, with the headings as its header. Nesting it
          in a ScrollView made it lay out every recipe at once, because a list
          given unbounded height has no window to virtualise against, which
          quietly turned initialNumToRender and windowSize into no-ops. */}
      <FlatList
        numColumns={2}
        data={recipes}
        keyExtractor={(recipe) => recipe.id}
        initialNumToRender={6}
        windowSize={5}
        removeClippedSubviews
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={header}
        ListEmptyComponent={
          loading && recipes.length === 0 ? (
            <SkeletonContent
              layout={SKELETON_LAYOUT}
              containerStyle={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                paddingHorizontal: Gutter - Spacing.xs,
                gap: Spacing.sm,
              }}
              boneColor={Colors.skeletonBone}
              highlightColor={Colors.skeletonHighlight}
              isLoading
            />
          ) : null
        }
        contentContainerStyle={{
          paddingTop: insets.top,
          paddingBottom: insets.bottom + Spacing.xxl,
        }}
        columnWrapperStyle={{ paddingHorizontal: Gutter - Spacing.xs }}
        renderItem={({ item: recipe }) => (
          <ImageCard
            style={{ flexBasis: '50%', paddingBottom: Spacing.xl }}
            imageStyle={{ width: '100%' }}
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
            <PlanRecipe id={recipe.id} isPlanned={recipe.isPlanned} />
          </ImageCard>
        )}
      />

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
    </View>
  );
}
