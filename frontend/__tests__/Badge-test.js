import * as React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';

import { Badge } from '../components/Badge/Badge';

// Rendered with react-dom because this app only ships web, and that is what
// react-native-web actually renders to. react-test-renderer's toJSON returns
// null for react-native-web output, and React 19 deprecates it anyway.
describe('Badge', () => {
  it('renders the amount', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    act(() => {
      createRoot(container).render(<Badge amount={3} />);
    });

    expect(container.textContent).toContain('3');
    container.remove();
  });
});
