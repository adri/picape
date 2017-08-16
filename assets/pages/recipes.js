import Layout from '../components/layout';
import RecipeList from '../components/RecipeList';
import AddRecipe from '../components/recipe/AddRecipe';
import withData from '../lib/withData';

export default withData(({ data }) =>
  <Layout title="Recipes">
    <AddRecipe />
    <hr />
    <RecipeList showEdit={true} />
  </Layout>
);
