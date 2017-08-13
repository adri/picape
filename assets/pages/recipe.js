import Layout from '../components/layout';
import EditRecipe from '../components/recipe/EditRecipe'
import withData from '../lib/withData';

export default withData(({ data, url: { query: { id } } }) =>
  <Layout title="Edit recipe">
      <EditRecipe recipeId={id} />
  </Layout>
);
