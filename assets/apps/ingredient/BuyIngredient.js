import React from "react";
import { graphql, compose } from "react-apollo";
import gql from "graphql-tag";
import mutateable from "../../lib/mutateable";

function BuyIngredient({ id, submit, loading, error, isBought }) {
  if (error) alert(error);

  return (
    <div
      className="custom-control custom-checkbox checkbox"
      onClick={event => submit(event, { ingredientId: id, undo: isBought })}
    >
      <input className="form-check-input" type="checkbox" checked={isBought && "checked"} readOnly={true} />
      <label />
    </div>
  );
}

const query = gql`
  mutation buyIngredient($ingredientId: ID!, $undo: Boolean!) {
    buyIngredient(ingredientId: $ingredientId, undo: $undo) {
      id
      isBought
    }
  }
`;

export default compose(
  graphql(query, {
    options: {},
  }),
  mutateable(),
)(BuyIngredient);
