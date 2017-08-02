import { gql, graphql } from 'react-apollo';
import ErrorMessage from './ErrorMessage';
import SyncOrder from './SyncOrder';
import Ingredient from './Ingredient';
import Money from './Money';

function OrderList({ data: { loading, error, currentOrder }}) {
  if (error) return <ErrorMessage message="Error loading." />;
  if (loading) return <div>Loading</div>;

  return (
    <div>
      <div className="d-flex justify-content-end">
        <h5 className="mr-auto">Order</h5>
        <div className="mt-1 mr-2">
          <Money price={currentOrder.totalPrice} />
        </div>
        <div className="mt-1">
          <SyncOrder />
        </div>
      </div>
      <div className="card">
        <div className="no-gutters">
          {currentOrder &&
            currentOrder.items.map(ingredient =>
              <div key={ingredient.id}>
                <Ingredient {...ingredient} />
              </div>
            )}
        </div>
      </div>
      <style jsx>{``}</style>
    </div>
  );
}

const orderQuery = gql`
  query OrderList {
    currentOrder {
      id
      totalCount
      totalPrice
      items {
          id
          name
          imageUrl
       }
    }
  }
`;

export default graphql(orderQuery, {
  options: {
    variables: {},
  },
  props: ({ data }) => ({
    data,
  }),
})(OrderList);
