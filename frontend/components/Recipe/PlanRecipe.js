import * as React from "react";
import gql from "graphql-tag";
import { useMutation } from "@apollo/react-hooks";
import { PlusIcon, CheckIcon } from "../Icon";

const PLAN_RECIPE = gql`
  mutation PlanRecipe($recipeId: ID!) {
    planRecipe(recipeId: $recipeId) {
      id
      isPlanned
    }
  }
`;
const UNPLAN_RECIPE = gql`
  mutation UnplanRecipe($recipeId: ID!) {
    unplanRecipe(recipeId: $recipeId) {
      id
      isPlanned
    }
  }
`;

function optimisticResponse(name, id, isPlanned) {
  return {
    __typename: "Mutation",
    [name]: {
      id: id,
      __typename: "Recipe",
      isPlanned: isPlanned,
    },
  };
}

export function PlanRecipe({ id, isPlanned }) {
  const [planRecipe] = useMutation(PLAN_RECIPE, {
    refetchQueries: ["BasicsList", "OrderList"],
    ignoreResults: true,
  });
  const [unplanRecipe] = useMutation(UNPLAN_RECIPE, {
    refetchQueries: ["BasicsList", "OrderList"],
    ignoreResults: true,
  });

  if (isPlanned) {
    return (
      <CheckIcon
        onPress={(e) => {
          e.preventDefault();
          unplanRecipe({
            variables: { recipeId: id },
            optimisticResponse: optimisticResponse("unplanRecipe", id, false),
          });
        }}
      />
    );
  }

  return (
    <PlusIcon
      onPress={(e) => {
        e.preventDefault();
        planRecipe({
          variables: { recipeId: id },
          optimisticResponse: optimisticResponse("planRecipe", id, true),
        });
      }}
    />
  );
}
