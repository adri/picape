import { useQuery, useSubscription, gql } from '@apollo/client';
import { useScrollToTop } from '@react-navigation/native';
import * as React from 'react';
import { View, FlatList, Dimensions } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IngredientDetailScreen } from './IngredientDetailScreen';
import { OrderQuantity } from '../components/Ingredient/OrderQuantity';
import { SplitView, useSelection } from '../components/Layout/SplitView';
import { ListItem } from '../components/ListItem/ListItem';
import { SectionHeader } from '../components/Section/SectionHeader';
import { SectionLink } from '../components/Section/SectionLink';
import SkeletonContent from '../components/Skeleton/SkeletonContent';
import Colors from '../constants/Colors';
import Layout, { CONTENT_MAX_WIDTH, contentColumn } from '../constants/Layout';

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
          season {
            label
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

  if (error) return `Error! ${error}`;

  const { basics: { edges = [] } = {} } = data;
  return (
    <View>
      {/* What you always keep in and what you have bought before are the same
          question asked twice, so the way to the second sits beside the first
          rather than on a screen about recipes. */}
      <SectionHeader title="Altijd in huis" large>
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
        <FlatList
          style={{ paddingHorizontal: 20 }}
          data={edges}
          windowSize={6}
          removeClippedSubviews
          keyExtractor={({ ingredient }) => ingredient.id}
          renderItem={({ item: { ingredient } }) => {
            const plannedRecipes = ingredient.plannedRecipes || [];
            return (
              <ListItem
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
          }}
        />
      </SkeletonContent>
    </View>
  );
}

export default function PlanScreen({ navigation }) {
  const scrollRef = React.useRef(null);
  useScrollToTop(scrollRef);
  const { wide, selected, open, clear } = useSelection('IngredientDetail');

  const list = (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[contentColumn, { paddingBottom: Layout.tabBarHeight }]}>
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
