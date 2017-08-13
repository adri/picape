import { gql, graphql } from 'react-apollo';
import ErrorMessage from './ErrorMessage';
import Recipe from './recipe/Recipe';


function RecipeList({ data: { loading, error, recipes } }) {
  if (error) return <ErrorMessage message="Error loading." />;
  if (loading) return <div>Loading</div>;

  return (
    <div>
      <h5 className="text-white">Recipes</h5>
      <div className="card">
        <ul className="list-group list-group-flush">
          {recipes &&
            recipes.map(recipe =>
              <li key={recipe.id} className="list-group-item">
                <Recipe recipe={recipe} />
              </li>
            )}
        </ul>
      </div>
      <style jsx>{``}</style>
    </div>
  );
}

// ingredients {
//         ingredient {
//           id
//           name
//           imageUrl
//         }
//         quantity
//       }
const recipesQuery = gql`
  query RecipeList {
    recipes {
      id
      title
      isPlanned
    }
  }
`;

export default graphql(recipesQuery, {
  options: {
    variables: {},
  },
  props: ({ data }) => ({
    data,
  }),
})(RecipeList);
