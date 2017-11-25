import Layout from "../components/Layout";
import EditIngredient from "../apps/ingredient/EditIngredient";
import withData from "../lib/withData";

export default withData(({ data, url: { query: { id } } }) => (
  <Layout title="Edit ingredient">
    <EditIngredient ingredientId={id} />
  </Layout>
));
