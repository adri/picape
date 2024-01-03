import { gql } from "@apollo/client";

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
        nutriscore
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
