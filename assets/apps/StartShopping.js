import React from "react";
import { graphql, compose } from "react-apollo";
import gql from "graphql-tag";
import mutateable from "../lib/mutateable";

function StartShopping({ submit, loading }) {
  return (
    <a href="#" onClick={e => submit(e, { refresh: true })} className="btn btn-primary">
      Start Shopping
    </a>
  );
}

const mutation = gql`
  mutation StartShopping {
    startShopping {
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
)(StartShopping);
