import * as React from 'react';

import { CircleIcon } from './CircleIcon';

export function BackIcon(props) {
  return (
    <CircleIcon name="chevron-back" glyphSize={25} pad={10} accessibilityLabel="Terug" {...props} />
  );
}
