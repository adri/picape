import Layout from "../components/Layout";
import RecipeList from "../apps/RecipeList";
import EssentialList from "../apps/EssentialList";
import OrderList from "../apps/OrderList";
import withData from "../lib/withData";

export default withData(({ data }) => (
  <Layout title="Picape">
    <div className="row">
      <div className="col-md-9 border border-right-0">
        <RecipeList showEdit={true} />
        <EssentialList />
      </div>
      <div className="col-md-3 order-column">
        <OrderList />
      </div>
    </div>
  </Layout>
));
