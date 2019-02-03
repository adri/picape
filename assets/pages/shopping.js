import Layout from "../components/Layout";
import ShoppingList from "../apps/ShoppingList";
import withData from "../lib/withData";

export default withData(({ data, url: { query: { id } } }) => (
  <Layout title="Shopping list">
    <ShoppingList  />
  </Layout>
));
