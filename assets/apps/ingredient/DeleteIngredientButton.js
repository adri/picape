import React from 'react';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';
import Loading from '../../components/Loading';
import Router from 'next/router';
import mutateable from '../../lib/mutateable';

function DeleteIngredientButton({ingredientId, submit, loading, error}) {
  if (loading) return <Loading />;
  if (error) alert(error);

  const remove = event => {
    submit(event, {ingredientId})
      .then(() => Router.back())
  };

  return (
    <a onClick={remove}>delete</a>
  );
}

const DeleteIngredient = gql`
    mutation DeleteIngredientButton($ingredientId: ID!) {
        deleteIngredient(ingredientId: $ingredientId) {
            id
        }
    }
`;

export default compose(
  graphql(DeleteIngredient, { options: ({ingredientId}) => ({
    variables: {ingredientId},
    refetchQueries: ['IngredientList'],
  })}),
  mutateable(),
)(DeleteIngredientButton);
