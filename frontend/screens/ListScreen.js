import { useMutation, useQuery, useSubscription } from '@apollo/client';
import { useScrollToTop } from '@react-navigation/native';
import * as React from 'react';
import { View, FlatList, Text, Dimensions, Platform, StyleSheet } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Badge } from '../components/Badge/Badge';
import { ImageCard } from '../components/Card/ImageCard';
import { Nutriscore, hasNutriscore } from '../components/Ingredient/Nutriscore';
import { OrderQuantity } from '../components/Ingredient/OrderQuantity';
import { ListItem } from '../components/ListItem/ListItem';
import { SectionHeader } from '../components/Section/SectionHeader';
import SkeletonContent from '../components/Skeleton/SkeletonContent';
import Colors from '../constants/Colors';
import Layout from '../constants/Layout';
import { Gutter, Spacing } from '../constants/Spacing';
import Type from '../constants/Type';
import { SUBSCRIBE_ORDER, GET_ORDER } from '../operations/getOrder';
import { GET_ORDER_COUNT } from '../operations/getOrderCount';
import { GET_RECIPES } from '../operations/getRecipes';
import { START_SHOPPING } from '../operations/startShopping';

const euros = new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' });

function formatEuros(cents) {
  return euros.format(cents / 100);
}

// Intl renders "wo 9 sep." in nl-NL, with a trailing dot the supermarket's own
// app does not show, and its abbreviations come from whichever ICU the browser
// was built against. A fixed table reads the same everywhere.
const weekdays = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'];
const months = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];

function formatDeliverySlot({ deliveryDate, deliveryStartTime, deliveryEndTime }) {
  if (!deliveryDate || !deliveryStartTime || !deliveryEndTime) return null;

  // Split rather than parsed: `new Date('2026-09-09')` is UTC midnight, which
  // is the day before west of Greenwich, and the weekday would be wrong.
  const [year, month, day] = deliveryDate.split('-').map(Number);
  const weekday = weekdays[new Date(year, month - 1, day).getDay()];
  const from = deliveryStartTime.slice(0, 5);
  const until = deliveryEndTime.slice(0, 5);

  return `${weekday} ${day} ${months[month - 1]} ${from} – ${until}`;
}

function PlannedRecipes({ navigation }) {
  const {
    loading,
    error,
    data = {},
  } = useQuery(GET_RECIPES, {
    fetchPolicy: 'cache-only',
  });

  if (error) return `Error! ${error}`;

  const { recipes: allRecipes = [] } = data;
  const recipes = allRecipes.filter((recipe) => recipe.isPlanned);

  if (recipes.length == 0) {
    return null;
  }

  return (
    // The strip and the ingredient list below it are two different things, and
    // without this they touch: the last card's label runs straight into the
    // first row. Same step the plan screen puts under its shelves.
    <View style={{ paddingBottom: Spacing.xl }}>
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
                style={{ width: 110 }}
                height={110}
                titleLines={1}
                title={recipe.title}
                imageUrl={recipe.imageUrl}
              />
            );
          }}
        />
      </SkeletonContent>
    </View>
  );
}

export default function ListScreen({ navigation }) {
  const scrollRef = React.useRef(null);
  useScrollToTop(scrollRef);

  // idea: use the count of order items to know how many skeletons to render
  const { data: countData } = useQuery(GET_ORDER_COUNT, {
    fetchPolicy: 'cache-only',
  });
  const { data: subscription = {} } = useSubscription(SUBSCRIBE_ORDER);
  const {
    loading,
    error,
    data = {},
  } = useQuery(GET_ORDER, {
    fetchPolicy: 'cache-and-network',
  });
  const [startShopping] = useMutation(START_SHOPPING, {
    refetchQueries: ['BasicsList', 'OrderList', 'RecipeList', 'LastOrderedRecipes'],
  });

  if (error) return `Error! ${error}`;

  const { currentOrder: currentOrderQuery = {} } = data;
  const { currentOrder: currentOrderSubscription } = subscription;
  const currentOrder = currentOrderSubscription || currentOrderQuery;
  const deliverySlot = formatDeliverySlot(currentOrder);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView ref={scrollRef} contentContainerStyle={{ paddingBottom: Layout.tabBarHeight }}>
        <SectionHeader title="Je mandje" large>
          <View style={styles.orderTotal}>
            <Text style={[Type.row, { color: Colors.text }]}>
              {currentOrder.totalPrice > 0 ? formatEuros(currentOrder.totalPrice) : ''}
            </Text>
            {currentOrder.totalDiscount > 0 && (
              <Text style={[Type.subtitle, { color: Colors.savingsText }]}>
                {formatEuros(currentOrder.totalDiscount)} bespaard
              </Text>
            )}
          </View>
        </SectionHeader>

        {deliverySlot && (
          <Text style={[Type.subtitle, styles.deliverySlot, { color: Colors.text }]}>
            Bezorging {deliverySlot}
          </Text>
        )}

        <PlannedRecipes navigation={navigation} />

        <SkeletonContent
          layout={Array(countData?.currentOrder?.totalCount || 5).fill({
            width: Dimensions.get('window').width - 40,
            height: 60,
            marginHorizontal: 20,
            marginBottom: 10,
          })}
          boneColor={Colors.skeletonBone}
          highlightColor={Colors.skeletonHighlight}
          containerStyle={{}}
          isLoading={loading && (currentOrder.items || []).length === 0}>
          <FlatList
            style={{ paddingHorizontal: 20, marginBottom: 50 }}
            data={currentOrder.items}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => {
              const ingredient = item.ingredient;
              const plannedRecipes = ingredient?.plannedRecipes || [];
              return (
                <ListItem
                  style={[
                    styles.fadeIn,
                    {
                      animationDuration: `${200 + 100 * index}ms`,
                      backgroundColor: ingredient?.isPlanned
                        ? Colors.cardHighlightBackground
                        : Colors.cardBackground,
                    },
                  ]}
                  title={ingredient?.name || item.name}
                  imageUrl={ingredient?.imageUrl || item.imageUrl}
                  badges={
                    hasNutriscore(ingredient?.nutriscore) ? (
                      <Nutriscore nutriscore={ingredient.nutriscore} />
                    ) : null
                  }
                  onImagePress={(e) => {
                    e.preventDefault();
                    if (ingredient) {
                      navigation.navigate('IngredientDetail', { ingredientId: ingredient.id });
                    } else {
                      navigation.navigate('AddIngredient', { ingredient: item });
                    }
                  }}
                  subtitle={plannedRecipes
                    .map((planned) => `${planned.quantity}×\u00A0${planned.recipe.title}`)
                    .join(', ')}>
                  <OrderQuantity
                    id={ingredient?.id}
                    orderedQuantity={ingredient?.orderedQuantity || item.quantity}
                  />
                </ListItem>
              );
            }}
          />
        </SkeletonContent>
        {currentOrder.items && (
          <Text
            style={[
              Type.sectionLink,
              {
                color: Colors.secondaryText,
                fontSize: 14,
                marginBottom: 100,
                alignSelf: 'center',
              },
            ]}
            onPress={(e) => {
              e.preventDefault();
              startShopping({});
            }}>
            Bestelling ontvangen
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Room for both lines whether or not the order has arrived and whether or not
  // the bonus took anything off, so the heading keeps one height and the basket
  // below it never jumps once the total loads.
  // Its own line rather than a third item beside the title: the heading's right
  // side already stacks the total and the savings, and the slot is a fact about
  // the whole order rather than about its money.
  deliverySlot: {
    marginHorizontal: Gutter,
    marginBottom: Spacing.md,
  },
  orderTotal: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minHeight: Type.row.lineHeight + Type.subtitle.lineHeight,
  },
  fadeIn: {
    ...Platform.select({
      web: {
        animationPlayState: 'running',
        animationKeyframes: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        transitionProperty: ['background-color', 'opacity'],
        transitionDuration: '200ms',
        transitionTimingFunction: 'ease-in',
      },
    }),
  },
});
