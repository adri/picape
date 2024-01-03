import { gql } from "@apollo/client";
export const START_SHOPPING = gql`
  mutation StartShopping {
    StartShopping {
      id
    }
  }
`;