import { useQuery, gql } from '@apollo/client';
import { Image } from 'expo-image';
import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge } from '../components/Badge/Badge';
import { BackIcon, EditIcon } from '../components/Icon';
import { Nutriscore, hasNutriscore } from '../components/Ingredient/Nutriscore';
import { SectionHeader } from '../components/Section/SectionHeader';
import { Separator } from '../components/Section/Separator';
import { useTheme } from '../constants/Colors';
import { contentColumn } from '../constants/Layout';
import { Gutter, Radius, Spacing } from '../constants/Spacing';
import Type from '../constants/Type';

const GET_INGREDIENT_DETAIL = gql`
  query IngredientDetail($ingredientId: ID!) {
    node(id: $ingredientId) {
      ... on Ingredient {
        id
        name
        largeImageUrl
        supermarketName
        unitQuantity
        nutriscore
        price
        priceBeforeBonus
        unitPriceDescription
        minBestBeforeDays
        bonusMechanism
        supermarketDescription
        supermarketHighlights
        warning {
          description
        }
      }
    }
  }
`;

const euros = new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' });

// The picture arrives over the network, so it fades in over its tile the way a
// recipe card's does rather than snapping into place.
const FADE_IN = { duration: 260, effect: 'cross-dissolve', timing: 'ease-out' };

// Enough of the screen to read the packet by, and little enough that the price
// is still on the first screenful.
const PHOTO_HEIGHT = 200;

function formatEuros(cents) {
  return euros.format(cents / 100);
}

// "500 g" and "normale prijs per kg €5.18" are one line on the supermarket's own
// page, and either half can be missing.
function unitLine({ unitQuantity, unitPriceDescription }) {
  return [unitQuantity, unitPriceDescription].filter(Boolean).join(' - ');
}

export function IngredientDetailScreen({
  navigation,
  route: {
    params: { ingredientId },
  },
}) {
  const insets = useSafeAreaInsets();
  const colors = useTheme();
  const { data: { node: ingredient } = {}, loading } = useQuery(GET_INGREDIENT_DETAIL, {
    variables: { ingredientId },
  });

  if (loading || !ingredient) return null;

  const unit = unitLine(ingredient);
  const highlights = ingredient.supermarketHighlights || [];

  return (
    <View style={{ flex: 1 }}>
      {/* Outside the scroller: the way back stays put however far the
          description runs. */}
      <View style={[styles.topBar, contentColumn, { paddingTop: insets.top + Spacing.sm }]}>
        <BackIcon
          onPress={(e) => {
            e.preventDefault();
            navigation.goBack();
          }}
        />
        {/* The edit screen is the only way to the ingredient's own name, its
            "altijd in huis" switch and the product behind it, so this screen
            has to carry the door to it. */}
        <EditIcon
          onPress={(e) => {
            e.preventDefault();
            navigation.navigate('EditIngredient', { ingredientId });
          }}
        />
      </View>

      <ScrollView
        contentContainerStyle={[contentColumn, { paddingBottom: insets.bottom + Spacing.xxl }]}>
        {!!ingredient.largeImageUrl && (
          <View style={styles.photo}>
            <Image
              source={{ uri: ingredient.largeImageUrl }}
              contentFit="contain"
              transition={FADE_IN}
              style={styles.photoImage}
            />
          </View>
        )}

        <SectionHeader title={ingredient.name} large />

        <View style={styles.block}>
          <View style={styles.priceRow}>
            {ingredient.price != null && (
              <Text style={[Type.largeTitle, { color: colors.text }]}>
                {formatEuros(ingredient.price)}
              </Text>
            )}
            {ingredient.priceBeforeBonus != null && (
              <Text style={[Type.row, styles.wasPrice, { color: colors.secondaryText }]}>
                {formatEuros(ingredient.priceBeforeBonus)}
              </Text>
            )}
            {!!ingredient.bonusMechanism && (
              <Badge
                amount={ingredient.bonusMechanism}
                backgroundColor={colors.promotionBackground}
              />
            )}
          </View>

          {!!ingredient.supermarketName && (
            <Text style={[Type.row, { color: colors.text }]}>{ingredient.supermarketName}</Text>
          )}
          {!!unit && <Text style={[Type.subtitle, { color: colors.secondaryText }]}>{unit}</Text>}
        </View>

        {!!ingredient.warning && (
          <View
            style={[styles.block, styles.card, { backgroundColor: colors.cardBackground }]}
            testID="warning">
            <Text style={[Type.row, { color: colors.text }]}>
              ⚠️ {ingredient.warning.description}
            </Text>
          </View>
        )}

        {ingredient.minBestBeforeDays != null && (
          <View style={[styles.block, styles.card, { backgroundColor: colors.cardBackground }]}>
            <Text style={[Type.row, { color: colors.text }]}>
              Na bezorging minimaal {ingredient.minBestBeforeDays} dagen houdbaar
            </Text>
          </View>
        )}

        {hasNutriscore(ingredient.nutriscore) && (
          <>
            <Separator style={styles.divider} />
            <View style={[styles.block, styles.nutriscore]}>
              <Text style={[Type.row, { color: colors.text }]}>Nutri-Score</Text>
              <Nutriscore nutriscore={ingredient.nutriscore} />
            </View>
          </>
        )}

        {(!!ingredient.supermarketDescription || highlights.length > 0) && (
          <>
            <Separator style={styles.divider} />
            <View style={styles.block}>
              {!!ingredient.supermarketDescription && (
                <Text style={[Type.body, { color: colors.text }]}>
                  {ingredient.supermarketDescription}
                </Text>
              )}
              {highlights.map((highlight) => (
                <View key={highlight} style={styles.highlight}>
                  <Text style={[Type.body, { color: colors.secondaryText }]}>•</Text>
                  <Text style={[Type.body, { color: colors.text, flex: 1 }]}>{highlight}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Gutter,
    paddingBottom: Spacing.sm,
  },
  // Product shots are cut-outs on white, so the tile behind one is white in both
  // themes. In dark mode that is the point: on a dark tile the packet's own
  // white edges read as a cut-out pasted onto the page. In light mode the tile
  // matches the page and the photo simply sits on it. The picture is contained
  // rather than cropped: half a packet is not a picture of the packet.
  photo: {
    height: PHOTO_HEIGHT,
    marginHorizontal: Gutter,
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: '#ffffff',
    borderRadius: Radius.md,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  block: {
    marginHorizontal: Gutter,
    marginBottom: Spacing.lg,
    gap: Spacing.xs,
  },
  // The block above a rule ends on a step of the scale, and without the same
  // step below it the next section starts on the line.
  divider: {
    marginBottom: Spacing.lg,
  },
  card: {
    padding: Spacing.md,
    borderRadius: Radius.md,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  wasPrice: {
    textDecorationLine: 'line-through',
  },
  nutriscore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  highlight: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
});
