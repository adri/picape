import { graphql, compose } from "react-apollo";
import gql from "graphql-tag";
import ErrorMessage from "../components/ErrorMessage";
import Ingredient from "../components/Ingredient";
import Loading from "../components/Loading";
import AddIngredient from "./ingredient/AddIngredient";

function IngredientList({ data: { loading, error, ingredients } }) {
  if (error) return <ErrorMessage message="Error loading." />;
  if (loading) return <Loading />;

  return (
    <div>
      <h4 className="text-white">New</h4>
      <div>
        <p className="text-white">Select an ingredient to add from Supermarket.</p>
        <div className="form-group">
          <AddIngredient />
        </div>
      </div>

      <hr />

      <h5 className="text-white">Ingredients</h5>
      <div
        className="card"
        style={{
          transform: "translateZ(0)",
        }}
      >
        <div className="row no-gutters">
          {ingredients.edges &&
            ingredients.edges.map(ingredient => (
              <div key={ingredient.node.id} className="col-sm-3">
                <Ingredient {...ingredient.node} showEdit={true} />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

const query = gql`
  query IngredientList {
    ingredients(first: 1000, order: [{ field: NAME, direction: ASC }]) {
      edges {
        node {
          id
          name
          imageUrl
          isPlanned
          unitQuantity
          orderedQuantity
          season {
            label
          }
        }
      }
    }
  }
`;

export default compose(graphql(query, { options: { variables: { query: "" } } }))(IngredientList);
