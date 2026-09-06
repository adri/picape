import { useQuery } from '@apollo/client';
import * as React from 'react';
import { Text, View, FlatList, useWindowDimensions } from 'react-native';
import { useSafeArea } from 'react-native-safe-area-context';

import RecipeDetailScreen from './RecipeDetailScreen';
import { ImageCard } from '../components/Card/ImageCard';
import { BackIcon } from '../components/Icon';
import { SplitView, useSelection } from '../components/Layout/SplitView';
import { PlanRecipe } from '../components/Recipe/PlanRecipe';
import { SectionHeader } from '../components/Section/SectionHeader';
import { SectionLink } from '../components/Section/SectionLink';
import SkeletonContent from '../components/Skeleton/SkeletonContent';
import Colors from '../constants/Colors';
import { DETAIL_PANE_WIDTH, gridColumns } from '../constants/Layout';
import { FloatingTop, Gutter, Spacing } from '../constants/Spacing';
import { GET_RECIPES } from '../operations/getRecipes';

const CELL_IMAGE_STYLE = { width: '100%' };

// One card, behind a memo boundary. The list renders itself three times while
// the stack animates this screen in: once for the first window, again once it
// has measured itself, and again as the window grows. Without the boundary
// every card already on screen re-rendered on each of those passes, and that
// work lands on the same thread that is drawing the slide.
//
// The boundary only holds while the props stay equal, so the cell style is
// memoised on the column count rather than rebuilt per card, and the press
// handler is bound to the recipe rather than rebuilt by the list on every pass.
const RecipeCell = React.memo(function RecipeCell({ recipe, open, selected, cellStyle }) {
  const openRecipe = React.useCallback(
    (e) => {
      e.preventDefault();
      open({ id: recipe.id, recipe });
    },
    [open, recipe]
  );

  return (
    <ImageCard
      style={cellStyle}
      imageStyle={CELL_IMAGE_STYLE}
      title={recipe.title}
      imageUrl={recipe.imageUrl}
      selected={selected}
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
  const { wide, selected, open, clear } = useSelection('RecipeDetail');
  // The grid fits its columns to the room the pane leaves it, not to the
  // display: four columns behind a recipe is four slivers.
  const columns = gridColumns(useWindowDimensions().width - (wide ? DETAIL_PANE_WIDTH : 0));
  const cellStyle = React.useMemo(
    () => ({
      width: `${100 / columns}%`,
      paddingHorizontal: Spacing.xs,
      paddingBottom: Spacing.xl,
    }),
    [columns]
  );
  const skeletonLayout = React.useMemo(
    () =>
      Array(3 * columns).fill({
        height: 134,
        flexBasis: `${100 / columns}%`,
        marginBottom: Spacing.xl,
      }),
    [columns]
  );
  const renderItem = React.useCallback(
    ({ item: recipe }) => (
      <RecipeCell
        recipe={recipe}
        open={open}
        selected={wide ? selected?.id === recipe.id : undefined}
        cellStyle={cellStyle}
      />
    ),
    [open, wide, selected, cellStyle]
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

  const grid = (
    <View style={{ flex: 1 }}>
      {/* The grid is the scroller, with the headings as its header. Nesting it
          in a ScrollView made it lay out every recipe at once, because a list
          given unbounded height has no window to virtualise against, which
          quietly turned initialNumToRender and windowSize into no-ops. */}
      {/* Each cell takes exactly its share of the row and pads itself, rather
          than flexing to fill it. A flexed item is alone on the last row
          whenever the count does not divide, and it then stretches to full
          width. */}
      {/* FlatList cannot change numColumns in place, so the key remounts it
          when a rotation changes how many cards fit. */}
      <FlatList
        key={columns}
        // Every seeded recipe has a card on the home screen too, and
        // detachPreviousScreen keeps that screen mounted underneath this one,
        // so a screen test has no way to name a card in this grid without it.
        testID="recipe-grid"
        numColumns={columns}
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
              layout={skeletonLayout}
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

  if (!wide) return grid;

  return (
    <SplitView
      list={grid}
      placeholder="Kies een recept"
      onDismiss={clear}
      detail={
        selected && (
          // Keyed on the recipe, so picking another one starts its steps
          // unticked rather than carrying the last recipe's ticks over.
          <RecipeDetailScreen
            key={selected.id}
            navigation={navigation}
            route={{ params: selected }}
          />
        )
      }
    />
  );
}
