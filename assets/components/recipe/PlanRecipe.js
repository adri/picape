import React from 'react';
import { gql, graphql, compose } from 'react-apollo';
import mutateable from '../../lib/mutateable';
import Loading from '../Loading';

function PlanRecipe({ recipeId, submit, error, loading }) {
  if (error) alert(error);

  return (
    <a href="#" onClick={event => submit(event, { recipeId })} className="btn">
      {loading && <Loading />}
      Plan
    </a>
  );
}

const query = gql`
  mutation planRecipe($recipeId: ID!) {
    planRecipe(recipeId: $recipeId) {
      id
      isPlanned
      ingredients {
        id
        isEssential
        isPlanned
      }
    }
  }
`;

export default compose(
  graphql(query, {
    options: {
      refetchQueries: ['RecipeList', 'OrderList', 'EssentialList'],
    },
  }),
  mutateable(),
)(PlanRecipe);
