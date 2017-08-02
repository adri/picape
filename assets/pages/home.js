import Layout from '../components/layout';
import RecipeList from '../components/RecipeList';
import EssentialList from '../components/EssentialList';
import OrderList from '../components/OrderList';
import withData from '../lib/withData';

export default withData(({ data }) =>
  <Layout title="Picape">
    <div className="row">
      <div className="col-md-10 offset-md-1">
        <div className="row">
          <div className="col-md-9 border border-right-0">
            <RecipeList />
            <hr />
            <EssentialList />
          </div>
          <div className="col-md-3 order-column">
            <OrderList />
          </div>
        </div>
      </div>
    </div>
  </Layout>,
);
