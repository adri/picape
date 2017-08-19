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
      <div className="card-group no-gutters">
        {recipes &&
          recipes.map((recipe, index)=>
            <Recipe key={recipe.id} recipe={recipe} showEdit={showEdit} />
          )}
      </div>
    </div>
  );
}

const recipesQuery = gql`
  query RecipeList {
    recipes {
      id
      title
      imageUrl
      isPlanned
    }
  }
`;

export default graphql(recipesQuery)(RecipeList);
