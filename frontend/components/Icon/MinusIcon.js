import * as React from 'react';

import { CircleIcon } from './CircleIcon';

export function MinusIcon(props) {
  return <CircleIcon name="remove" glyphSize={25} accessibilityLabel="Verwijderen" {...props} />;
}
