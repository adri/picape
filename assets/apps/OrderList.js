import { gql, graphql } from 'react-apollo';
import ErrorMessage from '../components/ErrorMessage';
import SyncOrder from './SyncOrder';
import Ingredient from '../components/Ingredient';
import Money from '../components/Money';
import Loading from '../components/Loading';

function OrderList({ data: { loading, error, currentOrder } }) {
  if (error) return <ErrorMessage message="Error loading." />;
  if (loading) return <Loading />;

  return (
    <div>
      <div className="d-flex justify-content-end">
        <h5 className="mr-auto text-white">Order</h5>
        <div className="mt-1 mr-2 text-white">
          <Money price={currentOrder.totalPrice} />
        </div>
        <div className="mt-1">
          <SyncOrder />
        </div>
      </div>
      <div className="card">
        <div className="no-gutters">
          {currentOrder &&
            currentOrder.items.map(item => {
              const ingredient = item.ingredient ? item.ingredient : item;
              return (
                <div key={item.id}>
                  <Ingredient {...ingredient} />
                </div>
              );
            }
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
        ingredient {
          id
          name
          imageUrl
          unitQuantity
          orderedQuantity
        }  
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
