import { useMutation, gql } from '@apollo/client';
import * as React from 'react';

import { CircleIcon } from '../Icon';

const CHECK_ITEM = gql`
  mutation checkItem($ingredientId: ID!, $checked: Boolean!) {
    checkItem(ingredientId: $ingredientId, checked: $checked) {
      id
      items {
        id
        checked
      }
    }
  }
`;

export function CheckItem({ id, checked }) {
  const [checkItem] = useMutation(CHECK_ITEM);

  return (
    <CircleIcon
      name={checked ? 'checkmark' : 'ellipse-outline'}
      selected={checked}
      accessibilityLabel={checked ? 'Afgevinkt' : 'Vink af'}
      onPress={(e) => {
        e.preventDefault();
        checkItem({
          variables: { ingredientId: id, checked: !checked },
        });
      }}
    />
  );
}
