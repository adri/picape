import { gql, graphql } from 'react-apollo';
import ErrorMessage from './ErrorMessage';
import Ingredient from './Ingredient';

function EssentialList({ data: { loading, error, essentials } }) {
  if (error) return <ErrorMessage message="Error loading." />;
  if (loading) return <div>Loading</div>;

  return (
    <div>
      <h5>Essentials</h5>
      <div className="card">
        <div className="row no-gutters ingredients-wrapper">
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
