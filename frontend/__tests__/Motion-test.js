import * as React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';

import SkeletonContent from '../components/Skeleton/SkeletonContent';
import { prefersReducedMotion } from '../constants/Motion';

jest.mock('../constants/Motion', () => ({
  ...jest.requireActual('../constants/Motion'),
  prefersReducedMotion: jest.fn(() => false),
}));

function render(element) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  act(() => {
    createRoot(container).render(element);
  });
  return container;
}

// react-native-web 0.21 compiles no @media rule, so the preference is read in
// JavaScript. The module reads it once at import, which is why these load it
// fresh rather than calling a setter.
describe('prefersReducedMotion', () => {
  const original = window.matchMedia;
  afterEach(() => {
    window.matchMedia = original;
    jest.resetModules();
  });

  const read = (matches) => {
    window.matchMedia = () => ({ matches, addEventListener() {}, removeEventListener() {} });
    jest.resetModules();
    return jest.requireActual('../constants/Motion').prefersReducedMotion();
  };

  it('follows the media query', () => {
    expect(read(true)).toBe(true);
    expect(read(false)).toBe(false);
  });

  it('assumes full motion where there is no media query to ask', () => {
    delete window.matchMedia;
    jest.resetModules();
    expect(jest.requireActual('../constants/Motion').prefersReducedMotion()).toBe(false);
  });
});

// The sweep is the app's only looping motion: it starts on its own, repeats for
// as long as the query takes, and travels across content the reader is trying
// to read. A reader who asked for less motion gets the bone standing still.
describe('SkeletonContent', () => {
  afterEach(() => prefersReducedMotion.mockReturnValue(false));

  it('sweeps a highlight across the bone by default', () => {
    const container = render(<SkeletonContent isLoading layout={[{ width: 100, height: 20 }]} />);
    expect(container.innerHTML).toContain('animation');
    container.remove();
  });

  it('leaves the bone still when the reader asked for less motion', () => {
    prefersReducedMotion.mockReturnValue(true);
    const container = render(<SkeletonContent isLoading layout={[{ width: 100, height: 20 }]} />);
    expect(container.innerHTML).not.toContain('animation');
    // And it is still a placeholder, not an empty box.
    expect(container.querySelector('div')).not.toBeNull();
    container.remove();
  });
});
