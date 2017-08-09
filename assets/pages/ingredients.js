import Layout from '../components/layout';
import IngredientList from '../components/IngredientList';
import withData from '../lib/withData';

export default withData(({ data }) =>
  <Layout title="Ingredients">
    <div className="row">
      <div className="col-md-10 offset-md-1">
        <div className="row">
          <div className="col-md-9 border border-right-0">
            <IngredientList />
          </div>
        </div>
      </div>
    </div>
  </Layout>,
);
