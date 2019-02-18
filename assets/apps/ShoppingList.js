import { graphql } from "react-apollo";
import gql from "graphql-tag";
import ErrorMessage from "../components/ErrorMessage";
import Ingredient from "../components/Ingredient";
import Loading from "../components/Loading";

function ShoppingList({ data: { loading, error, lastOrder } }) {
  if (error) return <ErrorMessage message="Error loading." />;
  if (loading) return <Loading />;

  return (
    <div>
      <div className="d-flex justify-content-end">
        <h5 className="mr-auto text-white">Shopping list</h5>
      </div>
      <div className="card">
        <div className="no-gutters">
          {lastOrder &&
            lastOrder.items.map(item => {
              const ingredient = item.ingredient ? item.ingredient : item;
              return (
                <div key={item.id}>
                  <Ingredient {...ingredient} showOrder={false} showBuy={true} />
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

const shoppingQuery = gql`
  query ShoppingList($inShoppingList: Boolean!) {
    lastOrder {
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

export default graphql(shoppingQuery, { options: { variables: { inShoppingList: true } } })(ShoppingList);
