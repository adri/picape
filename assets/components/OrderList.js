import { gql, graphql } from 'react-apollo';
import ErrorMessage from './ErrorMessage';
import Ingredient from './Ingredient';
import Money from './Money';

function OrderList({ data: { loading, error, currentOrder }, loadMorePosts }) {
  if (error) return <ErrorMessage message="Error loading." />;
  if (loading) return <div>Loading</div>;

  return (
    <div>
      <h5>Order</h5>
      <Money price={currentOrder.totalPrice} />
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
