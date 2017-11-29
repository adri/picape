import React from "react";
import { graphql, compose } from "react-apollo";
import gql from "graphql-tag";
import mutateable from "../lib/mutateable";
import Ingredient from "../components/Ingredient";

function SyncOrder({ submit, loading }) {
  return (
    <a href="#" onClick={e => submit(e, { refresh: true })} className="text-white">
      <i className={"fa fa-refresh fa-lg fa-fw " + (loading && "fa-spin")} />
    </a>
  );
}

const mutation = gql`
  mutation SyncOrder($refresh: Boolean) {
    syncOrder(refresh: $refresh) {
      id
      totalCount
      totalPrice
      items {
        id
        imageUrl
        name
        ingredient {
          ... ingredient
        }
      }
    }
  }
  ${Ingredient.fragments.ingredient}  
`;

export default compose(
  graphql(mutation, {
    options: {
      refetchQueries: ["RecipeList"],
    },
  }),
  mutateable(),
)(SyncOrder);
