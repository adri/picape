import { gql } from '@apollo/client';
export const START_SHOPPING = gql`
  mutation StartShopping {
    startShopping {
      id
    }
  }
`;
