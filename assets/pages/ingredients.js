import Layout from '../components/layout';
import IngredientList from '../components/IngredientList';

import withData from '../lib/withData';

export default withData(({ data }) =>
  <Layout title="Ingredients">
    <div className="container">
      <IngredientList />
    </div>
  </Layout>
);
