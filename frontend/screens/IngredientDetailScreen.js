import { useQuery, gql } from '@apollo/client';
import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Badge } from '../components/Badge/Badge';
import { BackIcon, EditIcon } from '../components/Icon';
import { Nutriscore } from '../components/Ingredient/Nutriscore';
import { SectionHeader } from '../components/Section/SectionHeader';
import { Separator } from '../components/Section/Separator';
import { useTheme } from '../constants/Colors';
import { Gutter, Radius, Spacing } from '../constants/Spacing';
import Type from '../constants/Type';

const GET_INGREDIENT_DETAIL = gql`
  query IngredientDetail($ingredientId: ID!) {
    node(id: $ingredientId) {
      ... on Ingredient {
        id
        name
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
      <View style={[styles.topBar, { paddingTop: insets.top + Spacing.sm }]}>
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

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xxl }}>
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
              <Badge amount={ingredient.bonusMechanism} backgroundColor={colors.savingsText} />
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

        {!!ingredient.nutriscore && (
          <>
            <Separator />
            <View style={[styles.block, styles.nutriscore]}>
              <Text style={[Type.row, { color: colors.text }]}>Nutri-Score</Text>
              <Nutriscore nutriscore={ingredient.nutriscore} />
            </View>
          </>
        )}

        {(!!ingredient.supermarketDescription || highlights.length > 0) && (
          <>
            <Separator />
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
  block: {
    marginHorizontal: Gutter,
    marginBottom: Spacing.lg,
    gap: Spacing.xs,
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
