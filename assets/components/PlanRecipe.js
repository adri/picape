import React from 'react';
import { gql, graphql } from 'react-apollo';

function PlanRecipe({ plan, recipeId }) {
   const onClick = () => {
       plan(recipeId).catch(err => alert(err))
   };

  return (
    <a href="#" onClick={onClick} className="btn ">
      Plan
    </a>
  );
}

const planRecipeQuery = gql`
  mutation planRecipe($recipeId: ID!) {
    planRecipe(recipeId: $recipeId) {
      id
      totalCount
      totalPrice
      items {
        id
        imageUrl
        name
      }  
    }
  }
`;

export default graphql(planRecipeQuery, {
  options: {
    refetchQueries: [
      'OrderList',
      'EssentialsList',
    ],
  },
  props: ({ ownProps, mutate }) => ({
    plan: (recipeId) =>
      mutate({
        variables: {recipeId},
      }),
  }),
})(PlanRecipe);
