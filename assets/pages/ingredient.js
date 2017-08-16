import Layout from '../components/layout';
import EditIngredient from '../components/ingredient/EditIngredient'
import withData from '../lib/withData';

export default withData(({ data, url: { query: { id } } }) =>
  <Layout title="Edit ingredient">
      <EditIngredient ingredientId={id} />
  </Layout>
);
