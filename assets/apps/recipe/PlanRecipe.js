import React from 'react';
import { gql, graphql, compose } from 'react-apollo';
import mutateable from '../../lib/mutateable';
import Loading from '../../components/Loading';

function PlanRecipe({ recipeId, submit, error, loading }) {
  if (error) alert(error);

  return (
    <a key="plan-button" href="#" onClick={event => submit(event, { recipeId })} className="btn">
      {loading && <Loading />}
      <span className="btn-text">Plan</span>
      <style jsx>{`
      .btn {
         transition: width 1s ease-out;
      }

      .btn-text {
        padding-left: 5px;
      }
      `}</style>
    </a>
  );
}

const query = gql`
  mutation planRecipe($recipeId: ID!) {
    planRecipe(recipeId: $recipeId) {
      id
      isPlanned
      ingredients {
        quantity 
        ingredient {
          id
          isEssential
          isPlanned
        }
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
