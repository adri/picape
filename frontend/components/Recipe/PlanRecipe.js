import { useApolloClient } from '@apollo/client';
import * as React from 'react';

import { PLAN_RECIPE, UNPLAN_RECIPE, optimisticResponse } from '../../operations/planRecipe';
import { PlusIcon, CheckIcon } from '../Icon';

export const PlanRecipe = React.memo(function ({ id, isPlanned }) {
  // client.mutate rather than useMutation: nothing here reads the mutation's
  // result state, and useMutation warns when it is told to ignore it.
  const client = useApolloClient();

  if (isPlanned) {
    return (
      <CheckIcon
        onPress={(e) => {
          e.preventDefault();
          client.mutate({
            mutation: UNPLAN_RECIPE,
            variables: { recipeId: id },
            optimisticResponse: optimisticResponse('unplanRecipe', id, false),
          });
        }}
      />
    );
  }

  return (
    <PlusIcon
      onPress={(e) => {
        e.preventDefault();
        client.mutate({
          mutation: PLAN_RECIPE,
          variables: { recipeId: id },
          optimisticResponse: optimisticResponse('planRecipe', id, true),
        });
      }}
    />
  );
});
