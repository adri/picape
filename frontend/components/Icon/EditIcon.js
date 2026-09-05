import * as React from 'react';

import { CircleIcon } from './CircleIcon';

export function EditIcon(props) {
  return (
    <CircleIcon name="create-outline" glyphSize={20} accessibilityLabel="Bewerken" {...props} />
  );
}
