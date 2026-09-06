import { useMutation, useQuery } from '@apollo/client';
import * as React from 'react';
import { View, FlatList, Dimensions, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge } from '../components/Badge/Badge';
import { BackIcon, CheckIcon, PlusIcon } from '../components/Icon';
import { ListItem } from '../components/ListItem/ListItem';
import { SectionHeader } from '../components/Section/SectionHeader';
import SkeletonContent from '../components/Skeleton/SkeletonContent';
import Colors from '../constants/Colors';
import { CONTENT_MAX_WIDTH, contentColumn, contentInset } from '../constants/Layout';
import { FloatingTop, Gutter, Spacing } from '../constants/Spacing';
import { ACTIVATE_BONUS_OFFER, GET_BONUS } from '../operations/getBonus';

const SKELETON_LAYOUT = Array(8).fill({
  width: Math.min(Dimensions.get('window').width, CONTENT_MAX_WIDTH) - 2 * Gutter,
  height: 60,
  marginHorizontal: Gutter,
  marginBottom: Spacing.sm,
});

// The rows carry the gutter themselves, the way the heading above them does, so
// the list can stay flush and its scroll bar sits at the edge of the screen.
const ROW_MARGIN = { marginHorizontal: Gutter };

// An offer is worth activating because of what it covers, so what Picape knows
// behind it comes before the shelf the supermarket filed it under.
function subtitleFor(offer) {
  if (offer.ingredients.length > 0) {
    return offer.ingredients.map((ingredient) => ingredient.name).join(', ');
  }

  return `${offer.category} · ${offer.productCount} producten`;
}

// Activating is one way: the offer is spent on the loyalty account and there is
// no mutation to take it back. So an activated offer shows the state and not a
// control, and once the week's activations are gone the rest show nothing to
// press rather than a button that would be refused.
function Activate({ offer, hasRoom }) {
  const [activateBonusOffer] = useMutation(ACTIVATE_BONUS_OFFER, {
    refetchQueries: ['BonusOffers'],
  });

  if (offer.isActivated) {
    return <CheckIcon accessibilityLabel="Geactiveerd" />;
  }

  if (!hasRoom) {
    return null;
  }

  return (
    <PlusIcon
      accessibilityLabel={`Activeer ${offer.title}`}
      onPress={(e) => {
        e.preventDefault();
        activateBonusOffer({ variables: { offerId: offer.id } });
      }}
    />
  );
}

export function BonusScreen({ navigation }) {
  const { loading, error, data = {} } = useQuery(GET_BONUS);
  const insets = useSafeAreaInsets();
  const columnInset = contentInset(useWindowDimensions().width);

  if (error) return `Error! ${error}`;

  const { bonus = {} } = data;
  const { offers = [], activatedCount = 0, maximumActivations = 0 } = bonus;
  const hasRoom = activatedCount < maximumActivations;

  const header = (
    <View>
      {/* An empty row under the notch, so the floating back button has
          somewhere to sit that is not on top of the title. */}
      <SectionHeader title="" />
      <SectionHeader title="Persoonlijke bonus" large>
        {offers.length > 0 && <Badge amount={`${activatedCount}/${maximumActivations}`} />}
      </SectionHeader>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={offers}
        keyExtractor={(offer) => offer.id}
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
        renderItem={({ item: offer }) => (
          <ListItem
            style={[
              ROW_MARGIN,
              {
                // The same highlight a planned ingredient gets, for the same
                // reason: this is the row on the screen that concerns you.
                backgroundColor:
                  offer.ingredients.length > 0
                    ? Colors.cardHighlightBackground
                    : Colors.cardBackground,
              },
            ]}
            title={offer.title}
            imageUrl={offer.imageUrl}
            badges={
              !!offer.discount && (
                <Badge
                  small
                  style={{ paddingHorizontal: Spacing.sm }}
                  amount={offer.discount}
                  backgroundColor={Colors.promotionBackground}
                />
              )
            }
            subtitle={subtitleFor(offer)}>
            <Activate offer={offer} hasRoom={hasRoom} />
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
