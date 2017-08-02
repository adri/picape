import React from 'react';
import { gql, graphql } from 'react-apollo';

function UnplanRecipe({ plan, recipeId }) {
   const onClick = () => {
       plan(recipeId).catch(err => alert(err))
   };

  return (
    <a href="#" onClick={onClick} className="btn ">
      Unplan
    </a>
  );
}

const query = gql`
  mutation unplanRecipe($recipeId: ID!) {
    unplanRecipe(recipeId: $recipeId) {
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

export default graphql(query, {
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
})(UnplanRecipe);
