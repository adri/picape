import { useQuery } from '@apollo/client';
import * as React from 'react';
import { View, SectionList, Dimensions, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ErrorState } from '../components/ErrorState';
import { BackIcon } from '../components/Icon';
import { ListItem } from '../components/ListItem/ListItem';
import { SectionHeader } from '../components/Section/SectionHeader';
import SkeletonContent from '../components/Skeleton/SkeletonContent';
import Colors from '../constants/Colors';
import { CONTENT_MAX_WIDTH, contentColumn, contentInset } from '../constants/Layout';
import { FloatingTop, Gutter, Spacing } from '../constants/Spacing';
import { GET_PREVIOUS_ORDERS } from '../operations/getPreviousOrders';

const SKELETON_LAYOUT = Array(8).fill({
  width: Math.min(Dimensions.get('window').width, CONTENT_MAX_WIDTH) - 2 * Gutter,
  height: 60,
  marginHorizontal: Gutter,
  marginBottom: Spacing.sm,
});

const ROW_MARGIN = { marginHorizontal: Gutter };

function orderTitle(order) {
  const date = order.closedAt
    ? new Date(order.closedAt).toLocaleDateString('nl-NL', {
        day: 'numeric',
        month: 'long',
      })
    : null;
  return date ? `Bestelling ${order.number} · ${date}` : `Bestelling ${order.number}`;
}

export function OrdersScreen({ navigation }) {
  const { loading, error, data = {} } = useQuery(GET_PREVIOUS_ORDERS);
  const insets = useSafeAreaInsets();
  const columnInset = contentInset(useWindowDimensions().width);

  if (error) return <ErrorState error={error} />;

  const { orders = [] } = data;
  const sections = orders.map((order) => ({
    title: orderTitle(order),
    data: order.items || [],
  }));

  return (
    <View style={{ flex: 1 }}>
      <SectionList
        testID="previous-orders"
        sections={sections}
        keyExtractor={(item) => `${item.id}`}
        initialNumToRender={12}
        windowSize={6}
        removeClippedSubviews
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={
          <View>
            {/* An empty row under the notch, so the floating back button has
                somewhere to sit that is not on top of the title. */}
            <SectionHeader title="" />
            <SectionHeader title="Bestellingen" large />
          </View>
        }
        renderSectionHeader={({ section }) => <SectionHeader title={section.title} />}
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
            paddingBottom: insets.bottom + Spacing.xxl,
          },
        ]}
        renderItem={({ item }) => (
          <ListItem
            style={ROW_MARGIN}
            title={item.name}
            imageUrl={item.imageUrl}
            subtitle={`${item.quantity}×`}
          />
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
