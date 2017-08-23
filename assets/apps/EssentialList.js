import { gql, graphql } from 'react-apollo';
import ErrorMessage from '../components/ErrorMessage';
import Ingredient from '../components/Ingredient';
import Loading from '../components/Loading';

function EssentialList({ data: { loading, error, essentials } }) {
  if (error) return <ErrorMessage message="Error loading." />;
  if (loading) return <Loading />;

  return (
    <div>
      <h5 className="text-white">Essentials</h5>
      <div className="card">
        <div className="row no-gutters">
          {essentials &&
            essentials.map(ingredient =>
              <div key={ingredient.id} className="col-sm-3">
                <Ingredient {...ingredient} />
              </div>,
            )}
        </div>
      </div>
    </div>
  );
}

const recipesQuery = gql`
  query EssentialList {
    essentials {
      id
      name
      imageUrl
      isPlanned
      unitQuantity
      orderedQuantity
      plannedRecipes {
          quantity
          recipe {
              id
              title
          }
      }
    }
  }
`;

// The `graphql` wrapper executes a GraphQL query and makes the results
// available on the `data` prop of the wrapped component (PostList)
export default graphql(recipesQuery, {
  options: {
    variables: {},
  },
  props: ({ data }) => ({
    data,
  }),
})(EssentialList);
