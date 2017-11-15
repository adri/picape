import React from 'react';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';
import mutateable from '../../lib/mutateable';
import Loading from '../../components/Loading';

function UnplanRecipe({ submit, loading, error, recipeId }) {
  if (error) alert(error);

  return (
    <a key="plan-button" href="#" onClick={event => submit(event, { recipeId })} className="btn btn-simple">
      {loading && <Loading dark />}
      <span className="btn-text">Unplan</span>
      <style jsx>{`
      .btn-simple {
        color: #636363;
        position: relative;
        transition: width 1s ease-out;
        background-color: white;
      }

      .btn-simple:hover {
        border-color: green;
        color: green;
        background-color: white;
      }
      `}</style>
    </a>
  );
}

const query = gql`
  mutation unplanRecipe($recipeId: ID!) {
    unplanRecipe(recipeId: $recipeId) {
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
)(UnplanRecipe);
