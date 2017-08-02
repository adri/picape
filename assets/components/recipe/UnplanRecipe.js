import React from 'react';
import { gql, graphql, compose} from 'react-apollo';
import mutateable from '../../lib/mutateable';

function UnplanRecipe({ submit, loading, error, recipeId }) {
  if (error) alert(error);
  if (loading) return <div>Loading</div>;

  return (
    <a href="#" onClick={(event) => submit(event, {recipeId})} className="btn">
      Unplan
    </a>
  );
}

const query = gql`
  mutation unplanRecipe($recipeId: ID!) {
    unplanRecipe(recipeId: $recipeId) {
      id
    }
  }
`;

export default compose(
  graphql(query, {
    options: {
      refetchQueries: [
        'RecipeList',
        'OrderList',
        'EssentialList',
      ],
    }
  }),
  mutateable()
)(UnplanRecipe);
