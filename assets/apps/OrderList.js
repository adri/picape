import { graphql } from "react-apollo";
import gql from "graphql-tag";
import ErrorMessage from "../components/ErrorMessage";
import SyncOrder from "./SyncOrder";
import Ingredient from "../components/Ingredient";
import Money from "../components/Money";
import Loading from "../components/Loading";

function OrderList({ data: { loading, error, currentOrder }, id }) {
  if (error) return <ErrorMessage message="Error loading." />;
  if (loading) return <Loading />;

  return (
    <div>
      <div className="d-flex justify-content-end">
        <h5 className="mr-auto text-white">
          <a id={id}>Nu op lijst</a>
        </h5>
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
                  <Ingredient {...ingredient} alwaysShowOrder={true} />
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

const orderQuery = gql`
  query OrderList($inShoppingList: Boolean!) {
    currentOrder {
      id
      totalCount
      totalPrice
      items {
        id
        imageUrl
        name
        ingredient {
          ...ingredient
        }
      }
    }
  }
  ${Ingredient.fragments.ingredient}
`;

export default graphql(orderQuery, {
  options: { variables: { inShoppingList: false } }
})(OrderList);
