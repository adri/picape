import React from 'react';
import { gql, graphql, compose } from 'react-apollo';
import mutateable from '../../lib/mutateable';
import Loading from '../Loading';

function OrderIngredient({ id, quantity, submit, loading, error }) {
  if (error) alert(error);

  if (loading) return <Loading />;

  return (
    <div className="quantity-selector">
      <div className="btn-group-sm btn-group-vertical">
        <a
          href="#"
          className="btn btn-sm btn-xs"
          onClick={event => submit(event, { ingredientId: id, quantity: quantity + 1 })}
        >
          +
        </a>
        <div className="btn btn-sm btn-xs">
          {quantity}
        </div>
        <a
          href="#"
          className="btn btn-sm btn-xs"
          onClick={event => submit(event, { ingredientId: id, quantity: Math.max(0, quantity - 1) })}
        >
          -
        </a>
      </div>
      <style jsx>{`
       .quantity-selector {
          max-width: 10px;
       }

       .btn-xs {
          font-size: 80%;
          padding 0 5px;
          margin: 0;
       }
      `}</style>
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
      refetchQueries: ['OrderList', 'EssentialList'],
    },
  }),
  mutateable(),
)(OrderIngredient);
