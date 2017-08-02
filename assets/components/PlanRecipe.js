import React from 'react';
import { gql, graphql } from 'react-apollo';

function PlanRecipe({ plan, recipe, recipeId, dinnerSlot }) {
  return (
    <a href="#" onClick={() => plan(recipeId, dinnerSlot)} className="btn ">
      Plan
    </a>
  );
}

const planRecipeQuery = gql`
  mutation planRecipe($recipeId: ID!, $dinnerSlot: Int) {
    planRecipe(recipeId: $recipeId, dinnerSlot: $dinnerSlot) {
      id
      __typename
      votes
    }
  }
`;

export default graphql(planRecipeQuery, {
  props: ({ ownProps, mutate }) => ({
    plan: (recipeId, dinnerSlot) =>
      mutate({
        variables: { recipeId, dinnerSlot },
      }),
  }),
})(PlanRecipe);
