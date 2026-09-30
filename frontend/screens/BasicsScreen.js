import { useQuery, useSubscription, gql } from '@apollo/client';
import { useScrollToTop } from '@react-navigation/native';
import * as React from 'react';
import { View, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IngredientDetailScreen } from './IngredientDetailScreen';
import { ErrorState } from '../components/ErrorState';
import { OrderQuantity } from '../components/Ingredient/OrderQuantity';
import { SplitView, useSelection } from '../components/Layout/SplitView';
import { ListItem } from '../components/ListItem/ListItem';
import { SectionHeader } from '../components/Section/SectionHeader';
import { SectionLink } from '../components/Section/SectionLink';
import SkeletonContent from '../components/Skeleton/SkeletonContent';
import Colors from '../constants/Colors';
import { CONTENT_MAX_WIDTH, contentColumn, useBottomBarInset } from '../constants/Layout';

const GET_BASICS = gql`
  query BasicsList {
    basics: ingredients(
      first: 1000
      filter: { essential: true }
      order: [{ field: NAME, direction: ASC }]
    ) {
      edges {
        ingredient: node {
          id
          name
          imageUrl
          isPlanned
          orderedQuantity
          plannedRecipes {
            quantity
            recipe {
              id
              title
            }
          }
        }
      }
    }
  }
`;

const SUBSCRIBE_UNPLANNED_RECIPES = gql`
  subscription RecipeUnplanned {
    recipeUnplanned {
      ingredients {
        ingredient {
          id
          isPlanned
          orderedQuantity
          plannedRecipes {
            quantity
          }
        }
      }
    }
  }
`;

const SUBSCRIBE_PLANNED_RECIPES = gql`
  subscription RecipePlanned {
    recipePlanned {
      ingredients {
        ingredient {
          id
          isPlanned
          orderedQuantity
          plannedRecipes {
            quantity
          }
        }
      }
    }
  }
`;

function BasicsList({ navigation, open, selectedId, inPane }) {
  const { loading, error, data = {} } = useQuery(GET_BASICS);
  useSubscription(SUBSCRIBE_PLANNED_RECIPES);
  useSubscription(SUBSCRIBE_UNPLANNED_RECIPES);

  if (error) return <ErrorState error={error} />;

  const { basics: { edges = [] } = {} } = data;
  return (
    <View>
      {/* What you always keep in, what you bought before, and which offers the
          supermarket picked out for you are the same question asked three
          times: what is it that you buy every week. So the ways to the other
          two sit beside the first rather than on a screen about recipes or on
          the basket, which is about this order and not about the week. */}
      <SectionHeader title="Altijd in huis" large>
        <SectionLink
          title="Bonus"
          onPress={(e) => {
            e.preventDefault();
            navigation.navigate('Bonus');
          }}
        />
        <SectionLink
          title="Eerder gekocht"
          onPress={(e) => {
            e.preventDefault();
            navigation.navigate('PreviouslyOrdered');
          }}
        />
      </SectionHeader>
      <SkeletonContent
        layout={Array(5).fill({
          width: Math.min(Dimensions.get('window').width, CONTENT_MAX_WIDTH) - 40,
          height: 60,
          marginHorizontal: 20,
          marginBottom: 10,
        })}
        boneColor={Colors.skeletonBone}
        highlightColor={Colors.skeletonHighlight}
        containerStyle={{ flex: 1 }}
        isLoading={loading && edges.length === 0}>
        {/* The list is short enough that rows mount at once — it always did,
            since a FlatList inside the screen's ScrollView rendered every row
            and warned about the wasted windowing. Mapping keeps that shape
            without the warning. */}
        {edges.map(({ ingredient }) => {
          const plannedRecipes = ingredient.plannedRecipes || [];
          return (
            <ListItem
              key={ingredient.id}
              style={{
                // No entrance animation. `animationKeyframes` in an inline
                // style is dropped by react-native-web's compiler, which only
                // emits an @keyframes rule from StyleSheet.create, so these
                // rows carried the cart's `200 + 100 * index` duration
                // against `animation-name: none` and never faded at all.
                // The state transition below is the part that worked.
                transitionProperty: ['background-color', 'opacity'],
                transitionDuration: '200ms',
                transitionTimingFunction: 'ease-in',
                marginHorizontal: 20,
                backgroundColor: ingredient.isPlanned
                  ? Colors.cardHighlightBackground
                  : Colors.cardBackground,
              }}
              title={ingredient.name}
              imageUrl={ingredient.imageUrl}
              selected={inPane ? selectedId === ingredient.id : undefined}
              onImagePress={(e) => {
                e.preventDefault();
                open({ ingredientId: ingredient.id });
              }}
              subtitle={plannedRecipes
                .map((planned) => `${planned.quantity}×\u00A0${planned.recipe.title}`)
                .join(', ')}>
              <OrderQuantity
                id={ingredient.id}
                orderedQuantity={ingredient.orderedQuantity}
                isPlanned={ingredient.isPlanned}
              />
            </ListItem>
          );
        })}
      </SkeletonContent>
    </View>
  );
}

export default function PlanScreen({ navigation }) {
  const scrollRef = React.useRef(null);
  useScrollToTop(scrollRef);
  const { wide, selected, open, clear } = useSelection('IngredientDetail');
  const bottomInset = useBottomBarInset();

  const list = (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[contentColumn, { paddingBottom: bottomInset }]}>
        <BasicsList
          navigation={navigation}
          open={open}
          selectedId={selected?.ingredientId}
          inPane={wide}
        />
      </ScrollView>
    </SafeAreaView>
  );

  if (!wide) return list;

  return (
    <SplitView
      list={list}
      placeholder="Kies een ingrediënt"
      onDismiss={clear}
      detail={
        selected && (
          <IngredientDetailScreen
            key={selected.ingredientId}
            navigation={navigation}
            route={{ params: selected }}
          />
        )
      }
    />
  );
}
