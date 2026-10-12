import { gql } from '@apollo/client';

export const SET_MODE = gql`
  mutation setMode($mode: String!) {
    setMode(mode: $mode) {
      id
      mode
    }
  }
`;
