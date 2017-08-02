import { gql, graphql } from 'react-apollo';
import ErrorMessage from './ErrorMessage';
import PlanRecipe from './recipe/PlanRecipe';
import UnplanRecipe from './recipe/UnplanRecipe';

function RecipeList({ data: { loading, error, recipes } }) {
  if (error) return <ErrorMessage message="Error loading." />;
  if (loading) return <div>Loading</div>;

  return (
    <div>
      <h5>Recipes</h5>
      <div className="card">
        <ul className="list-group list-group-flush">
          {recipes &&
            recipes.map(recipe =>
              <li key={recipe.id} className="list-group-item">
                <div className="media w-100">
                  <div className="d-flex mr-3">
                    <img src="" className="rounded" alt="" />
                  </div>
                  <div className="media-body mb-2">
                    <div className="ingredient-name mt-0 mb-0">
                      <h5>
                        {recipe.title}
                      </h5>
                    </div>
                    <div>Description</div>
                  </div>
                  <div className="d-flex mr-3 align-self-center">
                    {recipe.isPlanned ?
                      <UnplanRecipe recipeId={recipe.id} /> :
                      <PlanRecipe recipeId={recipe.id} />}
                  </div>
                </div>
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
