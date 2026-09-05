import * as React from 'react';

import { CircleIcon } from './CircleIcon';

export function PlusIcon(props) {
  return <CircleIcon name="add" glyphSize={25} accessibilityLabel="Toevoegen" {...props} />;
}
