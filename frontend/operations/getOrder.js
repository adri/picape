import gql from "graphql-tag";

export const orderFields = gql`
  fragment OrderFields on Order {
    id
    totalCount
    totalPrice
    items {
      id
      name
      quantity
      imageUrl
      ingredient {
        id
        name
        imageUrl
        isPlanned(inShoppingList: false)
        orderedQuantity
        plannedRecipes(inShoppingList: false) {
          quantity
          recipe {
            id
            title
          }
        }
      }
    }
  }
`;
export const GET_ORDER = gql`
  query OrderList {
    currentOrder {
      ...OrderFields
    }
  }
  ${orderFields}
`;

export const SUBSCRIBE_ORDER = gql`
  subscription OrderList {
    currentOrder: orderChanged {
      ...OrderFields
    }
  }
  ${orderFields}
`;
