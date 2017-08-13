import Layout from '../components/layout';
import RecipeList from '../components/RecipeList';
import withData from '../lib/withData';

export default withData(({ data }) =>
  <Layout title="Recipes">
    <RecipeList />
  </Layout>
);
