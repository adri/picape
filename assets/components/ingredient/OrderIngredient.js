import React from 'react';
import { gql, graphql, compose} from 'react-apollo';
import mutateable from '../../lib/mutateable';
import Loading from '../Loading';

function OrderIngredient({ id, quantity, submit, loading, error}) {
  if (error) alert(error);

  return (
    <div>
      {loading && <Loading />}
      <a href="#" onClick={event => submit(event, {ingredientId: id, quantity: quantity + 1})}>+</a>
      {quantity}
      <a href="#" onClick={event => submit(event, {ingredientId: id, quantity: Math.max(0, quantity - 1)})}>-</a>
    </div>
  );
}

const query = gql`
  mutation orderIngredient($ingredientId: ID!, $quantity: Int!) {
    orderIngredient(ingredientId: $ingredientId, quantity: $quantity) {
      id
    }
  }
`;

export default compose(
  graphql(query, {
    options: {
      refetchQueries: [
        'OrderList',
        'EssentialList',
      ],
    }
  }),
  mutateable()
)(OrderIngredient);
