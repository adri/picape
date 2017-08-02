import React from 'react';
import { gql, graphql, compose} from 'react-apollo';
import mutateable from '../../lib/mutateable';

function PlanRecipe({ recipeId, submit, error, loading }) {
  if (error) alert(error);
  if (loading) return <div>Loading</div>;

  return (
    <a href="#" onClick={event => submit(event, {recipeId})} className="btn ">
      Plan
    </a>
  );
}

const query = gql`
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
)(PlanRecipe);
