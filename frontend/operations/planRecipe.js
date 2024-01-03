import { gql } from "@apollo/client";

export const PLAN_RECIPE = gql`
  mutation PlanRecipe($recipeId: ID!) {
    planRecipe(recipeId: $recipeId) {
      id
      isPlanned
    }
  }
`;
export const UNPLAN_RECIPE = gql`
  mutation UnplanRecipe($recipeId: ID!) {
    unplanRecipe(recipeId: $recipeId) {
      id
      isPlanned
    }
  }
`;

export function optimisticResponse(name, id, isPlanned) {
  return {
    __typename: "Mutation",
    [name]: {
      id: id,
      __typename: "Recipe",
      isPlanned: isPlanned,
    },
  };
}
