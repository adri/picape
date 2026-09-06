import { useQuery } from '@apollo/client';
import * as React from 'react';
import { View, FlatList, Dimensions, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackIcon } from '../components/Icon';
import { OrderQuantity } from '../components/Ingredient/OrderQuantity';
import { ListItem } from '../components/ListItem/ListItem';
import { SectionHeader } from '../components/Section/SectionHeader';
import SkeletonContent from '../components/Skeleton/SkeletonContent';
import Colors from '../constants/Colors';
import { CONTENT_MAX_WIDTH, contentColumn, contentInset } from '../constants/Layout';
import { FloatingTop, Gutter, Spacing } from '../constants/Spacing';
import { GET_PREVIOUSLY_ORDERED } from '../operations/getPreviouslyOrdered';

const SKELETON_LAYOUT = Array(8).fill({
  width: Math.min(Dimensions.get('window').width, CONTENT_MAX_WIDTH) - 2 * Gutter,
  height: 60,
  marginHorizontal: Gutter,
  marginBottom: Spacing.sm,
});

// The rows carry the gutter themselves, the way the heading above them does, so
// the list can stay flush and its scroll bar sits at the edge of the screen.
const ROW_MARGIN = { marginHorizontal: Gutter };

export function PreviouslyOrderedScreen({ navigation }) {
  const { loading, error, data = {} } = useQuery(GET_PREVIOUSLY_ORDERED);
  const insets = useSafeAreaInsets();
  const columnInset = contentInset(useWindowDimensions().width);

  if (error) return `Error! ${error}`;

  const { ingredients = [] } = data;

  const header = (
    <View>
      {/* An empty row under the notch, so the floating back button has
          somewhere to sit that is not on top of the title. */}
      <SectionHeader title="" />
      <SectionHeader title="Eerder gekocht" large />
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={ingredients}
        keyExtractor={(ingredient) => ingredient.id}
        initialNumToRender={12}
        windowSize={6}
        removeClippedSubviews
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={header}
        ListEmptyComponent={
          loading ? (
            <SkeletonContent
              layout={SKELETON_LAYOUT}
              boneColor={Colors.skeletonBone}
              highlightColor={Colors.skeletonHighlight}
              isLoading
            />
          ) : null
        }
        contentContainerStyle={[
          contentColumn,
          {
            paddingTop: insets.top,
            // This screen is pushed over the tab bar rather than under it, so
            // the only thing below the last row is the home indicator.
            paddingBottom: insets.bottom + Spacing.xxl,
          },
        ]}
        renderItem={({ item: ingredient }) => (
          <ListItem
            style={[
              ROW_MARGIN,
              {
                backgroundColor: ingredient.isPlanned
                  ? Colors.cardHighlightBackground
                  : Colors.cardBackground,
              },
            ]}
            title={ingredient.name}
            imageUrl={ingredient.imageUrl}
            onImagePress={(e) => {
              e.preventDefault();
              navigation.navigate('IngredientDetail', { ingredientId: ingredient.id });
            }}>
            <OrderQuantity id={ingredient.id} orderedQuantity={ingredient.orderedQuantity} />
          </ListItem>
        )}
      />

      <BackIcon
        style={{
          position: 'absolute',
          top: insets.top + FloatingTop,
          left: insets.left + columnInset + Spacing.md,
        }}
        onPress={(e) => {
          e.preventDefault();
          navigation.goBack();
        }}
      />
    </View>
  );
}
