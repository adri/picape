import Layout from '../components/Layout';
import IngredientList from '../apps/IngredientList';
import withData from '../lib/withData';

export default withData(({ data }) =>
  <Layout title="Ingredients">
    <IngredientList />
  </Layout>
);
