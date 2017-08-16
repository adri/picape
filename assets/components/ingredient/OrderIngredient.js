import React from 'react';
import { gql, graphql, compose } from 'react-apollo';
import mutateable from '../../lib/mutateable';
import Loading from '../Loading';

function OrderIngredient({ id, quantity, submit, loading, error, hovered }) {
  if (error) alert(error);

  if (loading) return <Loading />;

  return (
    <div className="quantity-selector">
      {hovered &&
        <a href="#"
           className="add-btn btn btn-sm btn-xs"
           onClick={event => submit(event, { ingredientId: id, quantity: quantity + 1 })}
        ><i className="now-ui-icons ui-1_simple-add mr-2" /></a>
      }

      <div className={"btn-xs" + (quantity ? " btn" : " disabled")}>
        {quantity || hovered && quantity}
      </div>

      {hovered &&
        <a href="#"
           className="subtract-btn btn btn-sm btn-xs"
           onClick={event => submit(event, {ingredientId: id, quantity: Math.max(0, quantity - 1)})}
        ><i className="now-ui-icons ui-1_simple-delete mr-2" /></a>
      }
      <style jsx>{`
       .quantity-selector {
          position: relative;
          max-width: 10px;
       }

       .add-btn, .subtract-btn {
          position: absolute;
          left: -25px;
          z-index: 8;
          width: 20px;
       }

       .add-btn {
         top: -7px;
       }

       .subtract-btn {
         top: 18px;
       }

       .disabled {
         opacity: 0.3;
       }

       .btn-xs {
          font-size: 80%;
          padding: 5px;
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
