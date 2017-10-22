import { gql, graphql, compose } from 'react-apollo';
import ErrorMessage from '../components/ErrorMessage';
import Ingredient from '../components/Ingredient';
import Loading from '../components/Loading';
import AddIngredient from './ingredient/AddIngredient';

function IngredientList({ data: { loading, error, ingredients }} ) {
  if (error) return <ErrorMessage message="Error loading." />;
  if (loading) return <Loading />;

  return (
    <div>
      <h4 className="text-white">New</h4>
      <div className="text-white">
        <p>Select an ingredient to add from Supermarket.</p>
        <div className="form-group">
          <AddIngredient />
        </div>
      </div>

      <hr />

      <h5 className="text-white">Ingredients</h5>
      <div className="card">
        <div className="row no-gutters">
          {ingredients.edges &&
            ingredients.edges.map(ingredient =>
              <div key={ingredient.node.id} className="col-sm-3">
                <Ingredient {...ingredient.node} showEdit={true} />
              </div>,
            )}
        </div>
      </div>
    </div>
  );
}

const query = gql`
  query IngredientList {
    ingredients(first: 1000) {
      edges {
        node {
          id
          name
          imageUrl
          isPlanned
          unitQuantity
          orderedQuantity
        }
      }
    }
  }
`;


export default compose(
  graphql(query, { options: { variables: { query: '' } } }),
)(IngredientList);

