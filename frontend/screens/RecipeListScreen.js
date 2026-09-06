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

const CELL_STYLE = { width: '50%', paddingHorizontal: Spacing.xs, paddingBottom: Spacing.xl };
const CELL_IMAGE_STYLE = { width: '100%' };

// One card, behind a memo boundary. The list renders itself three times while
// the stack animates this screen in: once for the first window, again once it
// has measured itself, and again as the window grows. Without the boundary
// every card already on screen re-rendered on each of those passes, and that
// work lands on the same thread that is drawing the slide.
//
// The boundary only holds while the props stay equal, so the styles are module
// constants and the press handler is bound to the recipe rather than rebuilt
// by the list on every pass.
const RecipeCell = React.memo(function RecipeCell({ recipe, navigation }) {
  const openRecipe = React.useCallback(
    (e) => {
      e.preventDefault();
      navigation.navigate('RecipeDetail', { id: recipe.id, recipe });
    },
    [navigation, recipe]
  );

  return (
    <ImageCard
      style={CELL_STYLE}
      imageStyle={CELL_IMAGE_STYLE}
      title={recipe.title}
      imageUrl={recipe.imageUrl}
      badges={recipe.warning && <Text>⚠️</Text>}
      onPress={openRecipe}>
      <PlanRecipe id={recipe.id} isPlanned={recipe.isPlanned} />
    </ImageCard>
  );
});

export function RecipeListScreen({ navigation }) {
  const { loading, error, data = {} } = useQuery(GET_RECIPES);
  const { recipes = [] } = data;
  const insets = useSafeArea();
  const renderItem = React.useCallback(
    ({ item: recipe }) => <RecipeCell recipe={recipe} navigation={navigation} />,
    [navigation]
  );

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
      {/* Each cell takes exactly half the row and pads itself, rather than
          flexing to fill it. A flexed item is alone on the last row whenever
          the count is odd, and it then stretches to full width. */}
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
        renderItem={renderItem}
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
