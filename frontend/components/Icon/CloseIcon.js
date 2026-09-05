import * as React from 'react';

import { CircleIcon } from './CircleIcon';

export function CloseIcon(props) {
  return (
    <CircleIcon name="close" glyphSize={22} pad={10} accessibilityLabel="Sluiten" {...props} />
  );
}
