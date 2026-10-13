import { gql } from '@apollo/client';

export const GET_PREVIOUS_ORDERS = gql`
  query PreviousOrders {
    orders: previousOrders {
      id
      number
      closedAt
      totalCount
      items {
        id
        name
        quantity
        imageUrl
        ingredient {
          id
        }
      }
    }
  }
`;
