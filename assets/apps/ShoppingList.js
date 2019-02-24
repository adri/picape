import { graphql } from "react-apollo";
import gql from "graphql-tag";
import ErrorMessage from "../components/ErrorMessage";
import Ingredient from "../components/Ingredient";
import Loading from "../components/Loading";

function groupByTag(items) {
  return items.reduce((grouped, item) => {
    let tag = { id: "other", name: "Other" };

    if (item.ingredient.tags.length > 0) {
      tag = item.ingredient.tags[0];
    }

    if (!(tag.id in grouped)) {
      grouped[tag.id] = {
        tag: tag,
        ingredients: [],
      };
    }
    grouped[tag.id].ingredients.push(item.ingredient);

    return grouped;
  }, {});
}

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
            Object.values(groupByTag(lastOrder.items)).map(group => {
              return (
                <div key={group.tag.id}>
                  <div className="tag">{group.tag.name}</div>
                  {group.ingredients.map(ingredient => (
                    <Ingredient {...ingredient} showOrder={false} showBuy={true} key={ingredient.id} />
                  ))}
                </div>
              );
            })}
        </div>
      </div>
      <style jsx>{`
        .tag {
          color: #797979;
          text-transform: uppercase;
          padding: 10px;
        }
      `}</style>
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
