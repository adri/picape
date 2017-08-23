import Layout from '../components/Layout';
import RecipeList from '../apps/RecipeList';
import AddRecipe from '../apps/recipe/AddRecipe';
import withData from '../lib/withData';

export default withData(({ data }) =>
  <Layout title="Recipes">
    <AddRecipe />
    <hr />
    <RecipeList showEdit={true} />
  </Layout>
);
