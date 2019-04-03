import Layout from "../components/Layout";
import StartShopping from "../apps/StartShopping";
import StopShopping from "../apps/StopShopping";
import ShoppingList from "../apps/ShoppingList";
import withData from "../lib/withData";

export default withData(({ data, url: { query: { id } } }) => (
  <Layout title="Shopping list">
    <StartShopping />
    <hr />
    <ShoppingList />
    <hr />
    <StopShopping />
  </Layout>
));
