import { gql } from "@apollo/client";

export const GET_ORDER_COUNT = gql`
  query OrderListCount {
    currentOrder {
      id
      totalCount
    }
  }
`;

export const SUBSCRIBE_ORDER_COUNT = gql`
  subscription OrderListCount {
    currentOrder: orderChanged {
      totalCount
      items {
        id
        ingredient {
          id
          orderedQuantity
        }
      }
    }
  }
`;
