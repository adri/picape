import * as React from 'react';
import renderer from 'react-test-renderer';

import { Badge } from '../components/Badge/Badge';

describe('Badge', () => {
  it('renders the amount', () => {
    const tree = renderer.create(<Badge amount={3} />).toJSON();
    expect(JSON.stringify(tree)).toContain('"children":["3"]');
  });
});
