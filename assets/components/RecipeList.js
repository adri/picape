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
        <div className="row no-gutters">
          {recipes &&
            recipes.map(recipe =>
              <div key={recipe.id} className="col-sm-4 recipe">
                <Recipe recipe={recipe} />
              </div>
            )}
        </div>
      </div>
      <style jsx>{`
      .recipe {
        box-shadow: inset 0 0 25px #eff1f1, inset 0 0 0 1px rgba(0, 0, 0, .1);
        padding-top: 10px;
        padding-bottom: 10px;
      }
      `}</style>
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
