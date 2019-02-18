import Layout from "../components/Layout";
import StartShopping from "../apps/StartShopping";
import ShoppingList from "../apps/ShoppingList";
import withData from "../lib/withData";

export default withData(({ data, url: { query: { id } } }) => (
  <Layout title="Shopping list">
    <StartShopping />
    <hr />
    <ShoppingList />
  </Layout>
));
