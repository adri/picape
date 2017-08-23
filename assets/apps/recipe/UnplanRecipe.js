import React from 'react';
import { gql, graphql, compose } from 'react-apollo';
import mutateable from '../../lib/mutateable';
import Loading from '../../components/Loading';

function UnplanRecipe({ submit, loading, error, recipeId }) {
  if (error) alert(error);

  return (
    <a key="plan-button" href="#" onClick={event => submit(event, { recipeId })} className={"btn btn-simple " + (loading && "loading")}>
      <i className="check-bar fa fa-check-circle fa-lg fa-fw" />
      <span className="loading-bar"><Loading /></span>
      <span className="btn-text">Unplan</span>
      <style jsx>{`
      .check-bar {
        position:relative;
        left: 0;
        width: 0;
        color: green;
      }

      .btn-text {
        padding-left: 5px;
      }

      .btn {
        color: #636363;
        position: relative;
        transition: width 1s ease-out;
      }

      .btn:hover {
        border-color: green;
        color: green;
      }

      .loading-bar {
        position:relative;
        left: 0;
        width: 0;
        opacity: 0;
        transition: width 0s, opacity 0.5s linear;
      }

      .loading .loading-bar {
        height: auto;
        opacity: 1;
      }

      .loading .check-bar {
        transition: opacity 1s ease-out;
        opacity: 0;
        height: 0;
        overflow: hidden;
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
)(UnplanRecipe);
