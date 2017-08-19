import { gql, graphql } from 'react-apollo';
import ErrorMessage from './ErrorMessage';
import Recipe from './recipe/Recipe';
import Loading from './Loading';

function RecipeList({ data: { loading, error, recipes }, showEdit}) {
  if (error) return <ErrorMessage message="Error loading." />;
  if (loading) return <Loading />;

  return (
    <div>
      <h5 className="text-white">Recipes</h5>
      <div className="card">
        <div className="row no-gutters">
          {recipes &&
            recipes.map(recipe =>
              <div key={recipe.id} className="col-sm-4">
                <Recipe recipe={recipe} showEdit={showEdit} />
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

const recipesQuery = gql`
  query RecipeList {
    recipes {
      id
      title
      isPlanned
    }
  }
`;

export default graphql(recipesQuery)(RecipeList);
