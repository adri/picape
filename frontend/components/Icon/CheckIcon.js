import * as React from 'react';

import { CircleIcon } from './CircleIcon';

export function CheckIcon(props) {
  return (
    <CircleIcon name="checkmark" glyphSize={22} selected accessibilityLabel="Gedaan" {...props} />
  );
}
