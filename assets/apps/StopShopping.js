import React from "react";
import { graphql, compose } from "react-apollo";
import gql from "graphql-tag";
import mutateable from "../lib/mutateable";

function StopShopping({ submit, loading }) {
  return (
    <a href="#" onClick={e => submit(e, { refresh: true })} className="btn btn-primary">
      Stop Shopping
    </a>
  );
}

const mutation = gql`
  mutation StopShopping {
    stopShopping {
      id
    }
  }
`;

export default compose(
  graphql(mutation, {
    options: {
      refetchQueries: ["ShoppingList", "OrderList", "RecipeList"],
    },
  }),
  mutateable(),
)(StopShopping);
